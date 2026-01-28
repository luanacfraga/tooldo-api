function trimTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isHttpUrl(url: string | undefined): url is string {
  if (!url) {
    return false;
  }
  return /^https?:\/\//i.test(url);
}

export function getFrontendUrl(): string | undefined {
  const raw = process.env.FRONTEND_URL;
  if (!isHttpUrl(raw)) {
    return undefined;
  }
  return trimTrailingSlash(raw);
}

export function getEmailAssetsBaseUrl(): string | undefined {
  const raw = process.env.EMAIL_ASSETS_BASE_URL;
  if (isHttpUrl(raw)) {
    return trimTrailingSlash(raw);
  }
  return getFrontendUrl();
}

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
