const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600';

export const optimizeImageUrl = (url, width = 600) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_auto')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
};

export const getPrimaryImage = (product) => {
  if (!product?.images?.length) return null;
  return product.images.find((img) => img.isPrimary) || product.images[0];
};

export const getPrimaryImageUrl = (product, width = 600) => {
  const primary = getPrimaryImage(product);
  return primary ? optimizeImageUrl(primary.imageUrl, width) : PLACEHOLDER_IMAGE;
};

export const sortImagesPrimaryFirst = (images = []) =>
  [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return 0;
  });
