# Step 1: Use Node.js 20
FROM node:20

# Step 2: Set working directory
WORKDIR /app

# Step 3: Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Step 4: Copy project files
COPY . .

# Step 5: Expose Vite dev port
EXPOSE 5173

# Step 6: Run Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]