/**
 * postSerializer.js
 * Business logic for serializing Post data from UI forms to API FormData payloads
 */

export const serializePostPayload = (content, mediaFiles, tags) => {
  const formData = new FormData();
  
  if (content?.trim()) {
    formData.append('content', content);
  }
  
  const tagsArray = typeof tags === 'string' 
    ? tags.split(',').map(t => t.trim()).filter(Boolean)
    : tags;
    
  formData.append('tags', JSON.stringify(tagsArray || []));

  const retainedMedia = [];
  mediaFiles.forEach(media => {
    if (media.isExisting) {
      retainedMedia.push({ url: media.url, type: media.type });
    } else {
      formData.append('media', media.file);
    }
  });
  formData.append('retainedMedia', JSON.stringify(retainedMedia));

  return formData;
};
