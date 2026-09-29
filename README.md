# TP2 - CMS y Frameworks Web

Proyecto del Trabajo Práctico N°2 — Facultad de Informática, UNCo.
Stack: **Strapi** (CMS headless) + **React** (frontend) + **Express** (backend) + **PostgreSQL** (base de datos).

## Estructura

```
tp2-cms/
├── backend/     # API en Express
├── frontend/    # App en React (Vite)
├── cms/         # Strapi (se genera con el script de setup)
├── scripts/     # Scripts de setup
└── docker-compose.yml   # Levanta la base de datos Postgres
```

## Requisitos

- Node.js 18 o superior
- Docker y Docker Compose

## Puesta en marcha

### 1. Base de datos

```bash
docker compose up -d
```

Esto levanta Postgres en `localhost:5432` con:
- usuario: `tp2`
- contraseña: `tp2pass`
- base de datos: `tp2_db`

(Podés cambiar estos valores en `docker-compose.yml`, pero después hay que
mantenerlos consistentes con los `.env` de `backend/` y `cms/`).

### 2. Backend (Express)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Corre en `http://localhost:4000`. Probar en el navegador:
`http://localhost:4000/api/health` — debería devolver `db: "connected"`
si Postgres ya está arriba.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Corre en `http://localhost:5173`. La página muestra si el backend logró
conectarse a la base.

### 4. CMS (Strapi)

La primera vez, generar el proyecto (esto crea la carpeta `cms/` con
Strapi ya configurado contra el mismo Postgres):

```bash
bash scripts/setup-strapi.sh
```

Después, para levantarlo:

```bash
cd cms
npm run develop
```

Corre en `http://localhost:1337/admin`. Ahí se crea el usuario
administrador la primera vez.

## Variables de entorno

`backend/` y `cms/` tienen cada uno su propio `.env`. Usá los
`.env.example` como base. Los `.env` reales no se suben a git (están en
`.gitignore`).

## Orden recomendado para levantar todo

1. `docker compose up -d` (base de datos)
2. `cd cms && npm run develop` (una vez generado con el script)
3. `cd backend && npm run dev`
4. `cd frontend && npm run dev`
