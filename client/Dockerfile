FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Expose Vite dev port
EXPOSE 5173

# Run Vite dev server accessible across Docker network
CMD ["npm", "run", "dev", "--", "--host"]
