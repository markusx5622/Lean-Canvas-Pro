# Analytics — Taxonomía de eventos

Lean Canvas Pro usa [PostHog](https://posthog.com/) para recoger métricas de uso del producto.
El SDK **no** se inicializa si la variable de entorno `VITE_POSTHOG_KEY` está ausente, por lo
que la aplicación funciona sin ella.

## Configuración

| Variable de entorno  | Obligatoria | Descripción                                               |
|----------------------|-------------|-----------------------------------------------------------|
| `VITE_POSTHOG_KEY`   | No          | API key del proyecto PostHog                              |
| `VITE_POSTHOG_HOST`  | No          | Host de ingesta. Por defecto `https://eu.i.posthog.com`   |

Consulta `.env.example` para un ejemplo completo.

### Opciones de privacidad habilitadas por defecto

| Opción                       | Valor  | Motivo                                                              |
|------------------------------|--------|---------------------------------------------------------------------|
| `autocapture`                | `false`| Evita capturar clics/inputs con contenido sensible del lienzo       |
| `disable_session_recording`  | `true` | No graba sesiones (podría capturar texto del lienzo)                |
| `respect_dnt`                | `true` | Respeta la cabecera Do Not Track del navegador                      |
| `persistence`                | `memory`| No escribe cookies ni localStorage; no requiere banner de cookies  |

---

## Identidad

| Acción             | Función en `analytics.ts` | Datos enviados          |
|--------------------|---------------------------|-------------------------|
| Login              | `identifyUser(userId)`    | UUID del usuario (sin email) |
| Logout / reset     | `resetIdentity()`         | —                       |

---

## Taxonomía de eventos

### Auth

| Evento     | Cuándo se dispara                              | Propiedades | Datos sensibles |
|------------|------------------------------------------------|-------------|-----------------|
| `sign_up`  | Registro completado con éxito                  | —           | Ninguno         |
| `login`    | Inicio de sesión completado con éxito          | —           | Ninguno         |
| `logout`   | Sesión cerrada (`SIGNED_OUT` de Supabase Auth) | —           | Ninguno         |

### Ciclo de vida del canvas

| Evento            | Cuándo se dispara                               | Propiedades | Datos sensibles |
|-------------------|-------------------------------------------------|-------------|-----------------|
| `canvas_created`  | Se crea un nuevo canvas                         | —           | Ninguno         |
| `canvas_renamed`  | Se cambia el nombre de un canvas                | —           | El nombre **no** se envía |
| `canvas_deleted`  | Se elimina un canvas                            | —           | Ninguno         |

### Contenido

| Evento              | Cuándo se dispara                                        | Propiedades                    | Datos sensibles |
|---------------------|----------------------------------------------------------|--------------------------------|-----------------|
| `block_edited`      | Un bloque se persiste en la nube tras el autosave (800 ms) | `block_id` (número 1–9)       | El texto del bloque **nunca** se envía |
| `strategic_audit_run` | El usuario ejecuta la auditoría estratégica del lienzo | `filled_blocks` (número 0–9) | Ninguno         |
| `pdf_exported`      | La exportación PDF concluye con éxito                    | —                              | Ninguno         |

### Compartir

| Evento                | Cuándo se dispara                               | Propiedades | Datos sensibles |
|-----------------------|-------------------------------------------------|-------------|-----------------|
| `share_link_created`  | Se genera un enlace de lectura para un canvas   | —           | Ninguno         |
| `share_link_revoked`  | Se revoca un enlace de lectura                  | —           | Ninguno         |

---

## Ficheros clave

| Fichero                          | Responsabilidad                                                   |
|----------------------------------|-------------------------------------------------------------------|
| `src/lib/analytics.ts`           | Capa de abstracción: `initAnalytics`, helpers de eventos          |
| `src/main.tsx`                   | Llama a `initAnalytics()` antes del primer render                 |
| `src/contexts/AuthContext.tsx`   | Instrumenta `sign_up`, `login`, `logout`, `identifyUser`          |
| `src/hooks/useCanvases.ts`       | Instrumenta `canvas_created`, `canvas_renamed`, `canvas_deleted`, `block_edited` |
| `src/hooks/useCanvasSharing.ts`  | Instrumenta `share_link_created`, `share_link_revoked`            |
| `src/pages/WorkspacePage.tsx`    | Instrumenta `strategic_audit_run`, `pdf_exported`                 |

---

## Añadir nuevos eventos

1. Exporta una nueva función `trackXxx()` en `src/lib/analytics.ts` siguiendo el patrón existente.
2. Llama a la función desde el punto de código apropiado.
3. Documenta el evento en esta tabla.

> **Regla de oro**: nunca envíes texto libre del lienzo, nombres de canvas ni información del usuario
> más allá del UUID asignado por Supabase.
