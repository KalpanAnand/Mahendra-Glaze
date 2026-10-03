-- Mark the first image (lowest id) as primary for products that have no primary image
UPDATE product_images pi
SET is_primary = true
FROM (
    SELECT DISTINCT ON (product_id) id
    FROM product_images
    ORDER BY product_id, id ASC
) first_image
WHERE pi.id = first_image.id
  AND NOT EXISTS (
    SELECT 1
    FROM product_images existing
    WHERE existing.product_id = pi.product_id
      AND existing.is_primary = true
  );
