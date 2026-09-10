import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createFaq, deleteFaq } from "./actions";

export default async function AdminFaqsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: faqs } = await supabase
    .from("faqs")
    .select("id, question, answer_md, status")
    .order("sort_order");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="text-section-head text-muted-foreground uppercase">Manage FAQs</p>

      <div className="mt-6 flex flex-col gap-4 pl-6">
        {faqs && faqs.length > 0 ? (
          faqs.map((f) => (
            <div key={f.id} className="border-border flex items-start justify-between gap-4 border-b pb-4">
              <div>
                <p className="text-body text-foreground">{f.question}</p>
                <p className="text-body text-muted-foreground mt-1 max-w-[60ch]">
                  {f.answer_md}
                </p>
                {f.status !== "published" ? (
                  <p className="text-flag text-muted-foreground mt-1">({f.status})</p>
                ) : null}
              </div>
              <form action={deleteFaq.bind(null, f.id)}>
                <button
                  type="submit"
                  className="text-flag text-destructive hover:text-destructive/80 shrink-0"
                >
                  delete
                </button>
              </form>
            </div>
          ))
        ) : (
          <p className="text-body text-muted-foreground">No FAQs yet.</p>
        )}
      </div>

      <div className="border-border mt-10 border pl-0">
        <div className="text-furniture text-muted-foreground border-border border-b px-4 py-2 tracking-wide">
          add new
        </div>
        <form action={createFaq} className="flex flex-col gap-3 px-4 py-6">
          <label htmlFor="question" className="text-flag text-muted-foreground">
            question:
          </label>
          <input
            id="question"
            name="question"
            required
            className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <label htmlFor="answer" className="text-flag text-muted-foreground mt-2">
            answer:
          </label>
          <textarea
            id="answer"
            name="answer"
            required
            rows={3}
            className="border-border bg-ink-950 text-foreground text-body px-3 py-2 focus:border-signal-500 focus:outline-none"
          />
          <button
            type="submit"
            className="border-border hover:border-signal-500 hover:text-signal-500 text-body text-foreground mt-2 self-start border px-4 py-2 transition-colors"
          >
            add FAQ →
          </button>
        </form>
      </div>
    </div>
  );
}
