import { User, Lead, Remark, Followup } from './types';
import { MOCK_CITIES } from './constants';

// Helper to generate random dates within last 30 days
const getRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Helper to generate random time today (between 9 AM and 6 PM)
const getTimeToday = (baseHour?: number) => {
  const date = new Date();
  const hour = baseHour !== undefined ? baseHour : 9 + Math.floor(Math.random() * 9); // Random hour 9-18
  date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return date.toISOString();
};
export const MOCK_USERS: User[] = [
  { id: 'u0', name: 'Vikram Kumar', email: 'vikram@tms.com', role: 'superadmin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', status: 'active', lastActive: new Date().toISOString() },
  { id: 'u1', name: 'Rajesh Kumar', email: 'rajesh@tms.com', role: 'superadmin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh', status: 'active', lastActive: getRandomDate(1) },
  { id: 'u2', name: 'Priya Sundar', email: 'priya@tms.com', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', status: 'active', monthlyTarget: 50, lastActive: new Date().toISOString() },
  { id: 'u3', name: 'Karthik Raja', email: 'karthik@tms.com', role: 'telecaller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik', status: 'active', reportsTo: 'u2', monthlyTarget: 15, lastActive: new Date().toISOString() },
  { id: 'u4', name: 'Anitha Krishnan', email: 'anitha@tms.com', role: 'telecaller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anitha', status: 'active', reportsTo: 'u2', monthlyTarget: 20, lastActive: getTimeToday(10) },
  { id: 'u5', name: 'Senthil Balaji', email: 'senthil@tms.com', role: 'telecaller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Senthil', status: 'active', reportsTo: 'u2', monthlyTarget: 12, lastActive: getRandomDate(2) },
];

const STATUSES = ['new', 'in-progress', 'follow-up', 'docs-pending', 'docs-submitted', 'application', 'sanctioned', 'rejected', 'disbursed', 'not-interested'] as const;
const SOURCES = ['Website', 'Referral', 'WhatsApp', 'Facebook Ad', 'Local Branch', 'Google Ads'];
const DISPOSITIONS = ['Connected', 'No Answer', 'Call Back', 'Wrong Number', 'Not Interested', 'Interested'];

const FIRST_NAMES = ['Suresh', 'Ramesh', 'Vijay', 'Ajith', 'Deepa', 'Lakshmi', 'Meena', 'Arun', 'Balaji', 'Divya', 'Ganesh', 'Hari', 'Indira', 'Jaya'];
const LAST_NAMES = ['Kumar', 'Reddy', 'Iyer', 'Menon', 'Rao', 'Nair', 'Pillai', 'Chettiar', 'Krishnan', 'Subramaniam', 'Raj', 'Chandran'];

const generateMockLeads = (count: number): Lead[] => {
  const leads: Lead[] = [];

  for (let i = 0; i < count; i++) {
    const isToday = Math.random() > 0.7; // 30% chance of activity today
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const assignedTo = Math.random() > 0.1 ? MOCK_USERS[Math.floor(Math.random() * 3) + 2].id : null; // Mostly assigned to telecallers

    // Generate Name
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

    // Generate Indian Mobile
    const mobile = `+91 ${Math.floor(Math.random() * 4 + 6)}${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;

    // Generate Timestamps based on status (Mock Logic)
    const createdAt = getRandomDate(Math.floor(Math.random() * 30));
    let docSubmissionDate, pdDate, sanctionDate, disbursalDate;

    if (['docs-submitted', 'application', 'sanctioned', 'disbursed'].includes(status)) {
      docSubmissionDate = getRandomDate(Math.floor(Math.random() * 10)); // 0-10 days ago
    }
    if (['application', 'sanctioned', 'disbursed'].includes(status)) {
      pdDate = getRandomDate(Math.floor(Math.random() * 5)); // 0-5 days ago
    }
    if (['sanctioned', 'disbursed'].includes(status)) {
      sanctionDate = getRandomDate(Math.floor(Math.random() * 3)); // 0-3 days ago
    }
    if (status === 'disbursed') {
      disbursalDate = getRandomDate(0); // Today/Yesterday
    }


    // Generate Remarks
    const remarks: Remark[] = [];
    const numRemarks = Math.floor(Math.random() * 5); // 0-4 remarks
    for (let j = 0; j < numRemarks; j++) {
      const isRemarkToday = isToday && j === (numRemarks - 1); // Latest remark is today
      // Distribute calls roughly every 2 hours if multiple today, else random past date
      remarks.push({
        id: `r-${i}-${j}`,
        timestamp: isRemarkToday ? getTimeToday() : getRandomDate(Math.floor(Math.random() * 10) + 1),
        userId: assignedTo || 'u3',
        userName: MOCK_USERS.find(u => u.id === assignedTo)?.name || 'Unknown',
        comment: 'Customer asked for callback regarding interest rate.',
        disposition: DISPOSITIONS[Math.floor(Math.random() * DISPOSITIONS.length)],
        duration: Math.floor(Math.random() * 300) + 30
      });
    }

    // Generate Followups
    const followups: Followup[] = [];
    if (status === 'follow-up' || Math.random() > 0.8) {
      followups.push({
        id: `f-${i}`,
        date: isToday ? new Date().toISOString().split('T')[0] : getRandomDate(-2).split('T')[0],
        time: '14:00',
        reason: 'Collect Income Documents',
        status: 'pending'
      });
    }

    leads.push({
      id: `TN-L${(i + 1).toString().padStart(4, '0')}`,
      name: `${firstName} ${lastName}`,
      mobile: mobile,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      city: MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)],
      status: status,
      assignedTo: assignedTo,
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
      createdAt: createdAt,
      pincode: `600${Math.floor(Math.random() * 900 + 100)}`, // Chennai Pincodes approx
      remarks,
      followups,
      documents: status === 'new' ? [] : [
        { id: `d-${i}-1`, type: 'aadhar', name: 'Aadhar Card', status: ['verified', 'uploaded'][Math.floor(Math.random() * 2)] as any },
        { id: `d-${i}-2`, type: 'pan', name: 'PAN Card', status: 'pending' },
        { id: `d-${i}-3`, type: 'bank', name: 'Bank Statement (6 Months)', status: 'pending' }
      ],
      loanDetails: {
        appId: `LN-TN-${1000 + i}`,
        amount: Math.floor(Math.random() * 45) * 10000 + 50000, // 50k to 5L
        pdStatus: ['pending', 'completed'][Math.floor(Math.random() * 2)] as any,
        sanctionStatus: status === 'sanctioned' || status === 'disbursed' ? 'sanctioned' : 'pending',
        disbursalStatus: status === 'disbursed' ? 'completed' : 'pending',
        sanctionAmount: Math.floor(Math.random() * 45) * 10000 + 50000,
        loanType: ['Personal Loan', 'Home Loan', 'Business Loan'][Math.floor(Math.random() * 3)] as any,
        docSubmissionDate,
        pdDate,
        sanctionDate,
        disbursalDate
      }
    });
  }
  return leads;
};

export const MOCK_LEADS = generateMockLeads(80);