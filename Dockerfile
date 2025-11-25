# ---------------- BUILD STAGE ----------------
FROM node:20 AS builder
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies for root
RUN npm install --legacy-peer-deps

# Install for each subproject
RUN cd neurovault && npm install --legacy-peer-deps
RUN cd neuropromptgallery && npm install --legacy-peer-deps
RUN cd neuroaicomparison && npm install --legacy-peer-deps

# 🩹 FIX pdf-parse broken test import
RUN sed -i "s/require('.\/test\/data\/05-versions-space.pdf');//g" node_modules/pdf-parse/index.js || true

# Build all apps (root + vite + next)
RUN npm run build

# ---------------- RUNTIME STAGE ----------------
FROM node:20

WORKDIR /app

# Copy server
COPY server.js .

# Copy build output (React + Vite + Next)
COPY --from=builder /app/build ./build

# Copy node_modules (backend deps)
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
