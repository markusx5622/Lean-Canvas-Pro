# Workspaces — Data Model & Access Rules

## Overview

Lean Canvas Pro soporta **workspaces de equipo**. Un usuario puede pertenecer a uno o varios workspaces y crear lienzes asociados a ellos. Todos los lienzes anteriores siguen existiendo como lienzes **personales** (sin workspace).

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

### `canvases` (columna añadida)

| Columna        | Tipo                   | Descripción                                                  |
|---------------|------------------------|--------------------------------------------------------------|
| `workspace_id` | `uuid` nullable → `workspaces` | `NULL` = lienzo personal; non-null = lienzo de workspace. ON DELETE SET NULL. |

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

### `canvases`

| Policy                       | Scope                   | Quién puede |
|-----------------------------|-------------------------|-------------|
| `Manage personal canvases`  | `workspace_id IS NULL`  | Solo el `user_id` (propietario del lienzo). |
| `Members manage workspace canvases` | `workspace_id IS NOT NULL` | Cualquier miembro del workspace (`workspace_members`). |

---

## Invariantes y restricciones

1. **Un workspace siempre tiene al menos un owner** — el trigger garantiza esto en la creación. No se puede degradar al owner sin transferir la propiedad.
2. **Los lienzes personales son privados** — `workspace_id IS NULL` activa la política personal; solo el creador puede acceder.
3. **Borrar un workspace** no borra los lienzes; su `workspace_id` queda en `NULL` (pasan a ser personales del creador).
4. **Sin colaboración en tiempo real** — no hay Supabase Realtime habilitado sobre estas tablas. Cada usuario ve su propia sesión.

---

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

Futuro: owner invita a otro usuario
  → INSERT workspace_members (workspace_id, user_id, role = 'member')
  → El invitado puede leer/escribir todos los canvases del workspace
```

---

## Preparado para crecer

- La tabla `workspace_members` ya soporta múltiples roles. Se pueden añadir `admin`, `viewer`, etc.
- La invitación por email requiere una función Edge (lookup por email con service role) — no incluida en esta versión.
- La colaboración en tiempo real se puede habilitar suscribiéndose a los cambios de Supabase Realtime en `canvases` filtrados por `workspace_id`.
