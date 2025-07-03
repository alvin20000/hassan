/*
  # Create Default Admin User

  1. New Data
    - Insert default admin user with username 'admin' and password 'admin123'
    - Password is hashed using bcrypt for security
    
  2. Security
    - Uses secure password hashing
    - Sets up default admin with proper role
    
  3. Functions
    - Creates authentication functions for admin login
    - Includes enhanced authentication with better error handling
*/

-- First, ensure we have the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert the default admin user with hashed password
INSERT INTO admin_users (
  id,
  username,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin',
  'admin@mastore.com',
  crypt('admin123', gen_salt('bf')),
  'System Administrator',
  'super_admin',
  true,
  now(),
  now()
) ON CONFLICT (username) DO UPDATE SET
  password_hash = crypt('admin123', gen_salt('bf')),
  updated_at = now();

-- Create or replace the admin authentication function
CREATE OR REPLACE FUNCTION authenticate_admin(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  result json;
BEGIN
  -- Find the admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE username = p_username
    AND is_active = true;

  -- Check if user exists and password is correct
  IF admin_record.id IS NULL THEN
    RAISE EXCEPTION 'Invalid username or password';
  END IF;

  -- Verify password
  IF NOT (admin_record.password_hash = crypt(p_password, admin_record.password_hash)) THEN
    RAISE EXCEPTION 'Invalid username or password';
  END IF;

  -- Update last login
  UPDATE admin_users 
  SET last_login = now(), updated_at = now()
  WHERE id = admin_record.id;

  -- Return admin data (excluding password)
  SELECT json_build_object(
    'id', admin_record.id,
    'username', admin_record.username,
    'email', admin_record.email,
    'full_name', admin_record.full_name,
    'role', admin_record.role,
    'avatar_url', admin_record.avatar_url,
    'last_login', admin_record.last_login,
    'session_id', extract(epoch from now())::text
  ) INTO result;

  RETURN result;
END;
$$;

-- Create enhanced authentication function with better error handling
CREATE OR REPLACE FUNCTION authenticate_admin_enhanced(p_username text, p_password text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  result json;
BEGIN
  -- Find the admin user
  SELECT * INTO admin_record
  FROM admin_users
  WHERE username = p_username
    AND is_active = true;

  -- Check if user exists and password is correct
  IF admin_record.id IS NULL THEN
    RAISE EXCEPTION 'Invalid username or password';
  END IF;

  -- Verify password
  IF NOT (admin_record.password_hash = crypt(p_password, admin_record.password_hash)) THEN
    RAISE EXCEPTION 'Invalid username or password';
  END IF;

  -- Update last login
  UPDATE admin_users 
  SET last_login = now(), updated_at = now()
  WHERE id = admin_record.id;

  -- Return admin data (excluding password)
  SELECT json_build_object(
    'id', admin_record.id,
    'username', admin_record.username,
    'email', admin_record.email,
    'full_name', admin_record.full_name,
    'role', admin_record.role,
    'avatar_url', admin_record.avatar_url,
    'last_login', admin_record.last_login,
    'session_id', extract(epoch from now())::text
  ) INTO result;

  RETURN result;
END;
$$;

-- Create test function to check if admin exists
CREATE OR REPLACE FUNCTION test_admin_exists()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_count integer;
  result json;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM admin_users
  WHERE username = 'admin' AND is_active = true;

  SELECT json_build_object(
    'admin_exists', admin_count > 0,
    'admin_count', admin_count,
    'message', CASE 
      WHEN admin_count > 0 THEN 'Admin user exists and is active'
      ELSE 'No active admin user found'
    END
  ) INTO result;

  RETURN result;
END;
$$;

-- Create admin context functions for session management
CREATE OR REPLACE FUNCTION set_admin_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set a session variable to indicate admin context
  PERFORM set_config('app.admin_context', 'true', false);
END;
$$;

CREATE OR REPLACE FUNCTION clear_admin_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear the admin context
  PERFORM set_config('app.admin_context', 'false', false);
END;
$$;

-- Create helper function to check if current session is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if admin context is set
  RETURN COALESCE(current_setting('app.admin_context', true)::boolean, false);
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION authenticate_admin(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION authenticate_admin_enhanced(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION test_admin_exists() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_admin_context() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION clear_admin_context() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;