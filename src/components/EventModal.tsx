import React from 'react';
import { X, Calendar, MapPin, Users, Check } from 'lucide-react';
import { EventItem } from '../types';

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
  onToggleRsvp: (eventId: string) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onClose,
  onToggleRsvp,
}) => {
  if (!event) return null;

  const percentage = Math.round((event.attendees / event.capacity) * 100);

  return (
    <div
      id="event-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        id="event-modal-content"
        className="relative w-full max-w-md bg-neutral-950 text-white rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-event-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-neutral-800 text-neutral-300 hover:text-white backdrop-blur-md transition-colors"
        >
          <X size={18} />
        </button>

        <div className="relative h-56 w-full">
          <img
            src={event.image}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30" />
          <div className="absolute bottom-4 left-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">{event.title}</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800/80">
              <Calendar className="text-neutral-400 shrink-0" size={18} />
              <div className="min-w-0">
                <span className="text-xs text-neutral-400 block font-medium">Date</span>
                <span className="text-sm font-semibold truncate block">{event.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800/80">
              <MapPin className="text-neutral-400 shrink-0" size={18} />
              <div className="min-w-0">
                <span className="text-xs text-neutral-400 block font-medium">Location</span>
                <span className="text-sm font-semibold truncate block">{event.location}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Users size={14} />
                Attendees
              </span>
              <span>
                {event.attendees} / {event.capacity}
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="rsvp-button"
              onClick={() => onToggleRsvp(event.id)}
              className={`w-full py-3.5 px-6 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                event.rsvpd
                  ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700'
                  : 'bg-white text-neutral-950 hover:bg-neutral-200'
              }`}
            >
              {event.rsvpd ? (
                <>
                  <Check size={16} />
                  Registered
                </>
              ) : (
                'RSVP'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
