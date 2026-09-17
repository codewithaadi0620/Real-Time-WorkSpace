FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and database migrations/seeds
COPY . .

# Expose port
EXPOSE 5000

# Start production node process
CMD ["node", "src/server.js"]
