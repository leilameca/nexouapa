# NEXO UAPA

Plataforma académica de comunidad y productividad para estudiantes de la **Universidad Abierta para Adultos (UAPA)**. Inspirada en el layout de X/Twitter (3 columnas), enfocada en interacción académica.

---

## URLs de producción

| Servicio | URL |
|---|---|
| App en vivo | https://nexouapa.vercel.app |
| Repositorio | https://github.com/leilameca/nexouapa |
| BD (Turso) | `https://nexo-uapa-leilanym.aws-us-east-2.turso.io` |
| Imágenes (Vercel Blob) | Store `nexouapa-images2` |

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.7 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | Turso (libsql) vía Prisma v7 |
| ORM | Prisma 7 + `@prisma/adapter-libsql` |
| Auth | NextAuth.js v5 (credentials) |
| Almacenamiento imágenes | Vercel Blob |
| Estado cliente | Zustand |
| Iconos | Lucide React |

---

## Configurar desde cero en una PC nueva

### 1. Clonar el repositorio

```bash
git clone https://github.com/leilameca/nexouapa.git
cd nexouapa
npm install
```

### 2. Instalar Vercel CLI y Turso CLI

```bash
# Vercel CLI
npm install -g vercel

# Turso CLI (Mac/Linux)
curl -sSfL https://get.tur.so/install.sh | bash
```

### 3. Autenticarse en Vercel y obtener las variables de entorno

```bash
vercel login          # abre el browser, inicia sesión con la cuenta leilanycristaldedios@gmail.com
vercel link           # vincula la carpeta al proyecto nexouapa
vercel env pull .env.local   # descarga las variables de producción al archivo local
```

El archivo `.env.local` contendrá `BLOB_READ_WRITE_TOKEN`.

### 4. Crear el archivo `.env` (variables de dev)

Crear el archivo `.env` en la raíz del proyecto con este contenido:

```env
AUTH_SECRET="YOMpDo2JTxcyiPEuQiCK/oIVWHOG3/+7Eus69KzmMWI="
DATABASE_URL="file:./prisma/dev.db"
```

> Para desarrollo local la app usa SQLite. Para producción usa Turso automáticamente a través de las variables de Vercel.

### 5. Inicializar la base de datos local

```bash
npx prisma migrate dev
```

Esto crea `prisma/dev.db` con todas las tablas.

### 6. Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abrir http://localhost:3000

---

## Variables de entorno requeridas

| Variable | Entorno | Descripción |
|---|---|---|
| `AUTH_SECRET` | dev + prod | Secreto para NextAuth (JWT) |
| `DATABASE_URL` | dev | `file:./prisma/dev.db` (SQLite local) |
| `DATABASE_URL` | prod | URL Turso `https://nexo-uapa-leilanym.aws-us-east-2.turso.io` |
| `DATABASE_AUTH_TOKEN` | prod | Token de acceso a Turso (en Vercel) |
| `BLOB_READ_WRITE_TOKEN` | prod + dev | Token de Vercel Blob para imágenes |

Las variables de producción están almacenadas en Vercel y se descargan con `vercel env pull`.

---

## Correos permitidos en el registro

- Estudiantes: `@p.uapa.edu.do`
- Profesores/staff: `@uapa.edu.do`

---

## Módulos implementados

### Auth (`/login`, `/register`)
- Login con correo y contraseña
- Registro con validación de dominio institucional
- Selección de escuela y carrera (datos de UAPA)
- Persistencia de tema e idioma en cookies (sin FOUC)

### Feed (`/feed`)
- 3 tipos de publicaciones: General, Pregunta académica, Proyecto
- Subir imágenes adjuntas (Vercel Blob)
- Reacciones: like, upvote, repost
- Comentarios con respuestas
- Eliminar publicaciones propias
- Paginación con cursor ("Ver más")

### Vitrina (`/vitrina`)
- Muestra todos los posts tipo "proyecto"
- Filtrar por escuela
- Ordenar por recientes o populares

### Pomodoro (`/pomodoro`)
- Salas de estudio colaborativo en BD real
- Timer 25 min foco / 5 min descanso
- Chat solo habilitado en descanso
- Crear y unirse a salas

### Apuntes (`/apuntes`)
- CRUD completo de notas personales
- Campo asignatura, título, contenido
- Toggle público/privado
- Búsqueda en tiempo real

### Rankings (`/rankings`)
- Leaderboard top 20 por puntos de reputación
- Top 3 con medallas, resto en lista
- Cada entrada enlaza al perfil del usuario

### Perfil (`/perfil/[id]`)
- Página pública de cualquier usuario
- Bio, escuela, carrera, reputación, GitHub, LinkedIn
- Posts del usuario

### Settings (`/settings`)
- Cambiar foto de perfil (upload a Vercel Blob)
- Editar nombre, bio, GitHub, LinkedIn
- Toggle de tema claro/oscuro
- Toggle de idioma ES/EN

---

## Estructura de carpetas relevante

```
src/
  app/
    (auth)/login         # Página de login
    (auth)/register      # Página de registro
    (main)/feed          # Feed principal
    (main)/vitrina       # Proyectos
    (main)/pomodoro      # Salas de estudio
    (main)/apuntes       # Notas personales
    (main)/rankings      # Ranking de reputación
    (main)/settings      # Configuración
    (main)/perfil/[id]   # Perfil público de usuario
    api/posts            # CRUD publicaciones
    api/notes            # CRUD apuntes
    api/rooms            # CRUD salas Pomodoro
    api/rankings         # Leaderboard
    api/upload           # Subida de imágenes (Vercel Blob)
    api/user/profile     # Perfil propio
    api/user/[id]        # Perfil público
    api/auth/register    # Registro de usuario
  components/
    feed/PostCard        # Tarjeta de publicación
    feed/PostComposer    # Compositor de publicaciones
    layout/Sidebar       # Barra lateral (desktop)
    layout/MobileNav     # Navegación inferior (móvil)
    layout/RightPanel    # Panel derecho con rooms y ranking
    pomodoro/PomodoroTimer
  lib/
    db.ts                # Cliente Prisma (singleton)
    auth.ts              # Configuración NextAuth
    i18n.ts              # Traducciones ES/EN
    uapa-data.ts         # Escuelas y carreras UAPA
  stores/
    appStore.ts          # Zustand: tema e idioma
prisma/
  schema.prisma          # Modelos: User, Post, Interaction, Comment, PomodoroRoom, Note
  migrations/            # Historial de migraciones SQL
```

---

## Comandos útiles

```bash
npm run dev              # Servidor local (puerto 3000)
npm run build            # Build de producción
npx prisma studio        # GUI de la base de datos local
npx prisma migrate dev   # Crear y aplicar migración (SQLite local)

# Aplicar migración a Turso (producción):
~/.turso/turso db shell nexo-uapa < prisma/migrations/XXXXXX/migration.sql

# Desplegar a producción:
vercel --prod --yes

# Regenerar token de Turso si expira:
~/.turso/turso db tokens create nexo-uapa
# Luego actualizar DATABASE_AUTH_TOKEN en Vercel dashboard o con:
vercel env rm DATABASE_AUTH_TOKEN production
vercel env add DATABASE_AUTH_TOKEN production
```

---

## Pendiente / próximas mejoras

- [ ] Pomodoro: sincronización en tiempo real entre usuarios (WebSocket / Server-Sent Events)
- [ ] Notificaciones: avisar cuando alguien comenta o da like a tu publicación
- [ ] Buscar: barra de búsqueda global de publicaciones y usuarios
- [ ] Apuntes públicos: feed de apuntes compartidos por otros estudiantes
- [ ] Seguir usuarios: sistema de follow para personalizar el feed

---

## Notas importantes de arquitectura

- **Prisma v7**: la URL de la BD NO va en `schema.prisma`, va en `prisma.config.ts`
- **Turso en producción**: usar protocolo `https://` (no `libsql://`) para evitar error "fetch failed" en Vercel serverless
- **Vercel Blob**: token disponible automáticamente como `BLOB_READ_WRITE_TOKEN` en el proyecto de Vercel
- **NextAuth v5**: `params` en route handlers es `Promise<{...}>` — siempre hacer `await params`
