import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EventItem } from '../types';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: Omit<EventItem, 'id' | 'angle' | 'radius' | 'size' | 'attendees'>) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Tech' | 'Social' | 'Music' | 'Art' | 'Fitness'>('Tech');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    onCreateEvent({
      title,
      category,
      date: date || 'Upcoming',
      location: location || 'TBA',
      capacity: parseInt(capacity, 10) || 100,
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
    });

    setTitle('');
    setDate('');
    setLocation('');
    setCapacity('');
    onClose();
  };

  return (
    <div
      id="create-event-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        id="create-event-modal"
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-create-modal"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-bold tracking-tight text-neutral-900 mb-6">
          Create Event
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="event-title"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
            >
              Title
            </label>
            <input
              id="event-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {(['Tech', 'Social', 'Music', 'Art', 'Fitness'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    category === cat
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="event-date"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
              >
                Date
              </label>
              <input
                id="event-date"
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="event-capacity"
                className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
              >
                Capacity
              </label>
              <input
                id="event-capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="event-location"
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5"
            >
              Location
            </label>
            <input
              id="event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white"
            />
          </div>

          <div className="pt-3">
            <button
              id="submit-create-event"
              type="submit"
              className="w-full py-3 px-6 rounded-xl font-semibold text-sm bg-neutral-950 text-white hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-900/10"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
