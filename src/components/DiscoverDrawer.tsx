import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { EventItem } from '../types';

interface DiscoverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onToggleRsvp: (eventId: string) => void;
}

export const DiscoverDrawer: React.FC<DiscoverDrawerProps> = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
  onToggleRsvp,
}) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['All', 'Tech', 'Social', 'Music', 'Art', 'Fitness'];

  const filteredEvents = events.filter((ev) => {
    const matchCat = filter === 'All' || ev.category === filter;
    const matchSearch = !search || ev.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div
      id="discover-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end"
      onClick={onClose}
    >
      <div
        id="discover-drawer"
        className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">Events</h2>
          <button
            id="close-discover-drawer"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 border-b border-neutral-100">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                id={`discover-card-${ev.id}`}
                onClick={() => onSelectEvent(ev)}
                className="group cursor-pointer rounded-2xl border border-neutral-200 overflow-hidden bg-white hover:shadow-lg transition-all"
              >
                <div className="relative h-36 w-full">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-md">
                      {ev.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900">{ev.title}</h3>
                    <span className="text-xs text-neutral-500">{ev.date}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleRsvp(ev.id);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      ev.rsvpd
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                    }`}
                  >
                    {ev.rsvpd ? 'Joined' : 'RSVP'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
