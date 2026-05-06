/**
 * Workspace permissions model.
 *
 * Two roles exist:
 *  - owner  – the user who created the workspace. Full control.
 *  - member – any user who accepted an invitation. Can collaborate on canvases.
 *
 * Personal scope (no workspace selected) has no role concept; the user owns
 * everything outright.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type WorkspaceRole = 'owner' | 'member';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derive the role of `userId` in a workspace whose owner is `ownerId`.
 * If either value is undefined the user is treated as a member (least privilege).
 */
export function deriveRole(
  ownerId: string | undefined,
  userId: string | undefined
): WorkspaceRole {
  return ownerId !== undefined && ownerId === userId ? 'owner' : 'member';
}

// ── Permission checks ─────────────────────────────────────────────────────────

/**
 * Workspace-level permissions.
 *
 * owner  → rename / delete workspace, invite / revoke members
 * member → read and write canvases only
 */
export const WorkspacePermissions = {
  /** Rename or delete the workspace. Owner only. */
  canManageWorkspace: (role: WorkspaceRole): boolean => role === 'owner',

  /** Invite new members or revoke pending invitations. Owner only. */
  canManageMembers: (role: WorkspaceRole): boolean => role === 'owner',

  /**
   * Create a new canvas inside the workspace. All members.
   * Parameter kept for API consistency — future roles (e.g. viewer) may restrict this.
   */
  canCreateCanvas: (_role: WorkspaceRole): boolean => true,

  /**
   * Edit blocks in any workspace canvas. All members.
   * Parameter kept for API consistency — future roles (e.g. viewer) may restrict this.
   */
  canEditCanvas: (_role: WorkspaceRole): boolean => true,

  /**
   * Delete a workspace canvas.
   * Allowed for the workspace owner OR the canvas creator.
   *
   * @param isCanvasCreator - true when the current user created the canvas
   *   (i.e. canvas.user_id === auth.uid()).
   */
  canDeleteCanvas: (role: WorkspaceRole, isCanvasCreator: boolean): boolean =>
    role === 'owner' || isCanvasCreator,

  /**
   * Create or revoke a public share link. All members.
   * Parameter kept for API consistency — future roles (e.g. viewer) may restrict this.
   */
  canShareCanvas: (_role: WorkspaceRole): boolean => true,

  /**
   * View feedback (comments) left by external reviewers on a canvas.
   * Only the canvas owner can read comments.
   * The `isCanvasOwner` flag is true when `canvas.user_id === auth.uid()`.
   */
  canViewFeedback: (_role: WorkspaceRole, isCanvasOwner: boolean): boolean => isCanvasOwner,
} as const;
