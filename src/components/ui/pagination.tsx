import Link from "next/link";
import { buttonStyles } from "./button-styles";

export function Pagination({ page, pageCount, hrefFor }: { page: number; pageCount: number; hrefFor: (page: number) => string }) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="דפדוף" className="mt-10 flex items-center justify-center gap-3">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className={buttonStyles("secondary", "sm")}>
          → הקודם
        </Link>
      )}
      <span className="text-sm text-muted">
        עמוד {page} מתוך {pageCount}
      </span>
      {page < pageCount && (
        <Link href={hrefFor(page + 1)} className={buttonStyles("secondary", "sm")}>
          הבא ←
        </Link>
      )}
    </nav>
  );
}
