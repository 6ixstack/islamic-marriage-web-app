export type UserRole = 'ADMIN' | 'PARENT_RELATIVE' | 'CANDIDATE';

export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export type Gender = 'MALE' | 'FEMALE';

export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED';

export type Complexion = 'VERY_FAIR' | 'FAIR' | 'WHEATISH' | 'BROWN' | 'DARK';

export type ImmigrationStatus = 'CITIZEN' | 'PERMANENT_RESIDENT' | 'TEMPORARY_VISA' | 'STUDENT_VISA' | 'WORK_VISA' | 'OTHER';

export type ReligiousPracticeLevel = 'VERY_PRACTICING' | 'PRACTICING' | 'MODERATE' | 'BASIC';

export type EducationLevel = 'High School' | 'Associate Degree' | 'Bachelor\'s Degree' | 'Master\'s Degree' | 'PhD/Doctorate' | 'Professional Degree' | 'Trade/Technical Certificate' | 'Other';

export type ProfessionCategory = 'Engineer' | 'Doctor' | 'Teacher/Professor' | 'Business/Finance' | 'IT/Software' | 'Healthcare' | 'Government' | 'Student' | 'Self-Employed' | 'Homemaker' | 'Other';

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
  dateOfBirth: string;
  countryOfBirth: string;
  height: string;
  complexion: Complexion;
  
  // Education
  educationDegree: EducationLevel;
  educationDegreeOther?: string;
  educationSubject: string;
  educationYear: number;
  educationInstitute: string;
  
  // Profession
  profession: ProfessionCategory;
  professionOther?: string;
  company?: string;
  
  // Personal
  maritalStatus: MaritalStatus;
  
  // Parents Info
  fatherOccupation: string;
  fatherEducation?: string;
  motherOccupation: string;
  motherEducation?: string;
  parentsLocation: string;
  
  // Current Status & Citizenship
  currentResidence: string;
  citizenship: string;
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

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}