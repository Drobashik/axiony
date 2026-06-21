FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

COPY cli/package*.json ./cli/
RUN npm --prefix cli ci

COPY cli ./cli
RUN npm --prefix cli run build

COPY scanner ./scanner
RUN npm --prefix scanner run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

EXPOSE 4000

CMD ["node", "scanner/dist/server.js"]
