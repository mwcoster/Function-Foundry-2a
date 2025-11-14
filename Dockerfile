# Stage 1: Build frontend and install dependencies
FROM node:22 AS builder

WORKDIR /app

# Install server dependencies first for caching
COPY server/package*.json ./server/
RUN cd server && npm install

# Copy root package.json and install frontend dependencies
COPY package*.json ./
RUN npm install

# Copy everything
COPY . ./

# Build frontend (assumes output goes to /dist)
RUN npm run build

# Stage 2: Final image
FROM node:22

WORKDIR /app

# Copy server files
COPY --from=builder /app/server ./server
# Copy built frontend assets
COPY --from=builder /app/dist ./dist
# Copy server node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules

EXPOSE 3000

# Run the server
CMD ["node", "server/server.js"]
