import React from 'react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  onClick: (event: EventItem) => void;
  style?: React.CSSProperties;
  className?: string;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  style,
  className = '',
  compact = false,
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24 sm:w-28 sm:h-28',
    md: 'w-28 h-28 sm:w-36 sm:h-36',
    lg: 'w-32 h-32 sm:w-44 sm:h-44',
  }[event.size];

  return (
    <div
      id={`event-card-${event.id}`}
      style={style}
      onClick={() => onClick(event)}
      className={`group cursor-pointer select-none transition-all duration-300 hover:scale-108 hover:z-40 ${className}`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl shadow-xl shadow-black/25 ring-1 ring-white/20 transition-all duration-300 group-hover:ring-white/60 group-hover:shadow-2xl ${
          compact ? 'w-full aspect-square' : sizeClasses
        }`}
      >
        <img
          src={event.image}
          alt={event.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        {event.badge && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
              {event.badge}
            </span>
          </div>
        )}

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white">
          <span className="font-semibold text-xs sm:text-sm tracking-tight drop-shadow truncate">
            {event.title}
          </span>
          <span className="text-[10px] font-medium text-white/80 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-sm shrink-0">
            {event.date.split('·')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
