# Дев-стенд на VPS: полная пошаговая инструкция

Ниже — развёртывание проекта **sobeslife_mono** на чистом Linux-сервере: от первого SSH-подключения до автодеплоя по push в ветку `dev`

**Что получится в итоге**

- Один HTTP-порт (по умолчанию **80**): контейнер `web` (nginx) отдаёт SPA и проксирует `/api`, `/auth`, `/health` на бэкенд `app`.
- Браузер ходит на **один origin** (например `http://IP_СЕРВЕРА`) — отдельный `VITE_API_URL` на другой порт не нужен.
- Файлы в репозитории: `docker-compose.deploy.yml`, `web/Dockerfile` + `web/nginx.conf`, `.github/workflows/deploy-dev.yml`.

**Подставьте свои значения**

| Плейсхолдер | Смысл |
|-------------|--------|
| `YOUR_USER` | ваш пользователь Linux на VPS (например `ubuntu` или `deploy`) |
| `YOUR_SERVER_IP` | IP или домен сервера |
| `YOUR_GITHUB_USER` | логин GitHub |
| `YOUR_REPO` | имя репозитория (для этого монорепо: `sobeslife_mono`) |

---

## Часть A. Подготовка сервера (один раз)

### A1. Подключение по SSH

С вашего компьютера:

```bash
ssh YOUR_USER@YOUR_SERVER_IP
```

Если ключа ещё нет, создайте на **локальной** машине:

```bash
ssh-keygen -t ed25519 -C "your-email@example.com" -f ~/.ssh/id_ed25519
```

Скопируйте публичный ключ на сервер (если провайдер не сделал это в панели):

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub YOUR_USER@YOUR_SERVER_IP
```

### A2. Обновление системы и базовые пакеты

На сервере (подходит **Ubuntu 22.04 / 24.04 LTS** или **Debian 12**):

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl git gnupg
```

### A3. Установка Docker Engine и Compose

Официальная инструкция: [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/). Кратко — на Ubuntu:

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${VERSION_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Проверка:

```bash
docker --version
docker compose version
```

Добавьте пользователя в группу `docker`, чтобы не писать `sudo` перед `docker`:

```bash
sudo usermod -aG docker "$USER"
```

Выйдите из сессии и зайдите снова **или** выполните:

```bash
newgrp docker
```

Проверка без `sudo`:

```bash
docker run --rm hello-world
```

### A4. Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
sudo ufw status verbose
```

Порт **443** пригодится позже для HTTPS; пока достаточно **22** и **80**.

### A5. Каталог проекта и клонирование репозитория

Создайте каталог и выставьте владельца:

```bash
sudo mkdir -p /opt/sobeslife
sudo chown "$USER:$USER" /opt/sobeslife
cd /opt/sobeslife
```

**Публичный** репозиторий (ветка `dev`):

```bash
git clone -b dev --single-branch https://github.com/YOUR_GITHUB_USER/YOUR_REPO.git .
```

**Приватный** репозиторий удобнее через SSH. На сервере создайте ключ **только для git** (если ещё нет):

```bash
ssh-keygen -t ed25519 -C "sobeslife-server-git" -f ~/.ssh/id_ed25519_github -N ""
cat ~/.ssh/id_ed25519_github.pub
```

Скопируйте вывод и добавьте в GitHub: **Settings → SSH and GPG keys → New SSH key**.

Настройте использование этого ключа для `github.com`:

```bash
printf '%s\n' \
  'Host github.com' \
  '  HostName github.com' \
  '  User git' \
  '  IdentityFile ~/.ssh/id_ed25519_github' \
  '  IdentitiesOnly yes' >> ~/.ssh/config
chmod 600 ~/.ssh/config
```

Проверка:

```bash
ssh -T git@github.com
```

Клонирование:

```bash
cd /opt/sobeslife
git clone -b dev --single-branch git@github.com:YOUR_GITHUB_USER/YOUR_REPO.git .
```

### A6. Файл окружения `.env`

Шаблон лежит в `deploy/env.example`. Скопируйте в **корень** репозитория на сервере:

```bash
cd /opt/sobeslife
cp deploy/env.example .env
nano .env
```

**Обязательно** задайте сильный **`DB_PASSWORD`** — тот же пароль подставится в Postgres через `docker-compose.deploy.yml`.

Минимальное содержимое (пример):

```env
DB_PASSWORD=сгенерируйте-длинный-случайный-пароль
```

Опционально:

- `HTTP_PORT=80` — порт на хосте (по умолчанию 80). Если на сервере порт 80 занят, например `HTTP_PORT=8080`.
- `VITE_API_URL` — для деплоя **оставьте пустым** (same origin через nginx).

Файл `.env` в `.gitignore` и **не коммитьте**.

---

## Часть B. Первый запуск стека

### B1. Сборка и запуск

```bash
cd /opt/sobeslife
docker compose -f docker-compose.deploy.yml --env-file .env up -d --build
docker compose -f docker-compose.deploy.yml --env-file .env ps
```

### B2. Проверки

С **вашего компьютера** (подставьте IP):

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://YOUR_SERVER_IP/
curl -sS http://YOUR_SERVER_IP/health
```

В браузере откройте `http://YOUR_SERVER_IP` — должен открыться фронт.

### B3. Логи

```bash
cd /opt/sobeslife
docker compose -f docker-compose.deploy.yml --env-file .env logs -f web app
```

Остановка по `Ctrl+C`. Просмотр последних строк без follow:

```bash
docker compose -f docker-compose.deploy.yml --env-file .env logs --tail=100 web app
```

### B4. Диагностика изнутри Docker (если 502 по API)

С хоста порт API **8080** может быть не проброшен наружу — это нормально. Проверка с контейнера `web`:

```bash
cd /opt/sobeslife
docker compose -f docker-compose.deploy.yml --env-file .env exec web wget -qO- http://app:8080/health
```

---

## Часть C. Что где лежит в репозитории

| Файл | Назначение |
|------|------------|
| `docker-compose.yml` | Локальная разработка (Vite `:5173`, API `:8080`) |
| `docker-compose.deploy.yml` | Стенд: один вход `HTTP_PORT` → nginx в сервисе `web`, бэкенд `app`, Postgres, Redis |
| `web/Dockerfile` | Production-сборка фронта + nginx |
| `web/nginx.conf` | Статика + прокси на `app:8080` |
| `.github/workflows/deploy-dev.yml` | CI: push в `dev` → SSH → `git pull` → `docker compose ... up -d --build` |

---

## Часть D. GitHub Actions: деплой по push в `dev`

### D1. Секреты репозитория

GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Значение |
|--------|----------|
| `DEV_SSH_HOST` | `YOUR_SERVER_IP` или домен |
| `DEV_SSH_USER` | пользователь с правом `docker` и доступом к `/opt/sobeslife` |
| `DEV_SSH_PRIVATE_KEY` | **полный** приватный ключ (строки `BEGIN` … `END` включительно) |
| `DEV_DEPLOY_PATH` | `/opt/sobeslife` |
| `DEV_DB_PASSWORD` | пароль Postgres для dev-стенда |
| `DEV_CONFIG_PATH` | `config/docker-config.yaml` |
| `DEV_ACCESS_SIGNING_KEY` | signing key для access JWT |
| `DEV_REFRESH_SIGNING_KEY` | signing key для refresh JWT |
| `DEV_POLZA_AI_API_KEY` | ключ Polza AI |
| `DEV_OAUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DEV_OAUTH_GOOGLE_CLIENT_ID` | Google OAuth client id |
| `DEV_OAUTH_GOOGLE_REDIRECT_URI` | `https://dev.sobeslife.ru/auth/google` |
| `DEV_HTTP_PORT` | опционально, например `80` или `8080` |
| `DEV_VITE_API_URL` | опционально; для same-origin оставьте пустым |

Рекомендуется отдельная пара ключей **только для CI**: на сервере в `~/.ssh/authorized_keys` добавьте **публичную** часть ключа, **приватную** положите в секрет `DEV_SSH_PRIVATE_KEY`.

Пример генерации пары **на вашей машине** для CI:

```bash
ssh-keygen -t ed25519 -C "github-actions-sobeslife" -f ./gha_deploy_ed25519 -N ""
cat gha_deploy_ed25519.pub
```

Содержимое `gha_deploy_ed25519` (приватный файл) — в секрет GitHub. Публичную строку добавьте на сервер:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'ВСТАВЬТЕ_СТРОКУ_ИЗ_gha_deploy_ed25519.pub' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### D2. Поведение workflow

Триггеры: **push** в ветку `dev` и ручной **Run workflow** (`workflow_dispatch`).

На сервере выполняется:

1. `cd $DEV_DEPLOY_PATH`
2. `git config --global --add safe.directory` (на случай предупреждений о владельце)
3. `git fetch`, `checkout dev`, `git pull --ff-only origin dev`
4. workflow собирает `.env` на сервере из GitHub Secrets
5. запускает `docker compose -f docker-compose.deploy.yml --env-file .env up -d --build`

При деплое через Actions файл `.env` на сервере создаётся заново из GitHub Secrets, поэтому заранее подготавливать его для CI не нужно.

### D3. Ручной запуск

**Actions** → workflow **Deploy dev stand** → **Run workflow**.

---

## Часть E. Опционально: несколько сайтов на одном VPS

Если на хосте уже занят порт 80, в `.env` укажите, например:

```env
HTTP_PORT=8080
```

И поднимите **системный** nginx (или Caddy) на 80/443: публичный сайт (`web`) и админка (`admin`) — **разные порты** на localhost (из `.env`: `HTTP_PORT`, `ADMIN_HTTP_PORT`), на одном домене разведите префиксом **`/admin/`**.

Пример фрагмента для **хостового** nginx (сначала более длинный префикс `/admin/`, затем всё остальное на `web`):

```nginx
# Порты должны совпадать с HTTP_PORT и ADMIN_HTTP_PORT в `.env` (пример: 8080 и 8081).

# Админка: полный URI в контейнер admin (SPA и /admin/api/ → app внутри compose).
location /admin/ {
    proxy_pass http://127.0.0.1:8081;
    proxy_connect_timeout 10s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Публичный фронт + /api/, /auth/, /health (контейнер web).
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_connect_timeout 10s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Локально админка: `cd admin && npm run dev` → открыть **`http://localhost:5174/admin/`** (порт см. `admin/vite.config.ts`).

---

## Часть F. HTTPS (Let’s Encrypt), кратко

Типичный путь: **Certbot** + системный nginx на 80/443, бэкенд приложения на другом порту (см. часть E).

Если TLS нужен **без** отдельного nginx на хосте, часто ставят **Traefik** или **Caddy** перед контейнерами — это отдельная схема. Для учебного дев-стенда часто достаточно HTTP и firewall.

---

## Часть G. Типичные проблемы

| Симптом | Что проверить |
|---------|----------------|
| **502 на всём сайте** по HTTPS (`nginx/1.24` на Ubuntu внизу страницы) | Это **хостовый** nginx. Он должен `proxy_pass` на тот **порт хоста**, куда проброшен контейнер `web` (в `.env`: `HTTP_PORT`, по умолчанию `80`). Если на 80 уже слушает этот nginx, в `.env` задайте `HTTP_PORT=8080` и в `server { ... }` укажите `proxy_pass http://127.0.0.1:8080;`. Проверка: `docker compose ... ps` (у `web` и `app` — Up), `curl -sI http://127.0.0.1:ВАШ_ПОРТ/` |
| **Админка** открывается как публичный сайт или 404 на `/admin/` | В хостовом nginx блок **`location /admin/`** должен идти **выше** `location /` и вести на порт **`ADMIN_HTTP_PORT`** (контейнер `admin`). Порты в конфиге — те же, что в `.env`. |
| 502 / пустой ответ от `/api` | `docker compose ... logs app`; контейнер `app` — `Up`; проверка `exec web wget http://app:8080/health` (см. B4) |
| **502 на POST** (`/auth/sign-in`, `/api/...`) при живом `GET /` | Часто: **`app` не отвечает вовремя** (БД/Redis) или **обрыв** из‑за таймаутов. Проверьте `docker logs …-app-1`; с хоста: `curl -sS -X POST http://127.0.0.1:ВАШ_HTTP_PORT/auth/sign-in -H 'Content-Type: application/json' -d '{}'`. На хостовом nginx задайте **`proxy_read_timeout` / `proxy_send_timeout`** (например 60s) для `location /` и при необходимости увеличьте таймауты в образе **`web`** (см. `web/nginx.conf`) и в **Go** (`server/internal/server/server.go`). |
| После `git pull` в CI: `dubious ownership` | На сервере один раз: `git config --global --add safe.directory /opt/sobeslife` (workflow уже добавляет `safe.directory` для текущего пути) |
| Actions не подключается по SSH | Секреты, `authorized_keys`, пользователь, что ключ не с переносами обрезан |
| **`column "dirty" does not exist`** в `schema_migrations` | Таблица в старом формате. В новых версиях приложение само добавляет колонку при старте; либо один раз вручную: `docker compose ... exec db psql -U postgres -d postgres -c 'ALTER TABLE IF EXISTS public.schema_migrations ADD COLUMN IF NOT EXISTS dirty boolean NOT NULL DEFAULT false;'` |
| Фронт стучит не туда | Для deploy не задавайте полный URL API в `.env`; `VITE_API_URL` пустой = same origin |
| Порт 80 занят | `HTTP_PORT=8080` в `.env` + прокси с хоста или освободить 80 |

---

## Часть H. Чеклист перед первым продакшен-подобным использованием

- [ ] Docker и `docker compose` работают без `sudo`
- [ ] Репозиторий клонирован, ветка `dev`
- [ ] `.env` с сильным `DB_PASSWORD`
- [ ] `docker compose -f docker-compose.deploy.yml --env-file .env up -d --build` завершается без ошибок
- [ ] Сайт, `/health` и **`/admin/`** (админка) открываются по IP или домену; хостовый nginx — см. часть E
- [ ] Секреты GitHub заданы, push в `dev` обновляет стенд

---

## Часть I. Прод (позже)

Идея та же: отдельный VPS или тот же сервер с другим `HTTP_PORT` / доменом; отдельные секреты (`PROD_SSH_*`, `PROD_DEPLOY_PATH`); отдельный workflow на `main` или теги; бэкапы Postgres, HTTPS, не открывать Postgres/Redis наружу (в `docker-compose.deploy.yml` порты БД на хост не пробрасываются).
