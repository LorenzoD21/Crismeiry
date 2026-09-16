export interface BibleVerseItem {
  reference: string;
  text: string;
  reflection: string;
}

export interface PhotoItem {
  id: number;
  title: string;
  subtitle: string;
  era: 'infancia' | 'creciendo' | 'quinceanera' | 'dulces16';
  ageBadge: string;
  quote: string;
  storyText: string;
  defaultSrc: string;
  customSrc?: string;
  accentColor: string;
  bibleVerse: BibleVerseItem;
}

export type ViewMode = 'story' | 'gallery' | 'letter';

export type VisualEffect = 'cinematic' | 'vhs' | 'film' | 'minimal' | 'sparkles';

export interface SoundTrack {
  id: string;
  name: string;
  artist: string;
  mood: string;
  bpm: number;
}
