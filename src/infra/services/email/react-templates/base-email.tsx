import * as React from 'react';

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const BRAND = {
  name: 'ToolDo',
  primary: '#554B7F', // brand purple
  secondary: '#0D9488', // teal
  bg: '#f3f4f6',
  surface: '#ffffff',
  border: '#e5e7eb',
  text: '#111827',
  muted: '#6b7280',
} as const;

function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function getFrontendUrl(): string | undefined {
  const raw = process.env.FRONTEND_URL;
  if (!raw) {
    return undefined;
  }
  if (!/^https?:\/\//i.test(raw)) {
    return undefined;
  }
  return trimTrailingSlash(raw);
}

function getLogoUrl(): string | undefined {
  const baseUrl = getFrontendUrl();
  if (!baseUrl) {
    return undefined;
  }
  // `tooldo-app/public/images/logo.png`
  return `${baseUrl}/images/logo.png`;
}

export type BaseEmailProps = {
  title: string;
  preheader: string;
  children: React.ReactNode;
  footerNote?: string;
};

export function BaseEmail(props: BaseEmailProps): React.ReactElement {
  const year = new Date().getFullYear();
  const baseUrl = getFrontendUrl();
  const logoUrl = getLogoUrl();

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <title>{props.title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: BRAND.bg }}>
        <div
          style={{
            display: 'none',
            fontSize: 1,
            lineHeight: '1px',
            maxHeight: 0,
            maxWidth: 0,
            opacity: 0,
            overflow: 'hidden',
          }}
        >
          {props.preheader}
        </div>

        <table
          role="presentation"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          width="100%"
          style={{ backgroundColor: BRAND.bg, padding: '24px 12px' }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  width={600}
                  style={{ width: 600, maxWidth: 600 }}
                >
                  <tbody>
                    <tr>
                      <td align="center" style={{ padding: '12px 0 16px 0' }}>
                        {logoUrl ? (
                          <a
                            href={baseUrl ?? undefined}
                            target={baseUrl ? '_blank' : undefined}
                            rel={baseUrl ? 'noreferrer' : undefined}
                            style={{
                              display: 'inline-block',
                              textDecoration: 'none',
                            }}
                          >
                            <img
                              src={logoUrl}
                              width={160}
                              height={52}
                              alt={BRAND.name}
                              style={{
                                display: 'block',
                                width: 160,
                                height: 'auto',
                                maxWidth: '100%',
                                border: 0,
                                outline: 'none',
                                textDecoration: 'none',
                              }}
                            />
                          </a>
                        ) : (
                          <div
                            style={{
                              fontFamily,
                              fontSize: 22,
                              fontWeight: 800,
                              color: BRAND.primary,
                              letterSpacing: '-0.2px',
                            }}
                          >
                            {BRAND.name}
                          </div>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          backgroundColor: BRAND.surface,
                          borderRadius: 12,
                          padding: '28px 24px',
                          border: `1px solid ${BRAND.border}`,
                          borderTop: `4px solid ${BRAND.primary}`,
                        }}
                      >
                        <div style={{ fontFamily, color: BRAND.text }}>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              lineHeight: 1.25,
                              margin: '0 0 14px 0',
                            }}
                          >
                            {props.title}
                          </div>

                          {props.children}
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style={{ padding: '16px 8px 0 8px' }}>
                        <div
                          style={{
                            fontFamily,
                            color: BRAND.muted,
                            fontSize: 12,
                            lineHeight: 1.5,
                            textAlign: 'center',
                          }}
                        >
                          {props.footerNote ? (
                            <div style={{ margin: '0 0 10px 0' }}>
                              {props.footerNote}
                            </div>
                          ) : null}
                          <div style={{ margin: 0 }}>
                            © {year} {BRAND.name}. Todos os direitos reservados.
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function PrimaryButton(props: {
  href: string;
  label: string;
}): React.ReactElement {
  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ margin: '18px 0 10px 0', width: '100%' }}
    >
      <tbody>
        <tr>
          <td align="center">
            <a
              href={props.href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: BRAND.primary,
                color: '#ffffff',
                textDecoration: 'none',
                fontFamily,
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 18px',
                borderRadius: 10,
                border: `1px solid ${BRAND.primary}`,
              }}
            >
              {props.label}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function Callout(props: {
  variant: 'info' | 'warning';
  children: React.ReactNode;
}): React.ReactElement {
  const styles =
    props.variant === 'warning'
      ? { bg: '#FFFBEB', border: '#F59E0B', text: '#92400E' }
      : { bg: '#EFF6FF', border: '#3B82F6', text: '#1E3A8A' };

  return (
    <div
      style={{
        margin: '14px 0',
        padding: '12px 12px',
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: 10,
        color: styles.text,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {props.children}
    </div>
  );
}

export function MutedText(props: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      style={{
        margin: '14px 0 0 0',
        color: BRAND.muted,
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      {props.children}
    </div>
  );
}

export function FallbackLink(props: { url: string }): React.ReactElement {
  return (
    <div style={{ margin: '14px 0 0 0', fontSize: 13, lineHeight: 1.6 }}>
      Se o botão não funcionar, copie e cole este link no navegador:
      <br />
      <span style={{ wordBreak: 'break-all', color: BRAND.primary }}>
        {props.url}
      </span>
    </div>
  );
}
