function normalizeBasePath(path?: string) {
  if (!path) {
    return "";
  }

  const withoutTrailingSlash = path.replace(/\/+$/, "");

  return withoutTrailingSlash.startsWith("/")
    ? withoutTrailingSlash
    : `/${withoutTrailingSlash}`;
}

function githubPagesBasePath() {
  if (process.env.GITHUB_ACTIONS !== "true") {
    return "";
  }

  const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];

  return repositoryName ? `/${repositoryName}` : "";
}

export const siteBasePath = normalizeBasePath(
  process.env.NEXT_PUBLIC_BASE_PATH ?? githubPagesBasePath()
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
