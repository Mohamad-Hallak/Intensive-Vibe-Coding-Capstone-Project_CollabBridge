FROM node:20-slim

WORKDIR /workspace

COPY package.json .
RUN npm install

COPY . .

EXPOSE 5173

# Run the dev server and bind to all network interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
