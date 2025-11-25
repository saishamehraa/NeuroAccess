# ---------------- BUILD ----------------
FROM node:20 AS builder
WORKDIR /app

COPY . .

# Install deps
RUN npm install --legacy-peer-deps
RUN cd neurovault && npm install --legacy-peer-deps
RUN cd neuropromptgallery && npm install --legacy-peer-deps
RUN cd neuroaicomparison && npm install --legacy-peer-deps

# Apply patch
COPY patches ./patches
RUN npm install patch-package --legacy-peer-deps && npx patch-package

# Build
RUN npm run build

# ---------------- RUNTIME ----------------
FROM node:20
WORKDIR /app

COPY server.js .
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
