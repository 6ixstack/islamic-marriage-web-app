export type UserRole = 'ADMIN' | 'PARENT_RELATIVE' | 'CANDIDATE';

export type ProfileStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

export type Gender = 'MALE' | 'FEMALE';

export type MaritalStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED';

export type Complexion = 'VERY_FAIR' | 'FAIR' | 'WHEATISH' | 'BROWN' | 'DARK';

export type ImmigrationStatus = 'CITIZEN' | 'PERMANENT_RESIDENT' | 'TEMPORARY_VISA' | 'STUDENT_VISA' | 'WORK_VISA' | 'OTHER';

export type ReligiousPracticeLevel = 'VERY_PRACTICING' | 'PRACTICING' | 'MODERATE' | 'BASIC';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface ProfileFormData {
  name: string;
  gender: Gender;
  dateOfBirth: Date;
  countryOfBirth: string;
  height: string;
  complexion: Complexion;
  educationDegree: string;
  educationDegreeOther?: string;
  educationSubject: string;
  educationYear: number;
  educationInstitute: string;
  profession: string;
  professionOther?: string;
  company?: string;
  maritalStatus: MaritalStatus;
  fatherOccupation: string;
  fatherEducation?: string;
  motherOccupation: string;
  motherEducation?: string;
  parentsLocation: string;
  currentResidence: string;
  citizenship: string;
  immigrationStatus: ImmigrationStatus;
  immigrationDetails?: string;
  willingToRelocate: boolean;
  willingToLiveWithInLaws: boolean;
  religiousPractice: ReligiousPracticeLevel;
  praysFiveTimeDaily: boolean;
  attendsMosqueRegularly: boolean;
  halaalEarning: boolean;
  halaalFood: boolean;
  drinksAlcohol: boolean;
  smokes: boolean;
  hobbies?: string;
  hasPets: boolean;
  petDetails?: string;
  spouseAgeRangeMin: number;
  spouseAgeRangeMax: number;
  spouseEducation?: string;
  spouseCitizenship?: string;
  spouseMinHeight?: string;
  aboutYou: string;
  aboutSpouse: string;
  siblings?: Array<{
    gender: Gender;
    age: number;
    maritalStatus: MaritalStatus;
    profession?: string;
  }>;
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

export interface ProfileFilters {
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
  education?: string;
  country?: string;
  immigrationStatus?: ImmigrationStatus;
  religiousPractice?: ReligiousPracticeLevel;
  maritalStatus?: MaritalStatus;
}