# 🚀 Lean Canvas Pro  
*Plataforma estratégica de modelado de negocio y validación heurística para Startups*

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Proprietary_&_All_Rights_Reserved-red)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Auditor Local](https://img.shields.io/badge/Motor-Heur%C3%ADstico_Local-brightgreen)

## 🎯 Sobre el Proyecto

**Lean Canvas Pro** es una suite profesional diseñada para ser el núcleo decisivo en la etapa temprana (*Early Stage*) de toda Startup. Desarrollada para acompañar a founders, directivos y CEOs hacia el éxito, esta plataforma permite construir modelos de negocio de manera iterativa, estructurada y profesional, respaldados activamente por auditorías heurísticas ejecutadas 100% localmente en el navegador.

## ✨ Características Principales

- 📋 **Modelado Estratégico Dinámico:** Construcción ágil, intuitiva y visual de los 9 bloques fundamentales del modelo *Lean Canvas*.
- 🤖 **Auditoría Estratégica con Motor Heurístico Local:** Motor estratégico 100% local que evalúa bloques individuales o el proyecto al completo dando feedback sobre CAC, LTV, coherencia entre bloques, viabilidad del modelo y prioridades de mejora. Sin dependencias de APIs externas.
- 🔒 **Persistencia y Privacidad Local:** Los datos de negocio se almacenan en el almacenamiento local del navegador y nunca abandonan tu dispositivo. Los secretos industriales y datos de la startup pertenecen a los directivos.
- 🌓 **Diseño Adaptativo y Accesible:** Interfaz inmersiva enfocada a la productividad continua; modos claro y oscuro pulidos para evitar la fatiga en las sesiones largas de brainstorming.
- 📁 **Centro de Gestión Integral:** Administración de múltiples ideas y proyectos, con facilidades de importación, exportación en JSON e impresión del lienzo directamente desde el navegador.

## 🛠️ Stack Tecnológico y Arquitectura

- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion (para transiciones hápticas visuales), Lucide Icons.
- **Backend:** Servidor en Node.js mediante Express con Vite en modo middleware (*Full-Stack*).
- **Motor Heurístico:** Motor heurístico local (`src/evaluator`) que analiza el canvas al instante: puntuación, fortalezas, inconsistencias entre bloques y prioridades de mejora. Sin dependencias de APIs externas.

## 🔑 Autenticación (Supabase Auth)

Lean Canvas Pro usa **Supabase Auth** para gestionar cuentas reales de usuario.  
La autenticación es completamente por email y contraseña; la sesión persiste al recargar el navegador gracias al almacenamiento de sesión de Supabase.

### Arquitectura

| Pieza | Responsabilidad |
|---|---|
| `src/lib/supabase.ts` | Cliente Supabase singleton |
| `src/contexts/AuthContext.tsx` | Context que expone `user`, `session`, `loading`, `signIn`, `signUp`, `signOut` |
| `src/components/auth/AuthPage.tsx` | Pantalla de registro/inicio de sesión coherente con el diseño |
| `src/App.tsx` (componente `App`) | Auth-gate: muestra `AuthPage` o el workspace según el estado de sesión |

### Setup local

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve a **Settings → API** y copia la URL y la clave `anon public`.
3. Crea un archivo `.env` en la raíz del proyecto (basándote en `.env.example`):
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. En el panel de Supabase, asegúrate de que **Email Auth** está habilitado en *Authentication → Providers*.  
   (Opcional) Desactiva la confirmación de email en entornos de desarrollo en *Authentication → Settings → Email confirmations*.
5. Ejecuta **todas** las migraciones en orden (ver sección de base de datos más abajo).
6. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```

> Las variables `VITE_*` son expuestas al cliente por Vite de forma segura.  
> Nunca añadas la clave `service_role` al frontend.

---

## ☁️ Persistencia Cloud (Supabase Postgres)

Los lienzos se almacenan en Supabase Postgres con **Row Level Security** activado, de modo que cada usuario solo puede acceder a sus propios datos.

### Esquema

```sql
-- Tabla: canvases
id          uuid        PRIMARY KEY   -- UUID generado en cliente con crypto.randomUUID()
user_id     uuid        NOT NULL      -- FK → auth.users, ON DELETE CASCADE
name        text        NOT NULL      -- Nombre del lienzo
data        jsonb       NOT NULL      -- Bloques del lienzo: { "1": "Problema...", "4": "Solución..." }
created_at  timestamptz NOT NULL
updated_at  timestamptz NOT NULL      -- Actualizado automáticamente por trigger
```

Los 9 bloques del canvas (identificados por su número 1–9) se guardan como claves del objeto JSON `data`.

### Migración

Ejecuta **todos** los archivos de `supabase/migrations/` **una sola vez y en orden** en tu proyecto de Supabase:

1. Abre **Dashboard → SQL Editor → New query**.
2. Para cada archivo de la lista siguiente, pega el contenido y haz clic en **Run**:

| Archivo | Qué crea |
|---|---|
| `001_create_canvases.sql` | Tabla `canvases`, trigger `set_updated_at` y RLS |
| `002_create_canvas_snapshots.sql` | Tabla `canvas_snapshots` y RLS |
| `003_create_canvas_shares.sql` | Tabla `canvas_shares`, RLS básica y función RPC `get_canvas_by_share_token` |
| `004_create_workspaces.sql` | Tablas `workspaces` y `workspace_members` |
| `005_create_workspace_invitations.sql` | Tabla `workspace_invitations`, RPCs de invitación |
| `006_workspace_canvas_permissions.sql` | Políticas de DELETE más restrictivas para canvases de workspace |
| `007_create_canvas_comments.sql` | Tabla `canvas_comments` y RLS |
| `008_workspace_share_read_policy.sql` | Política SELECT para que los miembros de workspace puedan leer shares existentes |

> **Importante:** saltar cualquier migración provocará fallos silenciosos o errores de RLS en la feature correspondiente. Las migraciones son aditivas y seguras de re-ejecutar gracias a las cláusulas `IF NOT EXISTS` / `CREATE OR REPLACE`.

### Flujo de persistencia

```
[Usuario teclea]
      │  600 ms debounce
      ▼
updateBlock() ──► localStorage cache (escritura inmediata)
      │
      └──► Supabase updateCanvas() (fire-and-forget, en paralelo)

[Carga inicial]
      │
      ├──► localStorage cache → render instantáneo
      └──► Supabase listCanvases() → reconcilia y actualiza UI
             │
             └── Si no hay datos en Supabase:
                   • Migra desde la clave legacy lean-canvas-pro-projects (una sola vez)
                   • O crea un lienzo vacío por defecto
```

### Decisiones clave

| Decisión | Justificación |
|---|---|
| **Supabase Postgres** | Coherente con la auth ya implementada; sin nueva infraestructura |
| **UUID generado en cliente** | Permite escritura optimista sin round-trip extra |
| **localStorage como caché** | Render instantáneo al recargar; resiliencia ante desconexión |
| **Fire-and-forget para el sync** | Mantiene la fluidez de edición; los errores no bloquean la UI |
| **Migración automática una vez** | Ningún dato del usuario se pierde al pasar a cloud |
| **RLS en Postgres** | Los datos de cada usuario son privados por defecto, incluso si la `anon key` se expone |

### Archivos relevantes

| Archivo | Responsabilidad |
|---|---|
| `src/lib/canvasService.ts` | CRUD helpers sobre la tabla `canvases` |
| `src/hooks/useCanvases.ts` | Hook: estado local + sync cloud + migración legacy |
| `supabase/migrations/001_create_canvases.sql` | Schema, trigger y RLS |



---

## 🔗 Compartir Canvas (Solo Lectura)

Lean Canvas Pro permite generar un enlace público de solo lectura para cualquier canvas. Los destinatarios pueden ver el canvas sin necesidad de cuenta y sin poder editarlo.

### Cómo funciona

1. Abre la sidebar y pulsa **Compartir** sobre el canvas activo.
2. Haz clic en **Generar enlace de solo lectura** → se crea un registro en `canvas_shares`.
3. Copia el enlace generado (`/share/<token>`) y compártelo.
4. Cualquier persona con el enlace puede ver el canvas en modo lectura en la ruta `/share/:token` — sin autenticación.

### Modelo de datos

```sql
-- Tabla: canvas_shares
id          uuid        PRIMARY KEY
canvas_id   uuid        NOT NULL UNIQUE   -- FK → canvases; un share por canvas
user_id     uuid        NOT NULL          -- DEFAULT auth.uid() — quién creó el share
token       uuid        NOT NULL UNIQUE   -- slug del enlace público
created_at  timestamptz NOT NULL
```

### Políticas RLS

| Política | Operación | Permite |
|---|---|---|
| `Owners can manage their canvas shares` | ALL | Solo el creador del share (`user_id = auth.uid()`) |
| `Workspace members can view canvas shares` | SELECT | Cualquier miembro del workspace al que pertenece el canvas |

La función `get_canvas_by_share_token(p_token uuid)` es `SECURITY DEFINER` y permite a llamadas anónimas leer el canvas del share sin RLS.

### Archivos relevantes

| Archivo | Responsabilidad |
|---|---|
| `src/lib/shareService.ts` | CRUD + RPC helpers con null guards explícitos |
| `src/hooks/useCanvasSharing.ts` | Estado del share por canvas; maneja error 23505 |
| `src/components/ShareModal.tsx` | UI del modal de compartir |
| `src/components/SharedCanvasView.tsx` | Vista pública de solo lectura (`/share/:token`) |
| `supabase/migrations/003_create_canvas_shares.sql` | Tabla, RLS base y función RPC |
| `supabase/migrations/008_workspace_share_read_policy.sql` | SELECT policy para miembros de workspace |

---

## 🔍 Error Tracking (Sentry)

Lean Canvas Pro integra **Sentry** para captura de errores en frontend y backend.  
La integración es completamente opcional: si las variables de entorno no están definidas, la aplicación funciona con normalidad sin enviar ningún dato.

### Variables de entorno

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `VITE_SENTRY_DSN` | Frontend (Vite → navegador) | DSN del proyecto Sentry para el cliente React |
| `SENTRY_DSN` | Backend (Node.js) | DSN del proyecto Sentry para el servidor Express |

Añade ambas variables a tu archivo `.env` (consulta `.env.example` para el formato exacto).

### Qué se captura

| Superficie | Qué se reporta | Qué se omite intencionalmente |
|---|---|---|
| **Frontend** | Errores de render capturados por `ErrorBoundary`, excepciones no controladas | Contenido de los bloques del canvas, email del usuario |
| **Backend** | Excepciones que llegan al error-handler de Express | Cuerpos de request (canvas data) |

### Contexto de usuario

Al autenticarse, se adjunta únicamente el **ID de usuario** de Supabase al scope de Sentry.  
El email y cualquier otro dato personal quedan fuera del reporte para respetar la privacidad.

### Setup

1. Crea un proyecto en [sentry.io](https://sentry.io) (puedes usar uno solo para ambos o uno separado por entorno).
2. Copia el **DSN** desde *Project → Settings → Client Keys*.
3. Añade las variables a tu `.env`:
   ```env
   VITE_SENTRY_DSN=https://your-key@oXXXXX.ingest.sentry.io/XXXXXXX
   SENTRY_DSN=https://your-key@oXXXXX.ingest.sentry.io/XXXXXXX
   ```
4. Reinicia el servidor de desarrollo (`npm run dev`).

### Archivos relevantes

| Archivo | Responsabilidad |
|---|---|
| `src/lib/sentry.ts` | `initSentry()` – inicializa el SDK de React/browser |
| `src/main.tsx` | Llama a `initSentry()` antes del primer render |
| `src/ErrorBoundary.tsx` | Reporta errores de render vía `Sentry.captureException` |
| `src/contexts/AuthContext.tsx` | Adjunta / limpia el user scope (`Sentry.setUser`) |
| `server.ts` | Inicializa `@sentry/node` y registra `setupExpressErrorHandler` |

---

Diseñado y desarrollado de manera empírica en el ecosistema de talento e innovación por **Marc Cubero Cantavella** desde el campo de la *Ingeniería de Organización Industrial* aplicados sobre la **Universidad Europea de Valencia**. 

[🔗 Conectar con Marc Cubero en LinkedIn](https://www.linkedin.com/in/marc-cubero-cantavella-bb04542a7)

## ⚖️ Licencia y Propiedad Intelectual

**© 2026 Marc Cubero Cantavella. Todos los derechos reservados.**

Esta plataforma, su código fuente, arquitectura, diseño y concepto son propiedad exclusiva e intelectual de su creador.

🔹 **Puedes** acceder y usar la aplicación funcional en la web de forma abierta para construir tus modelos y dar vida a tus Startups.  
❌ **No puedes** descargar, clonar, copiar, distribuir, revender, modificar ni realizar obras derivadas de este código fuente o del diseño para fines comerciales ni no comerciales sin la autorización directa, mediante firma, de Marc Cubero. 

> *La visibilidad de este código fuente en repositorios como GitHub sirve con fines exclusivos de portafolio y evidencia de capacidad técnica. No se ampara de ninguna manera bajo terminologías Open Source.* Por favor, ver el archivo `LICENSE` completo del repositorio para detalles legales.
