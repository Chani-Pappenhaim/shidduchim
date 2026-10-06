import { deleteFileAction } from "@/actions/candidate-files";
import type { CandidateFile } from "@/generated/prisma/client";
import { FILE_RULES, formatBytes } from "@/lib/files";
import { routes } from "@/lib/routes";
import { ConfirmSubmit } from "@/components/ui/confirm-submit";

export function CandidateFiles({ candidateId, files }: { candidateId: string; files: CandidateFile[] }) {
  if (files.length === 0) return <p className="text-sm text-muted">עוד לא הועלו קבצים</p>;
  return (
    <ul className="flex flex-col gap-2">
      {files.map((file) => (
        <li key={file.id} className="flex items-center justify-between gap-3 border-2 border-ink px-3 py-2">
          <a href={routes.file(file.id)} target="_blank" rel="noreferrer" className="min-w-0 hover:underline">
            <span className="block text-sm font-medium">{FILE_RULES[file.kind].label}</span>
            <span className="block truncate text-xs text-muted" dir="auto">
              {file.originalName} · {formatBytes(file.sizeBytes)}
            </span>
          </a>
          <form action={deleteFileAction.bind(null, candidateId, file.id)}>
            <ConfirmSubmit message="למחוק את הקובץ?" variant="ghost" size="sm" pendingLabel="…" aria-label={`מחיקת ${FILE_RULES[file.kind].label}`}>
              ✕
            </ConfirmSubmit>
          </form>
        </li>
      ))}
    </ul>
  );
}
