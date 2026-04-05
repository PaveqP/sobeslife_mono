# Дев-стенд: развёртывание, nginx, CI из ветки `dev`

Ниже — полный цикл: сервер, Docker, доступ по HTTP, деплой по push в `dev`, затем заметки про прод.

---

## 1. Что уже есть в репозитории

| Файл | Назначение |
|------|------------|
| `docker-compose.yml` | Локальная разработка: Vite на `:5173`, API на `:8080` |
| `docker-compose.deploy.yml` | Стенд: **один вход** на порту `HTTP_PORT` (по умолчанию **80**): nginx в образе `web` отдаёт SPA и проксирует `/api`, `/auth`, `/health` на сервис `app` |
| `web/Dockerfile` | Production-сборка фронта + `nginx` с конфигом `web/nginx.conf` |
| `web/Dockerfile.dev` | Только для локального dev в compose |
| `.github/workflows/deploy-dev.yml` | GitHub Actions: push в `dev` → SSH на сервер → `git pull` → `docker compose ... up -d --build` |

Браузер ходит на **один origin** (например `http://SERVER_IP`), без `VITE_API_URL` на отдельный порт API — так проще CORS и прод-конфиг.

---

## 2. Сервер: ОС и пакеты

**ОС:** Ubuntu Server **22.04 или 24.04 LTS** (или Debian 12). Ставь минимальный образ, без GUI.

Подключись по SSH и обнови систему:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl git
```

Установи **Docker Engine** и плагин **Compose** по официальной инструкции:  
https://docs.docker.com/engine/install/ubuntu/

Проверка:

```bash
docker --version
docker compose version
```

Добавь пользователя деплоя в группу `docker` (чтобы не использовать `sudo` для compose):

```bash
sudo usermod -aG docker ВАШ_ПОЛЬЗОВАТЕЛЬ
```

Перелогинься (или `newgrp docker`).

---

## 3. Firewall

Разреши SSH и HTTP (HTTPS — когда настроишь сертификат):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## 4. Первичная настройка репозитория на сервере

Создай каталог и клонируй **ветку `dev`**:

```bash
sudo mkdir -p /opt/sobeslife
sudo chown "$USER:$USER" /opt/sobeslife
cd /opt/sobeslife
git clone -b dev --single-branch https://github.com/ВАШ_АККАУНТ/sobeslife_mono.git .
```

Для **приватного** репозитория удобнее SSH:

```bash
git clone -b dev --single-branch git@github.com:ВАШ_АККАУНТ/sobeslife_mono.git .
```

На GitHub: **Settings → SSH and GPG keys** у пользователя `git` на сервере — добавь публичный ключ из `~/.ssh/id_ed25519.pub` (или создай ключ специально для сервера).

---

## 5. Переменные окружения

Скопируй шаблон и отредактируй пароль БД:

```bash
cd /opt/sobeslife
cp deploy/env.example .env
nano .env
```

Минимум: **`DB_PASSWORD`** — тот же пароль должен подставляться в Postgres (compose подставляет `POSTGRES_PASSWORD` из этого файла).

Файл `.env` **не коммить** — он уже в `.gitignore`.

---

## 6. Первый запуск стека

```bash
cd /opt/sobeslife
docker compose -f docker-compose.deploy.yml --env-file .env up -d --build
docker compose -f docker-compose.deploy.yml --env-file .env ps
```

Проверка:

- В браузере: `http://IP_СЕРВЕРА` — фронт.
- API: `http://IP_СЕРВЕРА/health` — ответ бэкенда.

Логи при необходимости:

```bash
docker compose -f docker-compose.deploy.yml --env-file .env logs -f web app
```

---

## 7. Где тут nginx

Отдельный системный nginx **не обязателен**: в образе `web` уже **nginx**, он:

- отдаёт статику Vite (`try_files` + SPA fallback на `index.html`);
- проксирует `/api/`, `/auth/`, `/health` на контейнер `app:8080`.

Конфиг в репозитории: `web/nginx.conf`.

### Если на одном VPS несколько сайтов

Подними **системный** nginx (или Caddy) на 80/443 и проксируй на Docker **только порт**, например:

```nginx
location / {
    proxy_pass http://127.0.0.1:80;  # если контейнер web проброшен на 80 хоста
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Либо смени в `.env` проброс: `HTTP_PORT=8080`, а на хосте nginx слушает 80 → `proxy_pass http://127.0.0.1:8080`.

---

## 8. HTTPS (Let’s Encrypt), кратко

1. Установи Certbot и плагин nginx (если используешь системный nginx).
2. Получи сертификат на домен.
3. Настрой редирект HTTP → HTTPS.

Если остаёшься на одном контейнере `web` без хостового nginx, типичный вариант — вынести **Traefik** или **Caddy** перед контейнерами или добавить второй nginx только для TLS — это отдельная схема; для дипломного дев-стенда часто достаточно HTTP + firewall.

---

## 9. GitHub Actions: деплой по push в `dev`

### 9.1 Секреты репозитория

GitHub → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Пример |
|--------|--------|
| `DEV_SSH_HOST` | `203.0.113.10` или `dev.sobeslife.example.com` |
| `DEV_SSH_USER` | пользователь с правом `docker` и доступом к каталогу репозитория |
| `DEV_SSH_PRIVATE_KEY` | содержимое **приватного** SSH-ключа (включая `BEGIN` / `END`) |
| `DEV_DEPLOY_PATH` | `/opt/sobeslife` |

Ключ лучше создать **только для CI** (на сервере в `authorized_keys` добавь публичную часть пары из GitHub).

### 9.2 Поведение workflow

Файл: `.github/workflows/deploy-dev.yml`.

Триггер: **push в ветку `dev`**.

На сервере выполняется: переход в `DEV_DEPLOY_PATH`, `git pull` ветки `dev`, затем:

`docker compose -f docker-compose.deploy.yml --env-file .env up -d --build`

Убедись, что на сервере после первого `git clone` файл `.env` **существует** и не затирается при pull (он в `.gitignore`).

### 9.3 Ручной запуск

Вкладка **Actions** → workflow **Deploy dev stand** → **Run workflow** (если включён `workflow_dispatch`).

---

## 10. Прод-стенд (позже)

Идея та же:

- отдельный VPS или тот же с другим `HTTP_PORT` / доменом;
- отдельные секреты GitHub (`PROD_SSH_*`, `PROD_DEPLOY_PATH`);
- второй workflow на ветку `main` или тег;
- строже: бэкапы Postgres, HTTPS, ограничение доступа к Postgres/Redis снаружи (как в `docker-compose.deploy.yml` — порты БД наружу не пробрасываются).

---

## 11. Типичные проблемы

| Симптом | Что проверить |
|---------|----------------|
| 502 / пустой ответ от `/api` | `docker compose ... logs app`; контейнер `app` должен быть `Up`; `curl http://127.0.0.1/health` с хоста не сработает, если порт 8080 не проброшен — проверяй из сети Docker: `docker compose ... exec web wget -qO- http://app:8080/health` |
| После `git pull` ошибка `dubious ownership` | `git config --global --add safe.directory /opt/sobeslife` |
| Actions не может зайти по SSH | ключ, `authorized_keys`, `DEV_SSH_HOST`, пользователь |
| Фронт стучится не туда | для deploy-сборки `VITE_API_URL` должен быть пустым (same origin); не задавай в `.env` полный URL API, если nginx на том же хосте |

---

## 12. Чеклист перед первым деплоем

- [ ] Docker и Compose на сервере
- [ ] Клон репозитория, ветка `dev`
- [ ] `.env` с сильным `DB_PASSWORD`
- [ ] `docker compose -f docker-compose.deploy.yml --env-file .env up -d --build` проходит
- [ ] Сайт открывается по IP
- [ ] Секреты GitHub заданы, push в `dev` обновляет стенд
