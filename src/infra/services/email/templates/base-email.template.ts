type BaseEmailLayoutParams = {
  /** Used in <title> and as the main heading (h1-like) inside the email body */
  title: string;
  /** Hidden preview text shown in some inboxes (Gmail/Apple Mail) */
  preheader: string;
  /** Main content HTML (already escaped where needed) */
  bodyHtml: string;
  /** Optional footer note (plain text, will be escaped) */
  footerNote?: string;
};

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderBaseEmailLayout(params: BaseEmailLayoutParams): string {
  const year = new Date().getFullYear();
  const title = escapeHtml(params.title);
  const preheader = escapeHtml(params.preheader);
  const footerNote = params.footerNote ? escapeHtml(params.footerNote) : null;

  // Table-based layout for better compatibility (Outlook, etc.).
  // Keep most styles inline to reduce reliance on <style> support.
  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <meta name="supported-color-schemes" content="light dark" />
    <title>${title}</title>
  </head>
  <body style="margin:0; padding:0; background:#f3f4f6;">
    <!-- Preheader (hidden) -->
    <div style="display:none; font-size:1px; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
      ${preheader}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6; padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:600px;">
            <tr>
              <td align="center" style="padding:12px 0 16px 0;">
                <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:22px; font-weight:800; color:#4F46E5; letter-spacing:-0.2px;">
                  Tooldo
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#ffffff; border-radius:12px; padding:28px 24px; border:1px solid #e5e7eb;">
                <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#111827;">
                  <div style="font-size:20px; font-weight:800; line-height:1.25; margin:0 0 14px 0;">
                    ${title}
                  </div>

                  ${params.bodyHtml}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 8px 0 8px;">
                <div style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#6b7280; font-size:12px; line-height:1.5; text-align:center;">
                  ${footerNote ? `<div style="margin:0 0 10px 0;">${footerNote}</div>` : ''}
                  <div style="margin:0;">© ${year} Tooldo. Todos os direitos reservados.</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

export function renderPrimaryButton(params: {
  href: string;
  label: string;
}): string {
  const href = params.href; // keep raw to preserve URL
  const label = escapeHtml(params.label);

  // Use <a> with inline styles; avoid :hover for email-client compatibility.
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 10px 0;">
  <tr>
    <td align="center">
      <a
        href="${href}"
        target="_blank"
        rel="noreferrer"
        style="display:inline-block; background:#4F46E5; color:#ffffff; text-decoration:none; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; font-weight:700; padding:12px 18px; border-radius:10px;"
      >
        ${label}
      </a>
    </td>
  </tr>
</table>
  `.trim();
}

export function renderCallout(params: {
  variant: 'info' | 'warning';
  html: string;
}): string {
  const styles =
    params.variant === 'warning'
      ? {
          bg: '#FFFBEB',
          border: '#F59E0B',
          text: '#92400E',
        }
      : {
          bg: '#EFF6FF',
          border: '#60A5FA',
          text: '#1E3A8A',
        };

  return `
<div style="margin:14px 0; padding:12px 12px; background:${styles.bg}; border:1px solid ${styles.border}; border-left:4px solid ${styles.border}; border-radius:10px; color:${styles.text}; font-size:13px; line-height:1.5;">
  ${params.html}
</div>
  `.trim();
}

export function renderMutedText(html: string): string {
  return `
<div style="margin:14px 0 0 0; color:#6b7280; font-size:12px; line-height:1.6;">
  ${html}
</div>
  `.trim();
}
