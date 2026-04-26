# Stage 1: Base & Dependencies
FROM node:24 AS base
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install

# Stage 2: Development (For local dev with HMR)
FROM base AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Stage 3: Build (For generating production assets)
FROM development AS build
ARG VITE_API_URL
ARG VITE_APP_NAME
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

# Stage 4: Production (Final Nginx image)
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
