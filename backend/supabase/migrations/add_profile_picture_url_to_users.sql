-- Add profile_picture_url column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add comment to the new column
COMMENT ON COLUMN public.users.profile_picture_url IS 'URL or base64 string for user profile picture';
