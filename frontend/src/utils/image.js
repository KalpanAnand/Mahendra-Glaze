export const optimizeImageUrl = (url, width = 600) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // This tells Cloudinary to automatically use the best format (f_auto), 
  // compress without losing visible quality (q_auto), and resize to a reasonable width.
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
};
