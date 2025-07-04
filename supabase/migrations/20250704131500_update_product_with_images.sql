-- Migration: Add update_product_with_images function for product updates with image support

CREATE OR REPLACE FUNCTION update_product_with_images(
    p_product_id TEXT,
    p_product_data JSONB,
    p_images TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    product_result JSONB;
    image_url TEXT;
    image_index INTEGER := 0;
    main_image_url TEXT;
BEGIN
    -- Set admin context
    PERFORM set_config('app.is_admin', 'true', true);

    -- Determine main image URL
    main_image_url := COALESCE(
        (p_product_data->>'image')::TEXT,
        CASE WHEN array_length(p_images, 1) > 0 THEN p_images[1] ELSE '/images/placeholder.jpg' END
    );

    -- Update the product
    UPDATE products SET
        name = COALESCE((p_product_data->>'name')::TEXT, name),
        description = COALESCE((p_product_data->>'description')::TEXT, description),
        price = COALESCE((p_product_data->>'price')::NUMERIC, price),
        category_id = COALESCE((p_product_data->>'category_id')::TEXT, category_id),
        tags = COALESCE((p_product_data->>'tags')::TEXT[], tags),
        unit = COALESCE((p_product_data->>'unit')::TEXT, unit),
        available = COALESCE((p_product_data->>'available')::BOOLEAN, available),
        featured = COALESCE((p_product_data->>'featured')::BOOLEAN, featured),
        image = main_image_url,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- If images are provided, update product_images table
    IF array_length(p_images, 1) > 0 THEN
        -- Delete existing images for this product
        DELETE FROM product_images WHERE product_id = p_product_id;
        -- Insert new images
        FOREACH image_url IN ARRAY p_images
        LOOP
            INSERT INTO product_images (
                product_id,
                image_url,
                display_order,
                is_primary
            ) VALUES (
                p_product_id,
                image_url,
                image_index,
                image_index = 0  -- First image is primary
            );
            image_index := image_index + 1;
        END LOOP;
    END IF;

    -- Return the updated product
    SELECT jsonb_build_object(
        'id', p_product_id,
        'name', (p_product_data->>'name')::TEXT,
        'image', main_image_url,
        'success', true
    ) INTO product_result;

    RETURN product_result;
END;
$$;

GRANT EXECUTE ON FUNCTION update_product_with_images(TEXT, JSONB, TEXT[]) TO authenticated; 