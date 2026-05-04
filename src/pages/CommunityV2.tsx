import { useEffect, useMemo, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUp, MessageSquare, Wallet, ShieldCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { TransparencyBlock } from "@/components/shared/TransparencyBlock";

type Discussion = {
  id: string;
  category: string;
  prompt: string;
  reply: string;
  age_band: string | null;
  country: string | null;
  created_at: string;
};

type Story = {
  id: string;
  age_band: string;
  country: string;
  treatment_type: string;
  clinic_name: string | null;
  estimated_price: number | null;
  outcome: string | null;
  story: string | null;
  rating: number | null;
  is_verified: boolean;
  created_at: string;
};

const CATEGORIES = ["Trying to conceive", "IVF journey", "Egg freezing", "Donor programs"];
const TREATMENTS = ["IVF", "ICSI", "Egg Donation", "Social Freezing", "Other"];
const AGE_BANDS = ["<25", "25-29", "30-34", "35-39", "40-44", "45+"];
const COUNTRIES = ["Spain", "Czech Republic", "Portugal", "Greece", "UK", "Other"];

function useVotes() {
  const [votes, setVotes] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("community_votes") || "{}"); } catch { return {}; }
  });
  const upvote = (id: string) => {
    setVotes((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      localStorage.setItem("community_votes", JSON.stringify(next));
      return next;
    });
  };
  return { votes, upvote };
}

const CommunityV2 = () => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTreatment, setFilterTreatment] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [askOpen, setAskOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { votes, upvote } = useVotes();

  // Ask form
  const [askCategory, setAskCategory] = useState(CATEGORIES[0]);
  const [askPrompt, setAskPrompt] = useState("");
  const [askReply, setAskReply] = useState("");
  const [askCountry, setAskCountry] = useState<string>("Spain");
  const [askAge, setAskAge] = useState<string>("30-34");

  // Share form
  const [shareTreatment, setShareTreatment] = useState("IVF");
  const [shareCountry, setShareCountry] = useState("Spain");
  const [shareAge, setShareAge] = useState("30-34");
  const [sharePrice, setSharePrice] = useState<number | "">("");
  const [shareClinic, setShareClinic] = useState("");
  const [shareStory, setShareStory] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: d }, { data: s }] = await Promise.all([
      supabase.from("community_discussions").select("*").eq("flagged", false).order("created_at", { ascending: false }).limit(100),
      supabase.from("community_stories").select("*").eq("flagged", false).order("created_at", { ascending: false }).limit(100),
    ]);
    setDiscussions((d ?? []) as Discussion[]);
    setStories((s ?? []) as Story[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredDiscussions = useMemo(() => discussions.filter((d) => {
    if (filterAge !== "all" && d.age_band !== filterAge) return false;
    if (filterCountry !== "all" && d.country !== filterCountry) return false;
    return true;
  }).sort((a, b) => (votes[b.id] ?? 0) - (votes[a.id] ?? 0)), [discussions, filterAge, filterCountry, votes]);

  const filteredStories = useMemo(() => stories.filter((s) => {
    if (filterTreatment !== "all" && s.treatment_type !== filterTreatment) return false;
    if (filterAge !== "all" && s.age_band !== filterAge) return false;
    if (filterCountry !== "all" && s.country !== filterCountry) return false;
    return true;
  }), [stories, filterTreatment, filterAge, filterCountry]);

  const submitAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (askPrompt.length < 5 || askReply.length < 2) return toast.error("Please fill out your question and answer.");
    const { error } = await supabase.from("community_discussions").insert({
      category: askCategory, prompt: askPrompt, reply: askReply,
      country: askCountry, age_band: askAge, flagged: false,
    });
    if (error) return toast.error(error.message);
    toast.success("Posted to the community.");
    setAskOpen(false); setAskPrompt(""); setAskReply("");
    load();
  };

  const submitShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("community_stories").insert({
      treatment_type: shareTreatment, country: shareCountry, age_band: shareAge,
      clinic_name: shareClinic || null,
      estimated_price: sharePrice === "" ? null : Number(sharePrice),
      story: shareStory || null,
      rating: null, outcome: null, is_verified: false, flagged: false,
    });
    if (error) return toast.error(error.message);
    toast.success("Thanks for sharing.");
    setShareOpen(false); setShareClinic(""); setSharePrice(""); setShareStory("");
    load();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <section className="bg-gradient-hero">
        <div className="container py-12 max-w-4xl">
          <Badge variant="secondary" className="bg-primary-soft text-primary border-primary/20">Community</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mt-3">People like you, asking real questions</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Anonymous Q&A, real prices, and clinic experiences from patients across Europe. No ads, no medical advice.
          </p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Button onClick={() => setAskOpen(!askOpen)}><Plus className="size-4" /> Ask the community</Button>
            <Button variant="outline" onClick={() => setShareOpen(!shareOpen)}><Wallet className="size-4" /> Share a price</Button>
          </div>
        </div>
      </section>

      <main className="container max-w-5xl py-10 space-y-6">
        {/* Filters */}
        <Card className="p-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold">Filter:</span>
          <Select value={filterTreatment} onValueChange={setFilterTreatment}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Treatment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All treatments</SelectItem>
              {TREATMENTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterAge} onValueChange={setFilterAge}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Age" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ages</SelectItem>
              {AGE_BANDS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </Card>

        {/* Ask form */}
        {askOpen && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Ask a question</h3>
            <form onSubmit={submitAsk} className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={askCategory} onValueChange={setAskCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Country</Label>
                  <Select value={askCountry} onValueChange={setAskCountry}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Age</Label>
                  <Select value={askAge} onValueChange={setAskAge}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AGE_BANDS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="md:col-span-2"><Label>Your question</Label><Input value={askPrompt} onChange={(e) => setAskPrompt(e.target.value)} placeholder="What's a fair price for IVF in Czech Republic?" /></div>
              <div className="md:col-span-2"><Label>Add context (your own answer / what you know)</Label><Textarea value={askReply} onChange={(e) => setAskReply(e.target.value)} placeholder="What you've heard, your experience, etc." /></div>
              <div className="md:col-span-2"><Button type="submit">Post</Button></div>
            </form>
          </Card>
        )}

        {/* Share form */}
        {shareOpen && (
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Share a clinic price you received</h3>
            <form onSubmit={submitShare} className="grid md:grid-cols-3 gap-3">
              <div><Label>Treatment</Label><Select value={shareTreatment} onValueChange={setShareTreatment}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TREATMENTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Country</Label><Select value={shareCountry} onValueChange={setShareCountry}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Age</Label><Select value={shareAge} onValueChange={setShareAge}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AGE_BANDS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Clinic (optional)</Label><Input value={shareClinic} onChange={(e) => setShareClinic(e.target.value)} placeholder="IVI Barcelona" /></div>
              <div><Label>Estimated total (€)</Label><Input type="number" value={sharePrice} onChange={(e) => setSharePrice(e.target.value === "" ? "" : Number(e.target.value))} placeholder="7800" /></div>
              <div className="md:col-span-3"><Label>Notes (optional)</Label><Textarea value={shareStory} onChange={(e) => setShareStory(e.target.value)} placeholder="What was included, what wasn't, your experience…" /></div>
              <div className="md:col-span-3"><Button type="submit">Share anonymously</Button></div>
            </form>
          </Card>
        )}

        <Tabs defaultValue="qa">
          <TabsList>
            <TabsTrigger value="qa"><MessageSquare className="size-4" /> Questions</TabsTrigger>
            <TabsTrigger value="prices"><Wallet className="size-4" /> Shared prices</TabsTrigger>
          </TabsList>

          <TabsContent value="qa" className="space-y-3 mt-4">
            {loading && <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>}
            {!loading && filteredDiscussions.length === 0 && (
              <Card className="p-6 text-sm text-muted-foreground">No questions yet for these filters.</Card>
            )}
            {filteredDiscussions.map((d) => (
              <Card key={d.id} className="p-5 flex gap-4">
                <button onClick={() => upvote(d.id)} className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-smooth shrink-0">
                  <ArrowUp className="size-5" />
                  <span className="text-xs font-bold tabular-nums">{votes[d.id] ?? 0}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="secondary">{d.category}</Badge>
                    {d.country && <Badge variant="outline">{d.country}</Badge>}
                    {d.age_band && <Badge variant="outline">{d.age_band}</Badge>}
                  </div>
                  <div className="font-semibold">{d.prompt}</div>
                  <p className="text-sm text-muted-foreground mt-1">{d.reply}</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="prices" className="space-y-3 mt-4">
            {loading && <Card className="p-6 text-sm text-muted-foreground">Loading…</Card>}
            {!loading && filteredStories.length === 0 && (
              <Card className="p-6 text-sm text-muted-foreground">No shared prices yet for these filters.</Card>
            )}
            {filteredStories.map((s) => (
              <Card key={s.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge>{s.treatment_type}</Badge>
                  <Badge variant="outline">{s.country}</Badge>
                  <Badge variant="outline">{s.age_band}</Badge>
                  {s.is_verified && <Badge className="bg-accent text-accent-foreground"><ShieldCheck className="size-3" /> Verified</Badge>}
                </div>
                <div className="flex flex-wrap items-baseline gap-3">
                  {s.clinic_name && <div className="font-semibold">{s.clinic_name}</div>}
                  {s.estimated_price && <div className="text-2xl font-bold text-primary tabular-nums">€{s.estimated_price.toLocaleString()}</div>}
                </div>
                {s.story && <p className="text-sm text-muted-foreground mt-2">{s.story}</p>}
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <TransparencyBlock variant="data">
          Posts are anonymous. We never link them to your identity. Reports are reviewed by our team. Up-votes
          are stored locally on your device — no account needed.
        </TransparencyBlock>
      </main>

      <SiteFooter />
    </div>
  );
};

export default CommunityV2;
