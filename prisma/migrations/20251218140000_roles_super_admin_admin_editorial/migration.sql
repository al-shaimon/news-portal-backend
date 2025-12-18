-- Move from (super_admin, admin, journalist, reader) -> (super_admin, admin, editorial)
-- Security note: any existing 'reader' accounts are deactivated to avoid privilege escalation.

UPDATE "User" SET "isActive" = false WHERE "role" = 'reader';

CREATE TYPE "UserRole_new" AS ENUM ('super_admin', 'admin', 'editorial');

-- Drop the existing default (e.g. 'reader') before changing enum type; otherwise Postgres
-- fails because it can't implicitly cast the column default to the new enum.
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole_new"
USING (
  CASE
    WHEN "role"::text = 'journalist' THEN 'editorial'
    WHEN "role"::text = 'reader' THEN 'editorial'
    ELSE "role"::text
  END
)::"UserRole_new";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'editorial';

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
