# Base image with Node.js 20.x
FROM node:20.11.1-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-install-recommends --update \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/cache/apk/*

# Development stage
FROM base AS development

# Set environment variables
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install additional development dependencies
RUN npm install --legacy-peer-deps \
    @babel/plugin-transform-react-jsx \
    @babel/plugin-transform-runtime \
    @babel/preset-react

# Copy the rest of the application
COPY . .

# Expose ports (Vite default port is 5173, but we're using 3001)
EXPOSE 3001 9229

# Start development server with host flag to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3001"]

# Production stage
FROM base AS production

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

# Expose port
EXPOSE 3001

# Command to run the application
CMD ["serve", "-s", "dist", "-l", "3001"]
