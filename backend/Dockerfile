# Base stage for shared setup
FROM node:24-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache autoconf automake file g++ gcc libtool make nasm pkgconfig python3

# Development stage
FROM base AS development
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p uploads && chown -R node:node uploads && chmod 777 uploads
USER node
EXPOSE 5000
CMD ["node", "server.js"]
