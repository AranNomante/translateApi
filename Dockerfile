# Stage 1: Build
FROM node:18.15.0 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Run
FROM node:18.15.0 AS runtime

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --production

COPY --from=build /app/dist ./dist
COPY --from=build /app/jest.config.js ./jest.config.js
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/.env ./.env

EXPOSE 3000

CMD ["node", "dist/index.js"]
