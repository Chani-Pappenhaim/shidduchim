import { getMatchmakerId } from "@/server/auth/session";
import { readCandidateFile } from "@/server/services/candidate-file-service";

// Serves a candidate file to its owning matchmaker only
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const matchmakerId = await getMatchmakerId();
  if (!matchmakerId) return new Response("Unauthorized", { status: 401 });

  const result = await readCandidateFile(matchmakerId, (await params).id);
  if (!result) return new Response("Not found", { status: 404 });

  const { file, data } = result;
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(data.length),
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
