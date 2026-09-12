export interface EventItem {
  id: string;
  title: string;
  category: 'Tech' | 'Social' | 'Music' | 'Art' | 'Fitness';
  date: string;
  location: string;
  attendees: number;
  capacity: number;
  image: string;
  badge?: string;
  rsvpd?: boolean;
  angle: number;
  radius: number;
  size: 'sm' | 'md' | 'lg';
}

export type ModalType = 'none' | 'login' | 'create' | 'event-details';
