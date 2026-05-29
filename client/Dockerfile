# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build-time env vars for React (baked into the JS bundle by react-scripts build).
# Pass different values via docker-compose build args to override.
ARG REACT_APP_CONFIG_SERVER=/configservice
ARG REACT_APP_RAG_SERVER=/ragservice
ARG REACT_APP_IN_DOCKER=true
ENV REACT_APP_CONFIG_SERVER=$REACT_APP_CONFIG_SERVER
ENV REACT_APP_RAG_SERVER=$REACT_APP_RAG_SERVER
ENV REACT_APP_IN_DOCKER=$REACT_APP_IN_DOCKER

# Build the application
RUN npm run build

# Install a lightweight static file server (replaces the CRA dev server)
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Serve the pre-built static output; -s enables single-page app (HTML5 history) mode
CMD ["serve", "-s", "build", "-l", "3000"]