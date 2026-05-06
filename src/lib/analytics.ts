import posthog from 'posthog-js';

// ── Initialisation ────────────────────────────────────────────────────────────

/**
 * Initialise PostHog analytics.
 *
 * Call once before the first React render (see main.tsx).
 * When VITE_POSTHOG_KEY is not set the SDK is not loaded and every
 * exported helper becomes a no-op, so the app works without the key.
 * Subsequent calls after the first successful init are safe no-ops
 * because PostHog guards against double initialisation internally.
 */
export function initAnalytics() {
  const apiKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  if (!apiKey) return;

  const host =
    (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ??
    'https://eu.i.posthog.com';

  posthog.init(apiKey, {
    api_host: host,
    // Autocapture is disabled: we rely exclusively on explicit track() calls
    // so we never accidentally record sensitive canvas content.
    autocapture: false,
    // Disable session recording to avoid capturing typed content.
    disable_session_recording: true,
    // Respect Do Not Track headers.
    respect_dnt: true,
    // Use memory-only storage so the cookie banner can stay simple.
    persistence: 'memory',
  });
}

// ── Identity ──────────────────────────────────────────────────────────────────

/** Associate subsequent events with an authenticated user (by ID only — no email). */
export function identifyUser(userId: string) {
  if (!posthog.__loaded) return;
  posthog.identify(userId);
}

/** Reset identity on sign-out. */
export function resetIdentity() {
  if (!posthog.__loaded) return;
  posthog.reset();
}

// ── Event helpers ─────────────────────────────────────────────────────────────

function track(event: string, properties?: Record<string, unknown>) {
  if (!posthog.__loaded) return;
  posthog.capture(event, properties);
}

// ── Auth events ───────────────────────────────────────────────────────────────

/** User completed the registration flow. */
export function trackSignUp() {
  track('sign_up');
}

/** User signed in successfully. */
export function trackLogin() {
  track('login');
}

/** User signed out. */
export function trackLogout() {
  track('logout');
}

// ── Canvas lifecycle events ───────────────────────────────────────────────────

/** A new canvas was created. */
export function trackCanvasCreated() {
  track('canvas_created');
}

/** A new canvas was created from a template. Only the template ID is sent. */
export function trackCanvasCreatedFromTemplate(templateId: string) {
  track('canvas_created_from_template', { template_id: templateId });
}

/** An existing canvas was renamed (no name content captured). */
export function trackCanvasRenamed() {
  track('canvas_renamed');
}

/** A canvas was deleted. */
export function trackCanvasDeleted() {
  track('canvas_deleted');
}

// ── Content events ────────────────────────────────────────────────────────────

/**
 * A canvas block was edited and persisted.
 * Only the structural block_id (1–9) is sent — never the text content.
 */
export function trackBlockEdited(blockId: number) {
  track('block_edited', { block_id: blockId });
}

/** The strategic-audit feature was run against a canvas. */
export function trackStrategicAuditRun(filledBlocks: number) {
  track('strategic_audit_run', { filled_blocks: filledBlocks });
}

/** A canvas was exported to PDF. */
export function trackPdfExported() {
  track('pdf_exported');
}

// ── Workspace events ──────────────────────────────────────────────────────────

/** A new workspace was created. */
export function trackWorkspaceCreated() {
  track('workspace_created');
}

/** A workspace was deleted. */
export function trackWorkspaceDeleted() {
  track('workspace_deleted');
}

/** A read-only share link was generated. */
export function trackShareLinkCreated() {
  track('share_link_created');
}

/** A share link was revoked. */
export function trackShareLinkRevoked() {
  track('share_link_revoked');
}

// ── Invitation events ─────────────────────────────────────────────────────────

/** An invitation was sent to a collaborator. */
export function trackInvitationSent() {
  track('invitation_sent');
}

/** A user accepted a workspace invitation. */
export function trackInvitationAccepted() {
  track('invitation_accepted');
}

// ── Presentation events ───────────────────────────────────────────────────────

/** The presentation mode was entered for a canvas. */
export function trackPresentationModeEntered() {
  track('presentation_mode_entered');
}

// ── Feedback / comment events ─────────────────────────────────────────────────

/** An external reviewer submitted feedback on a shared canvas. */
export function trackFeedbackSubmitted(hasBlockId: boolean) {
  track('feedback_submitted', { targeted: hasBlockId });
}

/** The canvas owner opened the feedback panel to review comments. */
export function trackFeedbackPanelOpened(commentCount: number) {
  track('feedback_panel_opened', { comment_count: commentCount });
}
