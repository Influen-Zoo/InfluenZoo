/**
 * authUtils.js
 * Contains business logic for manipulating and validating Authentication Tokens
 */

export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const [, payload] = token.split('.');
    const parsed = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (!parsed?.exp) return false;
    return parsed.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};
