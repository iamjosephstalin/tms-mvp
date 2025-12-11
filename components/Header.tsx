import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Header = () => {
    const { pathname } = useLocation();
    const { currentUser } = useApp();

    // Generate Breadcrumbs
    const pathSegments = pathname.split('/').filter(Boolean);

    return (
        <header className="h-14 sticky top-0 z-30 w-full glass flex items-center justify-between px-6 transition-all duration-300">

            {/* Left: Breadcrumbs */}
            <div className="flex items-center text-sm font-medium text-muted-foreground">
                <span className="text-foreground">TMS</span>
                {pathSegments.map((segment, index) => (
                    <React.Fragment key={segment}>
                        <span className="mx-2 text-zinc-300">/</span>
                        <span className="capitalize text-foreground/80 hover:text-foreground transition-colors cursor-default">
                            {segment.replace('-', ' ')}
                        </span>
                    </React.Fragment>
                ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="hidden md:flex items-center relative group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-8 w-64 rounded-md bg-zinc-100 border-none pl-9 pr-4 text-xs font-medium focus:bg-white focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>

                <div className="h-6 w-px bg-zinc-200 mx-2"></div>

                {/* Notifications */}
                <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-semibold text-foreground leading-none mb-1">{currentUser?.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{currentUser?.role}</p>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                        <img src={currentUser?.avatar} alt="" className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
