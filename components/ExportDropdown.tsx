import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';

interface ExportDropdownProps {
    onExport: (format: 'csv' | 'excel' | 'pdf') => void;
    className?: string;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ onExport, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (format: 'csv' | 'excel' | 'pdf') => {
        onExport(format);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-secondary gap-2"
            >
                <Download size={16} />
                <span>Export</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Select Format
                    </div>
                    <button
                        onClick={() => handleSelect('csv')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FileText size={16} className="text-green-600" />
                        <span>CSV File</span>
                    </button>
                    <button
                        onClick={() => handleSelect('excel')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FileSpreadsheet size={16} className="text-green-700" />
                        <span>Excel Spreadsheet</span>
                    </button>
                    <div className="my-1 border-t border-gray-100"></div>
                    <button
                        onClick={() => handleSelect('pdf')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FileText size={16} className="text-red-500" />
                        <span>PDF Document</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;
