# Use official Node.js image (matching local v24)
FROM node:24-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Use npm ci for a clean, predictable install
RUN npm ci --omit=dev

# Bundle app source
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chmod 777 uploads

# Expose port
EXPOSE 5000

# Start the application
CMD [ "node", "server.js" ]
