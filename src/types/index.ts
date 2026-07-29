export type UserRole = 'DEV_UTAMA' | 'BPBD' | 'ADMIN' | 'CITIZEN' | 'VOLUNTEER' | 'MEDIA' | 'GUEST';

export type ReportStatus =
  | 'UNVERIFIED'
  | 'VERIFIED_CROWD'
  | 'NEEDS_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'ARCHIVED';

export type AIRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export interface EmergencyReport {
  id: string;
  title: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  status: ReportStatus;
  riskLevel?: AIRiskLevel;
  validVotes: number;
  invalidVotes: number;
  createdAt: string;
  updatedAt: string;
}