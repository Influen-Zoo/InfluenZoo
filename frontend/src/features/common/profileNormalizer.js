/**
 * profileNormalizer.js
 * Business logic for normalizing user profile data schema
 */

export const normalizeProfile = (value) => {
  const normalized = value || {};

  return {
    ...normalized,
    userBio:
      normalized.userBio && typeof normalized.userBio === 'object' && !Array.isArray(normalized.userBio)
        ? normalized.userBio
        : null,
    education: Array.isArray(normalized.education) ? normalized.education.filter(Boolean) : [],
    work: Array.isArray(normalized.work) ? normalized.work.filter(Boolean) : [],
  };
};
