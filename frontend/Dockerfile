# Stage 1: Build the React application (matching local v24)
FROM node:24 as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Increase memory for the build process
ENV NODE_OPTIONS=--max-old-space-size=4096

# Pass build arguments for environment variables
ARG VITE_API_URL
ARG VITE_APP_NAME

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine

# Copy the built application from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config (now inside the frontend context)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
