FROM node:22-alpine

# Install FFmpeg at the OS level (Alpine keeps the image lightweight and fast)
RUN apk add --no-cache ffmpeg

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Copy source code (overwritten by volumes in development)
COPY . .

# Expose API port (ignored by the worker, but safe to include in the shared image)
EXPOSE 4000

CMD ["npm", "run", "start:dev"]