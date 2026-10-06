export function FormMessage({ message, tone = "error" }: { message?: string; tone?: "error" | "success" }) {
  if (!message) return null;
  return (
    <p role={tone === "error" ? "alert" : "status"} className={tone === "error" ? "bg-coral/20 px-3 py-2 text-sm" : "bg-lime px-3 py-2 text-sm"}>
      {message}
    </p>
  );
}
