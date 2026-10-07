const PLACEHOLDER_CARDS = 8;

// Shown at once on navigation while the next page loads its data
export default function WorkspaceLoading() {
  return (
    <div role="status" aria-label="טוען" className="animate-shimmer">
      <div className="mb-8 border-b-2 border-ink pb-5">
        <div className="h-16 w-64 bg-mist md:h-20" />
        <div className="mt-3 h-4 w-48 bg-mist" />
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: PLACEHOLDER_CARDS }, (_, i) => (
          <div key={i} className="aspect-[4/5] border-2 border-line bg-mist" />
        ))}
      </div>
    </div>
  );
}
