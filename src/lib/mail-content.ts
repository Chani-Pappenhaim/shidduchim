// Plain-text and RTL HTML bodies for emails built from simple sections of lines

export type MailLine = { text: string; href?: string };

export type MailSection = { title: string; lines: MailLine[] };

export type MailBody = { text: string; html: string };

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function lineHtml({ text, href }: MailLine): string {
  const content = escapeHtml(text);
  return href ? `<a href="${escapeHtml(href)}" style="color:#111">${content}</a>` : content;
}

export function renderMail(greeting: string, sections: MailSection[], footer: MailLine): MailBody {
  const text = [
    greeting,
    ...sections.flatMap((s) => ["", s.title, ...s.lines.map((l) => `- ${l.text}${l.href ? ` (${l.href})` : ""}`)]),
    "",
    footer.href ? `${footer.text}: ${footer.href}` : footer.text,
  ].join("\n");

  const html = `<div dir="rtl" lang="he" style="font-family:Arial,sans-serif;font-size:16px;color:#111;line-height:1.6">
<p>${escapeHtml(greeting)}</p>
${sections
  .map((s) => `<h3 style="margin:24px 0 8px">${escapeHtml(s.title)}</h3><ul style="padding-inline-start:20px;margin:0">${s.lines.map((l) => `<li>${lineHtml(l)}</li>`).join("")}</ul>`)
  .join("\n")}
<p style="margin-top:24px">${lineHtml(footer)}</p>
</div>`;

  return { text, html };
}
