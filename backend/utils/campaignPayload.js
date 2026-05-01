const CAMPAIGN_PLATFORMS = ['Instagram', 'YouTube', 'Twitter', 'TikTok', 'Facebook', 'Other'];

const parseStringList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (item && typeof item === 'object') {
          return item.name || item.label || item.value || item.outlet || item.platform || '';
        }
        return item;
      })
      .map(item => String(item).trim())
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parseStringList(parsed);
    } catch {}
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }
  if (typeof value === 'object') {
    return parseStringList(value.name || value.label || value.value || value.outlet || value.platform);
  }
  return [];
};

const normalizePlatforms = (...values) => {
  const platforms = values
    .flatMap(parseStringList)
    .map(platform => CAMPAIGN_PLATFORMS.find(name => name.toLowerCase() === platform.toLowerCase()))
    .filter(Boolean);

  return [...new Set(platforms)];
};

const normalizeCampaignForResponse = (campaign) => {
  if (!campaign) return campaign;
  const data = typeof campaign.toObject === 'function' ? campaign.toObject() : campaign;
  const storedPlatforms = normalizePlatforms(data.platforms);
  const legacyPlatforms = normalizePlatforms(data.platform);
  const shouldUseLegacyPlatform = (
    legacyPlatforms.length > 0 &&
    (storedPlatforms.length === 0 || (storedPlatforms.length === 1 && storedPlatforms[0] === 'Other'))
  );
  const platforms = shouldUseLegacyPlatform ? legacyPlatforms : storedPlatforms;

  return {
    ...data,
    platforms: platforms.length > 0 ? platforms : ['Other'],
    platform: platforms[0] || data.platform || 'Other',
    outlets: parseStringList(data.outlets),
  };
};

module.exports = {
  CAMPAIGN_PLATFORMS,
  parseStringList,
  normalizePlatforms,
  normalizeCampaignForResponse,
};
