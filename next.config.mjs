/** @type {import('next').NextConfig} */
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  ...(configuredBasePath
    ? {
        basePath: configuredBasePath,
        assetPrefix: `${configuredBasePath}/`,
      }
    : {}),
  ...(isGitHubActions
    ? {
        output: "export",
        trailingSlash: true,
      }
    : {}),
  devIndicators: false,
  allowedDevOrigins: ["127.0.0.1"],
  env: {
    NEXT_PUBLIC_BASE_PATH: configuredBasePath,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
