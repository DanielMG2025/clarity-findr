import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, FileText } from "lucide-react";
import { useMasterRecord } from "@/modules/master-record";

const CATEGORY_LABEL: Record<string, string> = {
  quote: "Quote",
  lab: "Lab report",
  report: "Medical report",
  other: "Other",
};

export function DocumentsBlock() {
  const docs = useMasterRecord((s) => s.documents);
  const add = useMasterRecord((s) => s.addDocument);
  const remove = useMasterRecord((s) => s.removeDocument);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const name = f.name.toLowerCase();
      const cat = name.includes("quote") || name.includes("presupuesto") ? "quote"
        : name.includes("lab") || name.includes("amh") || name.includes("fsh") ? "lab"
        : "other";
      add({ name: f.name, size: f.size, category: cat as "quote" | "lab" | "other" });
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
        <Upload className="size-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Drop quotes, lab results or medical summaries. Filenames stay private to your session.
        </p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        <Button onClick={() => inputRef.current?.click()} variant="outline" size="sm">
          Choose files
        </Button>
      </div>
      {docs.length > 0 && (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="size-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{d.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">· {CATEGORY_LABEL[d.category]}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove(d.id)}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
