import { initials } from "@/lib/candidates";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

type Props = {
  candidate: { firstName: string; lastName: string };
  photoId?: string | null;
  className?: string;
};

// Candidate photo, or large initials when no photo was uploaded
export function CandidateAvatar({ candidate, photoId, className }: Props) {
  return (
    <div className={cn("relative aspect-[4/5] overflow-hidden bg-mist", className)}>
      {photoId ? (
        // Served from an authenticated route, so the image optimizer cannot fetch it
        // eslint-disable-next-line @next/next/no-img-element
        <img src={routes.file(photoId)} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span aria-hidden className="absolute inset-0 grid place-items-center font-display text-7xl text-ink/25">
          {initials(candidate)}
        </span>
      )}
    </div>
  );
}
