FROM node:latest

WORKDIR /react-app

# Copy package files and install dependencies first for caching benefits.
COPY package*.json ./
RUN npm install

# Copy the rest of your application code.
COPY public/ ./public
COPY src/ ./src

EXPOSE 3000

# Start the client app (adjust the command if you use a different script).
CMD ["npm", "start"]
