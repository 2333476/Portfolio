# Dockerfile for backend Express (dev)
FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Copy Prisma files
COPY prisma ./prisma

# Installe OpenSSL (libssl-dev) pour Prisma
RUN apt-get update && apt-get install -y libssl-dev

# Expose port (change if needed)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
