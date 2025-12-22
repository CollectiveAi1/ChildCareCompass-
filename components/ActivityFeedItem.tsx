import React from 'react';
import { Activity, ActivityType } from '../types';

interface ActivityFeedItemProps {
  activity: Activity;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({ activity }) => {
  
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.PHOTO: return '📸';
      case ActivityType.MEAL: return '🍎';
      case ActivityType.NAP: return '😴';
      case ActivityType.CHECK_IN: return '👋';
      case ActivityType.MEDICATION: return '💊';
      default: return '📝';
    }
  };

  return (
    <div className="flex gap-4 mb-6 relative">
      {/* Timeline Connector */}
      <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-200 -z-10" />

      {/* Icon Bubble */}
      <div className="w-10 h-10 rounded-full bg-white border-2 border-primary-100 flex items-center justify-center text-xl shadow-sm shrink-0 z-0">
        {getIcon(activity.type)}
      </div>

      {/* Card Content */}
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-display font-bold text-gray-800">{activity.title}</h4>
          <span className="text-xs text-gray-400">{activity.timestamp}</span>
        </div>
        
        {activity.description && (
          <p className="text-gray-600 text-sm mb-3 leading-relaxed">
            {activity.description}
          </p>
        )}

        {activity.mediaUrl && (
          <div className="rounded-xl overflow-hidden mt-2 mb-2">
            <img 
              src={activity.mediaUrl} 
              alt="Activity" 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400 font-medium">By {activity.authorName}</span>
          <button className="text-accent-300 hover:text-accent-400 text-sm font-semibold transition-colors">
            Like
          </button>
        </div>
      </div>
    </div>
  );
};