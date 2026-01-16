import React from 'react';
import { motion } from 'framer-motion';
import { Child } from '../types';

interface KanbanBoardProps {
  children: Child[];
  onCheckIn: (childId: string) => void;
  onCheckOut: (childId: string) => void;
}

const KanbanColumn: React.FC<{
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}> = ({ title, count, color, children }) => (
  <div className="bg-white rounded-[32px] p-6 shadow-soft min-h-[500px] flex flex-col">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-black text-slate-800">{title}</h3>
      <span className={`${color} text-white px-4 py-2 rounded-full text-sm font-bold`}>
        {count}
      </span>
    </div>
    <div className="space-y-3 flex-1">{children}</div>
  </div>
);

const ChildCard: React.FC<{
  child: Child;
  onAction: () => void;
  actionLabel: string;
  actionColor: string;
}> = ({ child, onAction, actionLabel, actionColor }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="bg-slate-50 rounded-2xl p-4 hover:shadow-md transition-all cursor-move"
  >
    <div className="flex items-center gap-3 mb-3">
      <img
        src={child.avatarUrl}
        alt={`${child.firstName} ${child.lastName}`}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <h4 className="font-bold text-slate-800">
          {child.firstName} {child.lastName}
        </h4>
        {child.lastActivityTime && (
          <p className="text-xs text-slate-500">{child.lastActivityTime}</p>
        )}
      </div>
    </div>
    {child.allergies && child.allergies.length > 0 && (
      <div className="mb-3">
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
          ⚠️ {child.allergies.join(', ')}
        </span>
      </div>
    )}
    <button
      onClick={onAction}
      className={`w-full ${actionColor} text-white py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all`}
    >
      {actionLabel}
    </button>
  </motion.div>
);

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  children,
  onCheckIn,
  onCheckOut,
}) => {
  const absent = children.filter((c) => c.status === 'ABSENT');
  const present = children.filter((c) => c.status === 'PRESENT');
  const checkedOut = children.filter((c) => c.status === 'CHECKED_OUT');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KanbanColumn title="Expected" count={absent.length} color="bg-slate-400">
        {absent.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onAction={() => onCheckIn(child.id)}
            actionLabel="Check In"
            actionColor="bg-brand-teal"
          />
        ))}
      </KanbanColumn>

      <KanbanColumn title="Present" count={present.length} color="bg-green-500">
        {present.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onAction={() => onCheckOut(child.id)}
            actionLabel="Check Out"
            actionColor="bg-brand-pink"
          />
        ))}
      </KanbanColumn>

      <KanbanColumn title="Went Home" count={checkedOut.length} color="bg-blue-400">
        {checkedOut.map((child) => (
          <ChildCard
            key={child.id}
            child={child}
            onAction={() => {}}
            actionLabel="Checked Out"
            actionColor="bg-slate-400"
          />
        ))}
      </KanbanColumn>
    </div>
  );
};
