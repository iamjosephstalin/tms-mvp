import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Matte Black */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-background">

        {/* Header - Glassmorphism */}
        <Header />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto scrollbar-thin">
          <main className="min-h-full">
            {children}
          </main>
        </div>

        {/* Mobile Menu Trigger (Floating if needed, or part of a mobile header) */}
        {/* For this design, we usually rely on the Header to show the menu button on mobile. 
            I'll add the button to the header in a future iteration if needed, or overlay it here for now. */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-50 p-3 bg-zinc-900 text-white rounded-full shadow-lg"
        >
          <Menu size={24} />
        </button>
      </div>
    </div>
  );
};

export default Layout;