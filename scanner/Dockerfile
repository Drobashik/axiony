FROM node:24-bookworm-slim

WORKDIR /app

COPY cli/package*.json ./cli/
RUN npm --prefix cli ci

COPY cli ./cli
RUN npm --prefix cli run build
RUN npx --prefix cli playwright install --with-deps chromium

COPY scanner ./scanner
RUN npm --prefix scanner run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

EXPOSE 4000

CMD ["node", "scanner/dist/server.js"]
