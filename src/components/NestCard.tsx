import React from 'react';
import { Child } from '../types';

interface NestCardProps {
  child: Child;
  onClick?: () => void;
  selected?: boolean;
}

/**
 * NestCard
 * 
 * The signature visual motif of NestFlow.
 * Features an asymmetrical "Nest" shape holding the avatar.
 * Uses springy hover effects.
 */
export const NestCard: React.FC<NestCardProps> = ({ child, onClick, selected }) => {
  const getStatusConfig = (child: Child) => {
    // Priority 1: Enrollment Status (if not active)
    if (child.enrollmentStatus === 'PENDING') {
      return { label: 'Pending Approval', classes: 'bg-purple-100 text-purple-700' };
    }
    if (child.enrollmentStatus === 'WAITLIST') {
      return { label: 'On Waitlist', classes: 'bg-yellow-100 text-yellow-700' };
    }

    // Priority 2: Daily Attendance Status (only for enrolled children)
    switch (child.status) {
      case 'PRESENT':
        return { label: 'Here', classes: 'bg-green-100 text-green-700' };
      case 'CHECKED_OUT':
        return { label: 'Gone Home', classes: 'bg-orange-100 text-orange-600' };
      default:
        return { label: 'Absent', classes: 'bg-gray-100 text-gray-500' };
    }
  };

  const statusConfig = getStatusConfig(child);

  return (
    <div 
      onClick={onClick}
      className={`
        relative group cursor-pointer 
        transition-all duration-300 ease-out 
        hover:-translate-y-1 hover:shadow-lg
        ${selected ? 'ring-4 ring-primary-300 ring-opacity-50' : ''}
      `}
    >
      {/* Main Card Body */}
      <div className="bg-white rounded-nest overflow-hidden shadow-sm border border-gray-100 h-28 flex">
        
        {/* The "Nest" Blob Container - Asymmetrical Left Side */}
        <div className="w-24 h-full relative overflow-hidden bg-primary-100">
          {/* Decorative Blob Shape Background */}
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary-300 rounded-full opacity-20 transform rotate-12"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
             <img 
               src={child.avatarUrl} 
               alt={child.firstName}
               className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
             />
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-3 flex flex-col justify-center">
          <div className="flex justify-between items-start">
            <h3 className="font-display font-bold text-gray-800 text-lg">
              {child.firstName}
            </h3>
            <span className={`
              text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider
              ${statusConfig.classes}
            `}>
              {statusConfig.label}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mb-2">{child.lastName}</p>
          
          {child.enrollmentStatus === 'ENROLLED' && child.lastActivityTime && (
            <div className="flex items-center text-xs text-gray-400">
              <span className={`w-2 h-2 rounded-full mr-2 ${child.status === 'PRESENT' ? 'bg-accent-300 animate-pulse' : 'bg-gray-300'}`}></span>
              {child.lastActivityTime}
            </div>
          )}

          {child.enrollmentStatus !== 'ENROLLED' && (
            <div className="flex items-center text-xs text-gray-400">
              <span className="mr-1">🎂</span>
              {child.dob ? new Date(child.dob).getFullYear() : 'N/A'} (Age {child.dob ? new Date().getFullYear() - new Date(child.dob).getFullYear() : '?'})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};