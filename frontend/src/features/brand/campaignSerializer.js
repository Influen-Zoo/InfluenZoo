/**
 * campaignSerializer.js
 * Business logic for serializing Campaign data from UI forms to API FormData payloads
 */

export const serializeCampaignPayload = ({
  title,
  content,
  tags,
  mediaFiles,
  budget,
  category,
  startDate,
  endDate,
  compensation,
  requirements,
  deliverables
}) => {
  const formData = new FormData();
  if (title?.trim()) formData.append('title', title);
  formData.append('content', content);

  const tagsArray = tags?.split(',').map(t => t.trim()).filter(Boolean) || [];
  formData.append('tags', JSON.stringify(tagsArray));

  const retainedMedia = [];
  mediaFiles.forEach(media => {
    if (media.isExisting) {
      retainedMedia.push({ url: media.url, type: media.type });
    } else {
      formData.append('media', media.file);
    }
  });
  formData.append('retainedMedia', JSON.stringify(retainedMedia));

  if (budget) formData.append('budget', budget);
  if (category) formData.append('category', category);
  if (startDate) formData.append('startDate', startDate);
  if (endDate) formData.append('endDate', endDate);
  if (compensation) formData.append('compensation', compensation);
  if (requirements) formData.append('requirements', requirements);
  
  if (deliverables) {
    const delArray = deliverables.split(',').map(d => d.trim()).filter(Boolean);
    formData.append('deliverables', JSON.stringify(delArray));
  }

  return formData;
};
