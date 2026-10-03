const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600';

/**
 * Rewrite a stored Cloudinary URL for delivery.
 * The API/database keep the original URL; only <img src> should use this.
 *
 * https://res.cloudinary.com/.../image/upload/v123/file.jpg
 * → https://res.cloudinary.com/.../image/upload/f_auto,q_auto,w_600,c_limit/v123/file.jpg
 */
export const optimizeImageUrl = (url, width = 600) => {
  if (!url || typeof url !== 'string') return url;

  const transform = `f_auto,q_auto,w_${width},c_limit`;
  const uploadMarker = '/image/upload/';
  const uploadIndex = url.indexOf(uploadMarker);

  if (uploadIndex === -1) return url;
  if (url.includes(`/${transform}/`)) return url;

  const prefix = url.slice(0, uploadIndex + uploadMarker.length);
  let remainder = url.slice(uploadIndex + uploadMarker.length);

  // Drop any previous transformation segment so we never stack them.
  if (!remainder.startsWith('v') && remainder.includes('/v')) {
    remainder = remainder.slice(remainder.indexOf('/v') + 1);
  }

  return `${prefix}${transform}/${remainder}`;
};

export const getPrimaryImage = (product) => {
  if (!product?.images?.length) return null;
  return product.images.find((img) => img.isPrimary) || product.images[0];
};

export const getPrimaryImageUrl = (product, width = 600) => {
  const primary = getPrimaryImage(product);
  return primary ? optimizeImageUrl(primary.imageUrl, width) : PLACEHOLDER_IMAGE;
};

/** Listing pages should never keep a full gallery in memory. */
export const withPrimaryImageOnly = (product) => {
  const primary = getPrimaryImage(product);
  return {
    ...product,
    images: primary ? [primary] : [],
  };
};

export const sortImagesPrimaryFirst = (images = []) =>
  [...images].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return 0;
  });
