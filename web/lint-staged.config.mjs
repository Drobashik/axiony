const config = {
  "*.{js,jsx,ts,tsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{scss,css,json,md,mdx,yml,yaml}": ["prettier --write"],
};

export default config;
