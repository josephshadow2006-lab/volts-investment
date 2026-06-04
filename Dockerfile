FROM node:20-alpine AS builder
WORKDIR /app
COPY client/package*.json ./client/
COPY client/package-lock.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
COPY server ./
COPY --from=builder /app/client/dist ./client/dist
EXPOSE 4000
CMD ["node", "index.js"]
