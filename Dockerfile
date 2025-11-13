FROM node:20-alpine AS builder
WORKDIR /app

# Copy everything
COPY . .

# Install root deps (use install, not ci)
RUN npm install --legacy-peer-deps

# Install deps for each subproject
RUN cd neurovault && npm install --legacy-peer-deps
RUN cd neuropromptgallery && npm install --legacy-peer-deps
RUN cd neuroaicomparison && npm install --legacy-peer-deps

# Build everything
RUN npm run build

# -------- Production --------
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/build ./build
COPY server.js .

EXPOSE 3000
CMD ["node", "server.js"]
