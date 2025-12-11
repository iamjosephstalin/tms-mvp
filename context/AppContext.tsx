import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Lead, Remark, Followup, DocumentItem, LoanDetail, LeadStatus } from '../types';
import { MOCK_USERS, MOCK_LEADS } from '../mockData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  leads: Lead[];
  login: (email: string) => void;
  logout: () => void;
  updateLeadStatus: (leadId: string, status: LeadStatus) => void;
  addRemark: (leadId: string, remark: Omit<Remark, 'id' | 'timestamp' | 'userName' | 'userId'>) => void;
  addFollowup: (leadId: string, followup: Omit<Followup, 'id' | 'status'>) => void;
  updateDocumentStatus: (leadId: string, docId: string, status: DocumentItem['status']) => void;
  assignLead: (leadId: string, userId: string) => void;
  updateLoanDetails: (leadId: string, details: Partial<LoanDetail>) => void;
  createLoanApplication: (leadId: string, amount: number) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  // ... (login/logout)

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  const login = (email: string) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
    } else {
      alert("User not found (Try: admin@tms.com or sarah@tms.com)");
    }
  };

  const logout = () => setCurrentUser(null);

  const updateLeadStatus = (leadId: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const addRemark = (leadId: string, remarkData: Omit<Remark, 'id' | 'timestamp' | 'userName' | 'userId'>) => {
    if (!currentUser) return;
    const newRemark: Remark = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      ...remarkData
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return { ...l, remarks: [newRemark, ...l.remarks] };
      }
      return l;
    }));
  };

  const addFollowup = (leadId: string, followupData: Omit<Followup, 'id' | 'status'>) => {
    const newFollowup: Followup = {
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      ...followupData
    };
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          followups: [...l.followups, newFollowup],
          status: 'follow-up'
        };
      }
      return l;
    }));
  };

  const updateDocumentStatus = (leadId: string, docId: string, status: DocumentItem['status']) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const newDocs = l.documents.map(d => d.id === docId ? { ...d, status, uploadDate: status === 'uploaded' ? new Date().toISOString() : d.uploadDate } : d);
        // Auto status update logic mock
        const allUploaded = newDocs.every(d => d.status === 'uploaded' || d.status === 'verified');
        let newLeadStatus = l.status;
        if (allUploaded && l.status === 'docs-pending') newLeadStatus = 'docs-submitted';

        return { ...l, documents: newDocs, status: newLeadStatus };
      }
      return l;
    }));
  };

  const assignLead = (leadId: string, userId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedTo: userId } : l));
  };

  const updateLoanDetails = (leadId: string, details: Partial<LoanDetail>) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId && l.loanDetails) {
        return { ...l, loanDetails: { ...l.loanDetails, ...details } };
      }
      return l;
    }));
  };

  const createLoanApplication = (leadId: string, amount: number) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: 'application',
          loanDetails: {
            appId: `APP${Math.floor(Math.random() * 10000)}`,
            amount: amount,
            pdStatus: 'pending',
            sanctionStatus: 'pending',
            disbursalStatus: 'pending'
          }
        };
      }
      return l;
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, leads, login, logout,
      updateLeadStatus, addRemark, addFollowup,
      updateDocumentStatus, assignLead, updateLoanDetails,
      createLoanApplication, addUser, updateUser, toggleUserStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};