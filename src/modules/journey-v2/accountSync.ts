// Browser ↔ account for the journey answers. With no session nothing leaves the
// browser. On sign-in the two are reconciled with `planAccountSync`; afterwards
// every change is saved to the account (debounced). Example cases are never saved.
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMasterRecord } from "@/modules/master-record/store";
import { useExampleCaseStore } from "@/modules/master-record/exampleCase";
import type { Json } from "@/integrations/supabase/types";
import { useBasics } from "./basics";
import { applySnapshot, bindAnswers, localSnapshot, planAccountSync, type AnswersSnapshot } from "./answers";

const NOTICE = {
  "used-browser": { es: "Tu cuenta tenía respuestas distintas: hemos usado las más recientes, las de este navegador.", en: "Your account had different answers: we used the most recent ones, from this browser." },
  "used-account": { es: "Tu cuenta tenía respuestas distintas: hemos usado las más recientes, las de tu cuenta.", en: "Your account had different answers: we used the most recent ones, from your account." },
} as const;

export async function pushAnswers(userId: string, s: AnswersSnapshot) {
  await supabase.from("journey_answers").upsert({
    user_id: userId, basics: s.basics as unknown as Json, case_record: s.case_record as unknown as Json,
    answered_at: new Date(s.answered_at || Date.now()).toISOString(),
  }, { onConflict: "user_id" });
}

export async function fetchAnswers(userId: string): Promise<AnswersSnapshot | null | "error"> {
  const { data, error } = await supabase.from("journey_answers").select("basics, case_record, answered_at").eq("user_id", userId).maybeSingle();
  if (error) return "error";
  if (!data) return null;
  return { basics: (data.basics ?? {}) as AnswersSnapshot["basics"], case_record: (data.case_record ?? {}) as AnswersSnapshot["case_record"], answered_at: Date.parse(data.answered_at) || 0 };
}

/** Reconcile once for a signed-in user; returns the notice shown, if any. */
export async function reconcile(userId: string): Promise<keyof typeof NOTICE | null> {
  const remote = await fetchAnswers(userId);
  if (remote === "error") return null;
  const local = localSnapshot();
  const plan = planAccountSync(local, remote);
  if (plan.action === "pull" && remote) applySnapshot(remote);
  if (plan.action === "push") await pushAnswers(userId, local);
  return plan.notice;
}

/** Mounted once in the app: binds the two stores and, with a session, keeps the account in step. */
export function useJourneyAnswers() {
  useEffect(() => bindAnswers(), []);
  useEffect(() => {
    let userId: string | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ready = false;
    const schedule = () => {
      if (!userId || !ready || useExampleCaseStore.getState().key) return;
      clearTimeout(timer);
      const id = userId;
      timer = setTimeout(() => { void pushAnswers(id, localSnapshot()); }, 1200);
    };
    const start = async (id: string | null) => {
      if (id === userId) return;
      userId = id; ready = false;
      if (!id) return;
      const notice = await reconcile(id);
      if (userId !== id) return;
      ready = true;
      if (notice) toast(NOTICE[notice][document.documentElement.lang === "es" ? "es" : "en"]);
    };
    void supabase.auth.getSession().then(({ data }) => start(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { void start(session?.user.id ?? null); });
    const offB = useBasics.subscribe(schedule);
    const offC = useMasterRecord.subscribe(schedule);
    return () => { sub.subscription.unsubscribe(); offB(); offC(); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
