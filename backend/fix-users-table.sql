-- Remove password field and unused auth fields from users table
-- since we're using Supabase Auth

ALTER TABLE "users" DROP COLUMN IF EXISTS "password";
ALTER TABLE "users" DROP COLUMN IF EXISTS "emailVerificationToken";
ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordResetToken";
ALTER TABLE "users" DROP COLUMN IF EXISTS "passwordResetExpires";

-- Make sure we can insert users without these fields
-- The users table will now only store profile information