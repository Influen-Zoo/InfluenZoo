# Base stage for shared setup
FROM node:24-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p uploads && chmod 777 uploads
EXPOSE 5000
CMD ["node", "server.js"]
