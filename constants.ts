import { LeadStatus } from "./types";
import { 
  Circle, Clock, FileText, CheckCircle, XCircle, 
  Banknote, AlertCircle, Phone, PhoneOff, HelpCircle 
} from 'lucide-react';

// Modern badge style: bg-color-50 text-color-700 ring-1 ring-inset ring-color-700/10
export const STATUS_COLORS: Record<LeadStatus, string> = {
  'new': 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20',
  'in-progress': 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
  'follow-up': 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20',
  'docs-pending': 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10',
  'docs-submitted': 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10',
  'application': 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
  'sanctioned': 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  'rejected': 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
  'disbursed': 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  'not-interested': 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  'new': 'New Lead',
  'in-progress': 'In Progress',
  'follow-up': 'Follow Up',
  'docs-pending': 'Docs Pending',
  'docs-submitted': 'Docs Submitted',
  'application': 'Loan App',
  'sanctioned': 'Sanctioned',
  'rejected': 'Rejected',
  'disbursed': 'Disbursed',
  'not-interested': 'Not Interested',
};

export const DISPOSITIONS = [
  'Connected', 'No Answer', 'Call Back', 'Wrong Number', 'Not Interested', 'Interested'
];

export const MOCK_CITIES = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 
  'Tirunelveli', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 
  'Thanjavur', 'Kanchipuram'
];