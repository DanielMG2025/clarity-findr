import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Users,
  Shield,
  Sparkles,
  Flag,
  Heart,
  MessageCircle,
  Database,
  CheckCircle2,
  Lock,
  Send,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES, storage } from "@/lib/fertility";

// ---------- Types ----------
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

type Discussion = {
  id: string;
  category: string;
  prompt: string;
  reply: string;
  age_band: string | null;
  country: string | null;
  created_at: string;
};

const AGE_BANDS = ["<25", "25-29", "30-34", "35-39", "40-44", "45+"];
const TREATMENTS = ["IVF", "Egg Donation", "Social Freezing", "ICSI", "Other"];
const CATEGORIES = [
  "Trying to conceive",
  "IVF journey",
  "Egg freezing",
  "Donor programs",
] as const;

const CATEGORY_PROMPTS: Record<(typeof CATEGORIES)[number], string[]> = {
  "Trying to conceive": [
    "When did you decide to seek help?",
    "What test surprised you most?",
  ],
  "IVF journey": ["What was your IVF cost?", "What surprised you most?"],
  "Egg freezing": ["Was it worth it for you?", "How many cycles did you do?"],
  "Donor programs": [
    "How did you choose your donor program?",
    "How long did matching take?",
  ],
};

// ---------- Schemas ----------
const storySchema = z.object({
  age_band: z.enum(["<25", "25-29", "30-34", "35-39", "40-44", "45+"]),
  country: z.string().min(2).max(60),
  treatment_type: z.enum(["IVF", "Egg Donation", "Social Freezing", "ICSI", "Other"]),
  clinic_name: z.string().trim().max(120).optional(),
  estimated_price: z.coerce.number().int().min(0).max(200000).optional(),
  outcome: z.string().max(40).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  story: z.string().trim().max(1500).optional(),
});

const replySchema = z.object({
  category: z.enum(CATEGORIES),
  prompt: z.string().min(2).max(200),
  reply: z.string().trim().min(2).max(1500),
});

// ---------- Trust labels ----------
const TrustLabel = ({ kind }: { kind: "verified" | "community" | "estimated" }) => {
  if (kind === "verified")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-soft text-accent border border-accent/40">
        <CheckCircle2 className="size-3" /> Verified
      </span>
    );
  if (kind === "community")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/30">
        <Users className="size-3" /> Community insight
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-muted text-muted-foreground border border-border">
      Estimated
    </span>
  );
};

// ---------- Page ----------
const Community = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [fAge, setFAge] = useState<string>("any");
  const [fTreatment, setFTreatment] = useState<string>("any");
  const [fCountry, setFCountry] = useState<string>("any");

  // contribution form
  const [submitting, setSubmitting] = useState(false);
  const [contributed, setContributed] = useState(storage.isUnlocked());

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: d }] = await Promise.all([
      supabase
        .from("community_stories")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("community_discussions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    setStories((s ?? []) as Story[]);
    setDiscussions((d ?? []) as Discussion[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredStories = useMemo(() => {
    return stories.filter(
      (s) =>
        (fAge === "any" || s.age_band === fAge) &&
        (fTreatment === "any" || s.treatment_type === fTreatment) &&
        (fCountry === "any" || s.country === fCountry),
    );
  }, [stories, fAge, fTreatment, fCountry]);

  const communityAvg = useMemo(() => {
    const prices = filteredStories
      .map((s) => s.estimated_price)
      .filter((p): p is number => typeof p === "number" && p > 0);
    if (!prices.length) return null;
    return Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
  }, [filteredStories]);

  // ---------- Submit story ----------
  const handleStorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = storySchema.safeParse({
      age_band: fd.get("age_band"),
      country: fd.get("country"),
      treatment_type: fd.get("treatment_type"),
      clinic_name: fd.get("clinic_name") || undefined,
      estimated_price: fd.get("estimated_price") || undefined,
      outcome: fd.get("outcome") || undefined,
      rating: fd.get("rating") || undefined,
      story: fd.get("story") || undefined,
    });
    if (!parsed.success) {
      toast.error("Please check your inputs", {
        description: parsed.error.issues[0]?.message,
      });
      return;
    }
    setSubmitting(true);
    const d = parsed.data;
    const { error } = await supabase.from("community_stories").insert([
      {
        age_band: d.age_band,
        country: d.country,
        treatment_type: d.treatment_type,
        clinic_name: d.clinic_name ?? null,
        estimated_price: d.estimated_price ?? null,
        outcome: d.outcome ?? null,
        rating: d.rating ?? null,
        story: d.story ?? null,
        is_verified: false,
        flagged: false,
      },
    ]);
    setSubmitting(false);
    if (error) {
      toast.error("Could not share your story", { description: error.message });
      return;
    }
    storage.unlock();
    setContributed(true);
    toast.success("Thank you 💙 Premium price ranges unlocked.", {
      description: "Your anonymous story will help others choose.",
    });
    (e.target as HTMLFormElement).reset();
    load();
  };

  // ---------- Submit reply ----------
  const handleReply = async (
    category: (typeof CATEGORIES)[number],
    prompt: string,
    text: string,
    onDone: () => void,
  ) => {
    const parsed = replySchema.safeParse({ category, prompt, reply: text });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Reply too short");
      return;
    }
    const { error } = await supabase.from("community_discussions").insert([
      { category, prompt, reply: parsed.data.reply, flagged: false },
    ]);
    if (error) {
      toast.error("Could not post", { description: error.message });
      return;
    }
    toast.success("Posted anonymously");
    onDone();
    load();
  };

  // ---------- Flag ----------
  const flagStory = async (id: string) => {
    // optimistic remove
    setStories((arr) => arr.filter((s) => s.id !== id));
    toast("Reported. Thanks for keeping the community safe.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* SECTION 1 — Entry */}
        <section className="bg-gradient-hero">
          <div className="container py-14">
            <div className="max-w-3xl">
              <Badge variant="secondary" className="rounded-full mb-3">
                <Users className="size-3 mr-1" /> Community
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                You are not alone.
              </h1>
              <p className="text-lg text-muted-foreground mt-3">
                Learn from others with similar journeys. Real prices, real outcomes,
                shared anonymously.
              </p>
              <p className="text-sm text-foreground/80 mt-4 italic">
                "This is not just a forum. This is real data from real journeys."
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                <TrustLabel kind="verified" />
                <TrustLabel kind="community" />
                <TrustLabel kind="estimated" />
              </div>
            </div>
          </div>
        </section>

        <section className="container py-10">
          <Tabs defaultValue="stories" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl mb-6">
              <TabsTrigger value="stories">
                <Heart className="size-4 mr-2" /> Stories
              </TabsTrigger>
              <TabsTrigger value="discussions">
                <MessageCircle className="size-4 mr-2" /> Discussions
              </TabsTrigger>
              <TabsTrigger value="contribute">
                <Sparkles className="size-4 mr-2" /> Contribute
              </TabsTrigger>
            </TabsList>

            {/* SECTION 2 — Anonymous stories */}
            <TabsContent value="stories" className="space-y-6">
              <Card className="p-5 grid md:grid-cols-4 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label>Age</Label>
                  <Select value={fAge} onValueChange={setFAge}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any age</SelectItem>
                      {AGE_BANDS.map((a) => (
                        <SelectItem key={a} value={a}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Treatment</Label>
                  <Select value={fTreatment} onValueChange={setFTreatment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any treatment</SelectItem>
                      {TREATMENTS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Select value={fCountry} onValueChange={setFCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any country</SelectItem>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg bg-primary-soft p-3 text-center">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Community average
                  </div>
                  <div className="text-2xl font-bold text-primary tabular-nums">
                    {communityAvg ? `€${communityAvg.toLocaleString()}` : "—"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {filteredStories.length} matching stor
                    {filteredStories.length === 1 ? "y" : "ies"}
                  </div>
                </div>
              </Card>

              {loading ? (
                <Card className="p-10 text-center text-muted-foreground">Loading…</Card>
              ) : filteredStories.length === 0 ? (
                <Card className="p-10 text-center text-muted-foreground">
                  No stories match these filters yet.
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredStories.map((s) => (
                    <Card key={s.id} className="p-5 bg-gradient-card border-2">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full">
                            {s.treatment_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {s.age_band} · {s.country}
                          </span>
                          {s.is_verified ? (
                            <TrustLabel kind="verified" />
                          ) : (
                            <TrustLabel kind="community" />
                          )}
                        </div>
                        <button
                          onClick={() => flagStory(s.id)}
                          className="text-muted-foreground hover:text-destructive transition-smooth"
                          title="Report"
                        >
                          <Flag className="size-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Clinic
                          </div>
                          <div className="text-sm font-semibold truncate">
                            {s.clinic_name ?? "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Price paid
                          </div>
                          <div className="text-sm font-bold text-primary tabular-nums">
                            {s.estimated_price
                              ? `€${s.estimated_price.toLocaleString()}`
                              : "—"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            Outcome
                          </div>
                          <div className="text-sm font-semibold capitalize">
                            {s.outcome?.replace(/_/g, " ") ?? "—"}
                          </div>
                        </div>
                      </div>

                      {s.story && (
                        <p className="text-sm text-foreground/85 leading-relaxed border-l-2 border-primary/30 pl-3 italic">
                          "{s.story}"
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* SECTION 3 — Structured discussions */}
            <TabsContent value="discussions" className="space-y-6">
              <Tabs defaultValue={CATEGORIES[0]}>
                <TabsList className="flex flex-wrap h-auto">
                  {CATEGORIES.map((c) => (
                    <TabsTrigger key={c} value={c}>
                      {c}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {CATEGORIES.map((cat) => (
                  <TabsContent key={cat} value={cat} className="space-y-6 mt-4">
                    {CATEGORY_PROMPTS[cat].map((prompt) => {
                      const replies = discussions.filter(
                        (d) => d.category === cat && d.prompt === prompt,
                      );
                      return (
                        <PromptBlock
                          key={prompt}
                          category={cat}
                          prompt={prompt}
                          replies={replies}
                          onReply={(text, done) => handleReply(cat, prompt, text, done)}
                        />
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>

            {/* SECTION 4 — Contribute / experience sharing */}
            <TabsContent value="contribute">
              <Card className="p-8 shadow-elegant bg-gradient-card border-2 max-w-3xl">
                <div className="mb-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">
                    Share your experience
                  </div>
                  <h3 className="text-2xl font-bold">
                    Help the next patient — share what you paid
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Anonymous by default. No name, email or phone needed. Your story
                    feeds the pricing engine and unlocks premium ranges for you.
                  </p>
                  {contributed && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-accent bg-accent-soft px-3 py-1.5 rounded-full font-semibold">
                      <CheckCircle2 className="size-3.5" /> Premium ranges unlocked
                    </div>
                  )}
                </div>

                <form onSubmit={handleStorySubmit} className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Age band</Label>
                    <Select name="age_band" defaultValue="30-34">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AGE_BANDS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {a}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Country</Label>
                    <Select name="country" defaultValue="Spain">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Treatment</Label>
                    <Select name="treatment_type" defaultValue="IVF">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TREATMENTS.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="clinic_name">Clinic (optional)</Label>
                    <Input id="clinic_name" name="clinic_name" maxLength={120} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="estimated_price">Total price paid (€)</Label>
                    <Input
                      id="estimated_price"
                      name="estimated_price"
                      type="number"
                      min={0}
                      max={200000}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Outcome</Label>
                    <Select name="outcome" defaultValue="in_progress">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pregnant">Pregnant</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="no_pregnancy">No pregnancy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Experience rating</Label>
                    <Select name="rating" defaultValue="5">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {"★".repeat(n)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="story">Your story (optional)</Label>
                    <Textarea
                      id="story"
                      name="story"
                      maxLength={1500}
                      placeholder="What did you wish you had known?"
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                      <Shield className="size-3.5" /> Anonymous · no personal data stored
                    </div>
                    <Button type="submit" variant="hero" size="lg" disabled={submitting}>
                      <Send className="size-4" />{" "}
                      {submitting ? "Sharing…" : "Share anonymously"}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* SECTION 5/6 — Trust + Safety */}
        <section className="container pb-14">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-5">
              <Shield className="size-5 text-accent mb-2" />
              <div className="font-bold mb-1">Anonymous by default</div>
              <p className="text-sm text-muted-foreground">
                We never ask for your name, email or phone. Stories are stripped of
                identifying details.
              </p>
            </Card>
            <Card className="p-5">
              <Flag className="size-5 text-warning mb-2" />
              <div className="font-bold mb-1">Moderation built in</div>
              <p className="text-sm text-muted-foreground">
                Anyone can flag a story or reply. Flagged content is hidden until
                reviewed.
              </p>
            </Card>
            <Card className="p-5">
              <Database className="size-5 text-primary mb-2" />
              <div className="font-bold mb-1">Feeds the data engine</div>
              <p className="text-sm text-muted-foreground">
                Every shared price improves our community averages and the price ranges
                shown to other patients.
              </p>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

// ---------- Prompt block ----------
const PromptBlock = ({
  category,
  prompt,
  replies,
  onReply,
}: {
  category: string;
  prompt: string;
  replies: Discussion[];
  onReply: (text: string, done: () => void) => void;
}) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {category}
          </div>
          <h3 className="text-lg font-bold">{prompt}</h3>
        </div>
        <Badge variant="secondary" className="rounded-full">
          {replies.length} repl{replies.length === 1 ? "y" : "ies"}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        {replies.length === 0 && (
          <div className="text-sm text-muted-foreground italic">
            Be the first to answer.
          </div>
        )}
        {replies.slice(0, 5).map((r) => (
          <div
            key={r.id}
            className="text-sm bg-muted/40 rounded-lg p-3 border border-border/60"
          >
            <p className="text-foreground/90">{r.reply}</p>
            <div className="text-[11px] text-muted-foreground mt-1">
              Anonymous · {r.age_band ?? "—"} · {r.country ?? "—"}
            </div>
          </div>
        ))}
      </div>

      {open ? (
        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1500}
            rows={3}
            placeholder="Share your answer anonymously…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() =>
                onReply(text, () => {
                  setText("");
                  setOpen(false);
                })
              }
            >
              <Send className="size-3.5" /> Post anonymously
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <MessageCircle className="size-3.5" /> Add your answer
        </Button>
      )}
    </Card>
  );
};

export default Community;
