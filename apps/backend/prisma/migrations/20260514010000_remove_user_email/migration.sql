-- Username is now the only login identifier.
DROP INDEX IF EXISTS "User_email_key";

ALTER TABLE "User" DROP COLUMN IF EXISTS "email";
