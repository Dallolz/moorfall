FROM node:22-slim
WORKDIR /app
COPY server/package.json server/package-lock.json server/
RUN cd server && npm ci --omit=dev
COPY server/src server/src
COPY index.html .
COPY js js
COPY css css
ENV NODE_ENV=production PORT=8787 DB_PATH=/data/moorfall.db
EXPOSE 8787
CMD ["node", "server/src/main.js"]
