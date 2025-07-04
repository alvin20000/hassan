-- Full schema for Hassan Foods product management and admin dashboard

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    category_id INTEGER,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table (optional, for product categorization)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- Foreign key constraint for products.category_id
ALTER TABLE products
    ADD CONSTRAINT fk_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE SET NULL;

-- Create the missing create_product_enhanced function
CREATE OR REPLACE FUNCTION create_product_enhanced(
    p_admin_id TEXT,
    p_product_data JSONB,
    p_images TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_product_id TEXT;
    product_result JSONB;
    image_url TEXT;
    image_index INTEGER := 0;
    main_image_url TEXT;
BEGIN
    -- Set admin context
    PERFORM set_config('app.is_admin', 'true', true);
    
    -- Extract product ID or generate one
    new_product_id := COALESCE(
        (p_product_data->>'id')::TEXT,
        'product-' || extract(epoch from now())::BIGINT || '-' || floor(random() * 1000)::TEXT
    );
    
    -- Determine main image URL
    main_image_url := COALESCE(
        (p_product_data->>'image')::TEXT,
        CASE WHEN array_length(p_images, 1) > 0 THEN p_images[1] ELSE '/images/placeholder.jpg' END
    );
    
    -- Insert the product
    INSERT INTO products (
        id,
        name,
        description,
        price,
        category_id,
        image_url
    ) VALUES (
        new_product_id,
        (p_product_data->>'name')::TEXT,
        (p_product_data->>'description')::TEXT,
        (p_product_data->>'price')::NUMERIC,
        (p_product_data->>'category_id')::INTEGER,
        main_image_url
    );
    
    -- Return the created product
    SELECT jsonb_build_object(
        'id', new_product_id,
        'name', (p_product_data->>'name')::TEXT,
        'image', main_image_url,
        'success', true
    ) INTO product_result;
    
    RETURN product_result;
END;
$$;

-- Create the missing update_product_enhanced function
CREATE OR REPLACE FUNCTION update_product_enhanced(
    p_admin_id TEXT,
    p_product_id TEXT,
    p_product_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    product_result JSONB;
BEGIN
    -- Set admin context
    PERFORM set_config('app.is_admin', 'true', true);
    
    -- Update the product
    UPDATE products SET
        name = COALESCE((p_product_data->>'name')::TEXT, name),
        description = COALESCE((p_product_data->>'description')::TEXT, description),
        price = COALESCE((p_product_data->>'price')::NUMERIC, price),
        category_id = COALESCE((p_product_data->>'category_id')::INTEGER, category_id),
        image_url = COALESCE((p_product_data->>'image')::TEXT, image_url),
        updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Check if any rows were affected
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with id % not found', p_product_id;
    END IF;
    
    -- Return the updated product
    SELECT jsonb_build_object(
        'id', p_product_id,
        'name', (p_product_data->>'name')::TEXT,
        'success', true
    ) INTO product_result;
    
    RETURN product_result;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_product_enhanced(TEXT, JSONB, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_enhanced(TEXT, TEXT, JSONB) TO authenticated; 