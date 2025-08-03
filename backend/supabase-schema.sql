-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PARENT_RELATIVE', 'CANDIDATE');
CREATE TYPE "ProfileStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED');
CREATE TYPE "Complexion" AS ENUM ('VERY_FAIR', 'FAIR', 'WHEATISH', 'BROWN', 'DARK');
CREATE TYPE "ImmigrationStatus" AS ENUM ('CITIZEN', 'PERMANENT_RESIDENT', 'TEMPORARY_VISA', 'STUDENT_VISA', 'WORK_VISA', 'OTHER');
CREATE TYPE "ReligiousPracticeLevel" AS ENUM ('VERY_PRACTICING', 'PRACTICING', 'MODERATE', 'BASIC');

-- Create users table
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" DEFAULT 'PARENT_RELATIVE' NOT NULL,
    "emailVerified" BOOLEAN DEFAULT false NOT NULL,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updatedAt" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create profiles table
CREATE TABLE "profiles" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMPTZ NOT NULL,
    "countryOfBirth" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "complexion" "Complexion" NOT NULL,
    "educationDegree" TEXT NOT NULL,
    "educationDegreeOther" TEXT,
    "educationSubject" TEXT NOT NULL,
    "educationYear" INTEGER NOT NULL,
    "educationInstitute" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "professionOther" TEXT,
    "company" TEXT,
    "maritalStatus" "MaritalStatus" NOT NULL,
    "fatherOccupation" TEXT NOT NULL,
    "fatherEducation" TEXT,
    "motherOccupation" TEXT NOT NULL,
    "motherEducation" TEXT,
    "parentsLocation" TEXT NOT NULL,
    "currentResidence" TEXT NOT NULL,
    "citizenship" TEXT NOT NULL,
    "immigrationStatus" "ImmigrationStatus" NOT NULL,
    "immigrationDetails" TEXT,
    "willingToRelocate" BOOLEAN NOT NULL,
    "willingToLiveWithInLaws" BOOLEAN NOT NULL,
    "religiousPractice" "ReligiousPracticeLevel" NOT NULL,
    "praysFiveTimeDaily" BOOLEAN NOT NULL,
    "attendsMosqueRegularly" BOOLEAN NOT NULL,
    "halaalEarning" BOOLEAN NOT NULL,
    "halaalFood" BOOLEAN NOT NULL,
    "drinksAlcohol" BOOLEAN NOT NULL,
    "smokes" BOOLEAN NOT NULL,
    "hobbies" TEXT,
    "hasPets" BOOLEAN NOT NULL,
    "petDetails" TEXT,
    "spouseAgeRangeMin" INTEGER NOT NULL,
    "spouseAgeRangeMax" INTEGER NOT NULL,
    "spouseEducation" TEXT,
    "spouseCitizenship" TEXT,
    "spouseMinHeight" TEXT,
    "aboutYou" TEXT NOT NULL,
    "aboutSpouse" TEXT NOT NULL,
    "siblings" JSONB,
    "status" "ProfileStatus" DEFAULT 'PENDING' NOT NULL,
    "rejectionReason" TEXT,
    "publishedAt" TIMESTAMPTZ,
    "monthlyBatch" TEXT,
    "hasParentConsent" BOOLEAN NOT NULL,
    "agreedToTerms" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updatedAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "submittedById" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create interests table
CREATE TABLE "interests" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "interestedUserId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "targetProfileId" TEXT NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
    "updatedAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE("interestedUserId", "targetProfileId")
);

-- Create admin_actions table
CREATE TABLE "admin_actions" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "adminId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "profileId" TEXT NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create email_logs table
CREATE TABLE "email_logs" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sent" BOOLEAN DEFAULT false NOT NULL,
    "sentAt" TIMESTAMPTZ,
    "error" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "profiles_status_idx" ON "profiles"("status");
CREATE INDEX "profiles_gender_idx" ON "profiles"("gender");
CREATE INDEX "profiles_submittedById_idx" ON "profiles"("submittedById");
CREATE INDEX "interests_interestedUserId_idx" ON "interests"("interestedUserId");
CREATE INDEX "interests_targetProfileId_idx" ON "interests"("targetProfileId");

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON "profiles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interests_updated_at BEFORE UPDATE ON "interests" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();