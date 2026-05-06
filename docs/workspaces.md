# Workspaces — Data Model & Access Rules

## Overview

Lean Canvas Pro soporta **workspaces de equipo**. Un usuario puede pertenecer a uno o varios workspaces y crear lienzos asociados a ellos. Todos los lienzos anteriores siguen existiendo como lienzos **personales** (sin workspace).

---

## Tablas

### `workspaces`

| Columna      | Tipo          | Descripción                                      |
|-------------|--------------|--------------------------------------------------|
| `id`         | `uuid` PK     | Identificador único del workspace.               |
| `name`       | `text`        | Nombre visible del workspace.                    |
| `owner_id`   | `uuid` → `auth.users` | Usuario que creó el workspace; siempre tiene rol `owner`. |
| `created_at` | `timestamptz` | Fecha de creación.                               |
| `updated_at` | `timestamptz` | Actualizado automáticamente por trigger.         |

### `workspace_members`

| Columna        | Tipo          | Descripción                                              |
|---------------|--------------|----------------------------------------------------------|
| `workspace_id` | `uuid` → `workspaces` | FK al workspace. ON DELETE CASCADE.           |
| `user_id`      | `uuid` → `auth.users` | FK al usuario miembro. ON DELETE CASCADE.     |
| `role`         | `text`        | `'owner'` (creador) o `'member'` (invitado).             |
| `joined_at`    | `timestamptz` | Fecha de incorporación.                                  |
| PK             | `(workspace_id, user_id)` | Clave compuesta — un usuario no puede estar dos veces. |

> **Trigger `workspaces_add_owner`**: al insertar un workspace, el creador queda automáticamente añadido a `workspace_members` con `role = 'owner'`.

### `workspace_invitations`

| Columna        | Tipo                   | Descripción                                                        |
|---------------|------------------------|--------------------------------------------------------------------|
| `id`           | `uuid` PK              | Identificador único de la invitación.                              |
| `workspace_id` | `uuid` → `workspaces`  | FK al workspace. ON DELETE CASCADE.                                |
| `invited_by`   | `uuid` → `auth.users`  | FK al owner que emite la invitación. ON DELETE CASCADE.            |
| `email`        | `text`                 | Correo electrónico del invitado (almacenado en minúsculas).        |
| `token`        | `uuid` UNIQUE          | Token secreto incluido en el enlace de invitación.                 |
| `status`       | `text`                 | `'pending'` → `'accepted'` o `'revoked'`.                          |
| `created_at`   | `timestamptz`          | Fecha de creación.                                                 |
| `expires_at`   | `timestamptz`          | Expira 7 días después de la creación.                              |

> **Índice único**: una sola invitación `pending` por par `(workspace_id, lower(email))`.



| Columna        | Tipo                   | Descripción                                                  |
|---------------|------------------------|--------------------------------------------------------------|
| `workspace_id` | `uuid` nullable → `workspaces` | `NULL` = lienzo personal; non-null = lienzo del workspace. ON DELETE SET NULL. |

---

## Reglas de acceso (RLS)

### `workspaces`

| Operación | Quién puede |
|-----------|-------------|
| SELECT    | Cualquier miembro del workspace (vía `workspace_members`). |
| INSERT    | Cualquier usuario autenticado (`owner_id` debe ser `auth.uid()`). |
| UPDATE    | Solo el `owner_id`. |
| DELETE    | Solo el `owner_id`. |

### `workspace_members`

| Operación | Quién puede |
|-----------|-------------|
| SELECT    | Cualquier miembro del mismo workspace. |
| INSERT    | Solo el owner del workspace. |
| DELETE    | El owner puede eliminar a cualquier miembro; un miembro puede eliminarse a sí mismo (abandonar). |

### `workspace_invitations`

| Operación | Quién puede |
|-----------|-------------|
| SELECT    | Solo el owner del workspace (para ver sus invitaciones pendientes). |
| INSERT    | Solo el owner del workspace (`invited_by` = `auth.uid()`). |
| UPDATE    | Solo el owner (para revocar — cambia `status` a `'revoked'`). |
| Aceptar   | Vía RPC `accept_workspace_invitation` (SECURITY DEFINER); el invitado debe estar autenticado con el email exacto de la invitación. |

### `canvases`

| Policy                                  | Op     | Scope                      | Quién puede |
|----------------------------------------|--------|----------------------------|-------------|
| `Manage personal canvases`             | ALL    | `workspace_id IS NULL`     | Solo el `user_id` (propietario del lienzo). |
| `Members can view workspace canvases`  | SELECT | `workspace_id IS NOT NULL` | Cualquier miembro del workspace. |
| `Members can create workspace canvases`| INSERT | `workspace_id IS NOT NULL` | Cualquier miembro del workspace. |
| `Members can update workspace canvases`| UPDATE | `workspace_id IS NOT NULL` | Cualquier miembro del workspace. |
| `Creator or owner can delete workspace canvas` | DELETE | `workspace_id IS NOT NULL` | El creador del lienzo (`user_id`) o el owner del workspace. |

---

## Modelo de permisos de roles

> Implementado en `src/lib/permissions.ts` · Expuesto vía `WorkspaceContext` (`userRole`, `isOwner`).

| Acción                              | owner | member |
|-------------------------------------|:-----:|:------:|
| Ver lienzos del workspace           | ✅    | ✅     |
| Crear lienzo en el workspace        | ✅    | ✅     |
| Editar bloques de cualquier lienzo  | ✅    | ✅     |
| Compartir lienzo (enlace público)   | ✅    | ✅     |
| Eliminar lienzo propio              | ✅    | ✅     |
| Eliminar lienzo de otro miembro     | ✅    | ❌     |
| Renombrar workspace                 | ✅    | ❌     |
| Eliminar workspace                  | ✅    | ❌     |
| Invitar miembros                    | ✅    | ❌     |
| Revocar invitaciones                | ✅    | ❌     |

> Los permisos de workspace (renombrar, eliminar, invitar) se refuerzan en dos capas:
> 1. **UI** — los botones solo se renderizan cuando `isOwner === true` (Toolbar).
> 2. **DB** — las políticas RLS rechazan cualquier operación no autorizada aunque se intente directamente contra la API.

---

## Invariantes y restricciones

1. **Un workspace siempre tiene al menos un owner** — el trigger garantiza esto en la creación. No se puede degradar al owner sin transferir la propiedad.
2. **Los lienzos personales son privados** — `workspace_id IS NULL` activa la política personal; solo el creador puede acceder.
3. **Borrar un workspace** no borra los lienzos; su `workspace_id` queda en `NULL` (pasan a ser personales del creador).
4. **Sin colaboración en tiempo real** — no hay Supabase Realtime habilitado sobre estas tablas. Cada usuario ve su propia sesión.

---

## Flujo de invitación

```
Owner abre modal "Invitar" en un workspace activo
  → Introduce email del invitado → crea invitación (INSERT workspace_invitations)
  → El modal muestra el enlace /invite/<token> para compartir manualmente

Invitado navega a /invite/<token>
  → AcceptInvitePage llama RPC get_workspace_invitation_by_token(token)
  → Se muestran: nombre del workspace + email al que va dirigida
  → Si no está autenticado: se le pide que inicie sesión con ese email
  → Si está autenticado: botón "Aceptar invitación"
    → Llama RPC accept_workspace_invitation(token)
    → El RPC valida: token pending, no expirado, email coincide con auth.email()
    → INSERT workspace_members (role = 'member')
    → UPDATE workspace_invitations SET status = 'accepted'
    → Redirige al usuario a la app
```

## Flujo de uso

```
Usuario crea workspace "Acme"
  → INSERT workspaces (owner_id = uid)
  → Trigger inserta workspace_members (role = 'owner')

Usuario selecciona workspace "Acme" en el toolbar
  → useCanvases("acme-uuid") lista canvases WHERE workspace_id = "acme-uuid"

Usuario crea un lienzo en workspace "Acme"
  → createCanvas(id, name, data, workspaceId = "acme-uuid")
  → INSERT canvases (workspace_id = "acme-uuid")

Owner invita a otro usuario
  → INSERT workspace_members (workspace_id, user_id, role = 'member')
  → El invitado puede leer/escribir todos los lienzos del workspace
  → El invitado NO puede renombrar/eliminar el workspace ni invitar a otros
```

---

## Preparado para crecer

- La tabla `workspace_members` ya soporta múltiples roles. Se pueden añadir `admin`, `viewer`, etc.
- Las invitaciones están preparadas para integrarse con un servicio de email (Edge Function con service role) — el envío manual del enlace cubre la fase actual.
- La colaboración en tiempo real se puede habilitar suscribiéndose a los cambios de Supabase Realtime en `canvases` filtrados por `workspace_id`.
