# Use Node.js 20 (since you need it for Vite too, keeps versions consistent)
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY . .


# Expose backend port (adjust if not 5000)
EXPOSE 5000

# Run the backend
CMD ["npm", "start"]


