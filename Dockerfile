FROM node:14
WORKDIR /app
COPY package-lock.json .
COPY package.json .
COPY tsconfig.json .
RUN npm i
COPY src ./src
RUN npm run build
CMD ["node","build/src/app.js"]