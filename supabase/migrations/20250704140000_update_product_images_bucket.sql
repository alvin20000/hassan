-- Migration: Update product images to use new "products-images" bucket structure

-- Create the new products-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products-images', 
  'products-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing storage policies for the old bucket
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Create comprehensive storage policies for the new products-images bucket

-- Allow anyone (including anonymous users) to view product images
CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'products-images');

-- Allow authenticated users with admin context to upload images
CREATE POLICY "Admins can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'products-images'
    AND (
      -- Check if user has admin context set
      COALESCE(current_setting('app.is_admin', true), 'false') = 'true'
      OR
      -- Fallback: check if user exists in admin_users table
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE id::text = auth.uid()::text
          AND is_active = true
      )
    )
  );

-- Allow authenticated admins to update images
CREATE POLICY "Admins can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'products-images'
    AND (
      COALESCE(current_setting('app.is_admin', true), 'false') = 'true'
      OR
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE id::text = auth.uid()::text
          AND is_active = true
      )
    )
  );

-- Allow authenticated admins to delete images
CREATE POLICY "Admins can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'products-images'
    AND (
      COALESCE(current_setting('app.is_admin', true), 'false') = 'true'
      OR
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE id::text = auth.uid()::text
          AND is_active = true
      )
    )
  );

-- Update existing product images to use the new bucket structure
-- This will help with backward compatibility
UPDATE product_images 
SET image_url = REPLACE(image_url, 'product-images', 'products-images')
WHERE image_url LIKE '%product-images%';

-- Update products table image field to use new bucket structure
UPDATE products 
SET image = REPLACE(image, 'product-images', 'products-images')
WHERE image LIKE '%product-images%';

-- Create a function to migrate existing images to the new bucket structure
CREATE OR REPLACE FUNCTION migrate_product_images_to_new_bucket()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  product_record RECORD;
  old_url TEXT;
  new_url TEXT;
  file_path TEXT;
BEGIN
  -- Set admin context
  PERFORM set_config('app.is_admin', 'true', true);
  
  -- Update product_images table
  FOR product_record IN 
    SELECT id, image_url 
    FROM product_images 
    WHERE image_url LIKE '%product-images%'
  LOOP
    old_url := product_record.image_url;
    file_path := REPLACE(old_url, 'https://' || current_setting('app.supabase_url') || '/storage/v1/object/public/product-images/', '');
    new_url := 'https://' || current_setting('app.supabase_url') || '/storage/v1/object/public/products-images/' || file_path;
    
    UPDATE product_images 
    SET image_url = new_url
    WHERE id = product_record.id;
  END LOOP;
  
  -- Update products table
  FOR product_record IN 
    SELECT id, image 
    FROM products 
    WHERE image LIKE '%product-images%'
  LOOP
    old_url := product_record.image;
    file_path := REPLACE(old_url, 'https://' || current_setting('app.supabase_url') || '/storage/v1/object/public/product-images/', '');
    new_url := 'https://' || current_setting('app.supabase_url') || '/storage/v1/object/public/products-images/' || file_path;
    
    UPDATE products 
    SET image = new_url
    WHERE id = product_record.id;
  END LOOP;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION migrate_product_images_to_new_bucket() TO authenticated;

-- Update the upload function to use the new bucket
CREATE OR REPLACE FUNCTION upload_product_image(
  p_file_name text,
  p_file_path text,
  p_file_size bigint,
  p_content_type text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_name text := 'products-images';
  full_path text;
  public_url text;
BEGIN
  -- Set admin context
  PERFORM set_config('app.is_admin', 'true', true);
  
  -- Construct the full path
  full_path := 'products/' || p_file_path;
  
  -- Construct the public URL
  public_url := 'https://' || current_setting('app.supabase_url') || '/storage/v1/object/public/' || bucket_name || '/' || full_path;
  
  RETURN public_url;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upload_product_image(text, text, bigint, text) TO authenticated; 