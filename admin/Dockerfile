FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
# node:22-alpine = musl; rolldown optional deps часто не ставятся из lockfile с другой ОС
RUN npm install "@rolldown/binding-linux-x64-musl@$(node -p "require('./node_modules/rolldown/package.json').version")"
COPY . .
ARG VITE_ADMIN_API_URL
ENV VITE_ADMIN_API_URL=$VITE_ADMIN_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
