export type Role = 'superadmin' | 'admin' | 'telecaller';

export type LeadStatus =
  | 'new'
  | 'in-progress'
  | 'follow-up'
  | 'docs-pending'
  | 'docs-submitted'
  | 'application'
  | 'sanctioned'
  | 'rejected'
  | 'disbursed'
  | 'not-interested';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  status: 'active' | 'inactive';
  reportsTo?: string; // ID of the Team Lead (Admin)
  monthlyTarget?: number; // KRA: Target conversions per month
}

export interface Remark {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  comment: string;
  disposition: string;
  duration?: number; // duration in seconds if it was a call
}

export interface Followup {
  id: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'completed';
}

export interface DocumentItem {
  id: string;
  type: 'aadhar' | 'pan' | 'bank' | 'salary' | 'photo';
  name: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  uploadDate?: string;
}

export interface LoanDetail {
  appId: string;
  amount: number;
  pdStatus: 'pending' | 'completed';
  sanctionStatus: 'pending' | 'sanctioned' | 'rejected';
  sanctionAmount?: number;
  disbursalStatus: 'pending' | 'completed';

  // New Fields for Disbursal
  pif?: number;
  roi?: number;
  tenure?: number; // in months
  bankName?: string;
  bankCode?: string;
  // L1 Status Tracking (Mapped)
  // Ad generated -> application created
  // Pd completed -> pdStatus='completed'
  // Sanctioned -> sanctionStatus='sanctioned'
  // Disbursed -> disbursalStatus='completed'
}

export interface Lead {
  id: string;
  name: string;
  mobile: string;
  altMobile?: string;
  email: string;
  city: string;
  status: LeadStatus;
  assignedTo: string | null; // User ID
  remarks: Remark[];
  followups: Followup[];
  documents: DocumentItem[];
  loanDetails?: LoanDetail;
  source: string;
  createdAt: string;

  // Extended Fields
  salary?: number;
  address?: string;
  pincode?: string;
  requestedLoanAmount?: number;
}
