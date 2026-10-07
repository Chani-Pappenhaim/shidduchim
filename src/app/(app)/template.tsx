// Remounts on every navigation, so each page rises in as it opens
export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-rise">{children}</div>;
}
