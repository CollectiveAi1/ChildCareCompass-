import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenApi, attendanceApi } from '../lib/api';
import { useStore } from '../store/useStore';
import { KanbanBoard } from '../components/KanbanBoard';

export const DashboardPage: React.FC = () => {
  const { showToast } = useStore();
  const queryClient = useQueryClient();
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');

  // Fetch children
  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children', selectedClassroom],
    queryFn: async () => {
      const response = await childrenApi.getAll(selectedClassroom);
      return response.data;
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: (childId: string) => attendanceApi.checkIn(childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      showToast('Child checked in successfully', 'success');
    },
    onError: () => {
      showToast('Failed to check in child', 'error');
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (childId: string) => attendanceApi.checkOut(childId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      showToast('Child checked out successfully', 'success');
    },
    onError: () => {
      showToast('Failed to check out child', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 mb-2">Daily Operations</h1>
        <p className="text-slate-600">
          Manage check-ins, check-outs, and daily activities
        </p>
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-soft flex items-center gap-4">
          <span className="font-bold text-slate-700">Filter by Classroom:</span>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
          >
            <option value="">All Classrooms</option>
            <option value="toddlers">Toddlers 1A</option>
            <option value="infants">Infants</option>
          </select>
        </div>
      </div>

      <KanbanBoard
        children={children}
        onCheckIn={(id) => checkInMutation.mutate(id)}
        onCheckOut={(id) => checkOutMutation.mutate(id)}
      />
    </div>
  );
};
