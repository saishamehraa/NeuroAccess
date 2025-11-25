# ---------------- BUILD STAGE ----------------
FROM node:20 AS builder
WORKDIR /app

# Copy everything
COPY . .

# Install root deps
RUN npm install --legacy-peer-deps

# Remove pdf-parse test block at root
RUN sed -i "/for testing purpose/,/}\)/d" node_modules/pdf-parse/index.js || true

# Install subproject deps and patch each
RUN cd neurovault && npm install --legacy-peer-deps && \
    sed -i "/for testing purpose/,/}\)/d" ../node_modules/pdf-parse/index.js || true

RUN cd neuropromptgallery && npm install --legacy-peer-deps && \
    sed -i "/for testing purpose/,/}\)/d" ../node_modules/pdf-parse/index.js || true

RUN cd neuroaicomparison && npm install --legacy-peer-deps && \
    sed -i "/for testing purpose/,/}\)/d" ../node_modules/pdf-parse/index.js || true

# Build all apps
RUN npm run build

# ---------------- RUNTIME ----------------
FROM node:20
WORKDIR /app

COPY server.js .
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
