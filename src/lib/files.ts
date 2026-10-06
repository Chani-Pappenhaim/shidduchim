import type { FileKind } from "@/generated/prisma/enums";

const MB = 1024 * 1024;

// Upload rules per file kind, shared by the upload form and server-side validation
export const FILE_RULES: Record<FileKind, { label: string; mimeTypes: string[]; maxBytes: number }> = {
  PHOTO: {
    label: "תמונה",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    maxBytes: 5 * MB,
  },
  RESUME: {
    label: "קובץ רזומה",
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ],
    maxBytes: 10 * MB,
  },
};

export const MAX_UPLOAD_BYTES = Math.max(...Object.values(FILE_RULES).map((r) => r.maxBytes));

export function formatBytes(bytes: number): string {
  return bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}
