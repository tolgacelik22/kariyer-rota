FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Copy database schema to be available for initialization
COPY db/schema.sql /docker-entrypoint-initdb.d/schema.sql 2>/dev/null || true

EXPOSE 3000

CMD ["npm", "start"]

