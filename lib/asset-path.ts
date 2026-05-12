function normalizeBasePath(path?: string) {
  if (!path) {
    return "";
  }

  const withoutTrailingSlash = path.replace(/\/+$/, "");

  return withoutTrailingSlash.startsWith("/")
    ? withoutTrailingSlash
    : `/${withoutTrailingSlash}`;
}

export const siteBasePath = normalizeBasePath(
  process.env.NEXT_PUBLIC_BASE_PATH
);

export function assetPath(path: string) {
  if (!path || /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!siteBasePath || normalizedPath.startsWith(`${siteBasePath}/`)) {
    return normalizedPath;
  }

  return `${siteBasePath}${normalizedPath}`;
}
