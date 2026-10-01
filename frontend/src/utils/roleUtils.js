/**
 * Role-aware routing utilities.
 * Admin roles (Admin, Moderator, Analyst) land in the /admin workspace.
 * Citizens and unauthenticated users land in /dashboard.
 */

export const ADMIN_ROLES = ['Admin', 'Moderator', 'Analyst'];

/**
 * Returns the correct workspace root path for a given user role.
 * @param {string|null|undefined} role
 * @returns {string} '/admin' or '/dashboard'
 */
export function getWorkspacePath(role) {
  return ADMIN_ROLES.includes(role) ? '/admin' : '/dashboard';
}

/**
 * Returns a human-readable workspace label for a given role.
 * @param {string|null|undefined} role
 * @returns {string}
 */
export function getWorkspaceLabel(role) {
  return ADMIN_ROLES.includes(role) ? 'Admin Workspace' : 'My Dashboard';
}
