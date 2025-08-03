export type UserRole = 'ADMIN' | 'PARENT_RELATIVE' | 'CANDIDATE';

export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export type Gender = 'MALE' | 'FEMALE';

export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED';

export type Complexion = 'VERY_FAIR' | 'FAIR' | 'WHEATISH' | 'BROWN' | 'DARK';

export type ImmigrationStatus = 'CITIZEN' | 'PERMANENT_RESIDENT' | 'TEMPORARY_VISA' | 'STUDENT_VISA' | 'WORK_VISA' | 'OTHER';

export type ReligiousPracticeLevel = 'VERY_PRACTICING' | 'PRACTICING' | 'MODERATE' | 'BASIC';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileFormData {
  // Basic Info
  name: string;
  gender: Gender;
  dateOfBirth: Date;
  countryOfBirth: string;
  height: string;
  complexion: Complexion;
  
  // Education
  educationDegree: string;
  educationSubject: string;
  educationYear: number;
  educationInstitute: string;
  
  // Profession
  profession: string;
  company?: string;
  
  // Personal
  maritalStatus: MaritalStatus;
  
  // Parents Info
  fatherOccupation: string;
  fatherEducation?: string;
  motherOccupation: string;
  motherEducation?: string;
  parentsLocation: string;
  
  // Current Status
  currentResidence: string;
  immigrationStatus: ImmigrationStatus;
  immigrationDetails?: string;
  
  // Preferences
  willingToRelocate: boolean;
  willingToLiveWithInLaws: boolean;
  
  // Religious Practice
  religiousPractice: ReligiousPracticeLevel;
  praysFiveTimeDaily: boolean;
  attendsMosqueRegularly: boolean;
  halaalEarning: boolean;
  halaalFood: boolean;
  
  // Lifestyle
  drinksAlcohol: boolean;
  smokes: boolean;
  hobbies?: string;
  
  // Pets
  hasPets: boolean;
  petDetails?: string;
  
  // Spouse Preferences
  spouseAgeRangeMin: number;
  spouseAgeRangeMax: number;
  spouseEducation?: string;
  spouseCitizenship?: string;
  spouseMinHeight?: string;
  
  // About sections
  aboutYou: string;
  aboutSpouse: string;
  
  // Siblings
  siblings?: Array<{
    gender: Gender;
    age: number;
    maritalStatus: MaritalStatus;
    profession?: string;
  }>;
  
  // Consent and terms
  hasParentConsent: boolean;
  agreedToTerms: boolean;
}

export interface Profile extends ProfileFormData {
  id: string;
  status: ProfileStatus;
  rejectionReason?: string;
  publishedAt?: Date;
  monthlyBatch?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedById: string;
}

export interface Interest {
  id: string;
  interestedUserId: string;
  targetProfileId: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAction {
  id: string;
  action: string;
  reason?: string;
  notes?: string;
  adminId: string;
  profileId: string;
  createdAt: Date;
}