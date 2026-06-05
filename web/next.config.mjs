import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stylesPath = path.join(__dirname, "src/styles");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: [stylesPath],
    loadPaths: [stylesPath],
    // Make variables/mixins available in every SCSS file (incl. CSS Modules).
    additionalData: `@use "abstracts" as *;`,
  },
};

export default nextConfig;
