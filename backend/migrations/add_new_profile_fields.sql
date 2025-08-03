-- Migration: Add new profile fields
-- Date: 2025-01-03
-- Description: Add educationDegreeOther, professionOther, and citizenship columns

-- Add educationDegreeOther column
ALTER TABLE "profiles" 
ADD COLUMN "educationDegreeOther" TEXT;

-- Add professionOther column  
ALTER TABLE "profiles"
ADD COLUMN "professionOther" TEXT;

-- Add citizenship column (required field)
ALTER TABLE "profiles"
ADD COLUMN "citizenship" TEXT NOT NULL DEFAULT '';

-- Update the default constraint after adding the column
ALTER TABLE "profiles" 
ALTER COLUMN "citizenship" DROP DEFAULT;