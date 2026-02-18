import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenApi, attendanceApi } from '../lib/api';
import { useStore } from '../store/useStore';
import { KanbanBoard } from '../components/KanbanBoard';
import { socketService } from '../lib/socket';

export const DashboardPage: React.FC = () => {
  const { user, showToast } = useStore();
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
    onSuccess: (_, childId) => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      showToast('Child checked in successfully', 'success');

      // Emit socket event
      const child = children.find((c: any) => c.id === childId);
      if (child?.classroom_id) {
        socketService.emitAttendanceUpdate(child.classroom_id, childId, 'PRESENT');
      }
    },
    onError: () => {
      showToast('Failed to check in child', 'error');
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (childId: string) => attendanceApi.checkOut(childId),
    onSuccess: (_, childId) => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      showToast('Child checked out successfully', 'success');

      // Emit socket event
      const child = children.find((c: any) => c.id === childId);
      if (child?.classroom_id) {
        socketService.emitAttendanceUpdate(child.classroom_id, childId, 'CHECKED_OUT');
      }
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
    <div className="p-3 sm:p-6">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-800 mb-1 sm:mb-2">Daily Operations</h1>
        <p className="text-sm sm:text-base text-slate-600">
          Manage check-ins, check-outs, and daily activities
        </p>
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-soft flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <span className="font-bold text-sm sm:text-base text-slate-700">Filter by Classroom:</span>
          <select
            value={selectedClassroom}
            onChange={(e) => setSelectedClassroom(e.target.value)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200 font-bold text-sm sm:text-base text-slate-800"
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
