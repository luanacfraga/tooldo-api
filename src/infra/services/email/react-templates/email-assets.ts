function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isHttpUrl(url: string | undefined): url is string {
  if (!url) {
    return false;
  }
  return /^https?:\/\//i.test(url);
}

/**
 * URL base do app (para links de CTA).
 * Ex.: https://app.tooldo.com
 */
export function getFrontendUrl(): string | undefined {
  const raw = process.env.FRONTEND_URL;
  if (!isHttpUrl(raw)) {
    return undefined;
  }
  return trimTrailingSlash(raw);
}

/**
 * URL base de assets para emails (logo/imagens).
 * Preferência:
 * 1) EMAIL_ASSETS_BASE_URL
 * 2) FRONTEND_URL
 */
export function getEmailAssetsBaseUrl(): string | undefined {
  const raw = process.env.EMAIL_ASSETS_BASE_URL;
  if (isHttpUrl(raw)) {
    return trimTrailingSlash(raw);
  }
  return getFrontendUrl();
}

/**
 * URL completa da logo utilizada no header do email.
 * Preferência:
 * 1) EMAIL_LOGO_URL (URL absoluta)
 * 2) `${EMAIL_ASSETS_BASE_URL}/images/logo.png` (ou FRONTEND_URL)
 */
export function getEmailLogoUrl(): string | undefined {
  const direct = process.env.EMAIL_LOGO_URL;
  if (isHttpUrl(direct)) {
    return direct;
  }

  const base = getEmailAssetsBaseUrl();
  if (!base) {
    return undefined;
  }
  return `${base}/images/logo.png`;
}
