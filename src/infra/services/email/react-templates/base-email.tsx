import * as React from 'react';

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export type BaseEmailProps = {
  title: string;
  preheader: string;
  children: React.ReactNode;
  footerNote?: string;
};

export function BaseEmail(props: BaseEmailProps): React.ReactElement {
  const year = new Date().getFullYear();

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <title>{props.title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f3f4f6' }}>
        {/* Preheader (hidden) */}
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
          style={{ backgroundColor: '#f3f4f6', padding: '24px 12px' }}
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
                  style={{ width: 600, maxWidth: 600 as unknown as string }}
                >
                  <tbody>
                    <tr>
                      <td align="center" style={{ padding: '12px 0 16px 0' }}>
                        <div
                          style={{
                            fontFamily,
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#4F46E5',
                            letterSpacing: '-0.2px',
                          }}
                        >
                          Tooldo
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: 12,
                          padding: '28px 24px',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <div style={{ fontFamily, color: '#111827' }}>
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
                            color: '#6b7280',
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
                            © {year} Tooldo. Todos os direitos reservados.
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
                backgroundColor: '#4F46E5',
                color: '#ffffff',
                textDecoration: 'none',
                fontFamily,
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 18px',
                borderRadius: 10,
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
      : { bg: '#EFF6FF', border: '#60A5FA', text: '#1E3A8A' };

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
        color: '#6b7280',
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
      <span style={{ wordBreak: 'break-all', color: '#4F46E5' }}>
        {props.url}
      </span>
    </div>
  );
}


