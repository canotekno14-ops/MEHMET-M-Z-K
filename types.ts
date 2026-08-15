export type Language = 'tr' | 'en' | 'ar' | 'fa' | 'ru' | 'ja' | 'de';

export type MainSection = 'theory' | 'violin' | 'piano' | 'conservatory' | 'games' | 'ai_tutor';

export type TheorySubSection = 'acoustics' | 'notation' | 'solfege';
export type SubSectionTheory = 'acoustics' | 'notation' | 'ear_training' | 'scales_modes' | 'harmony';
export type SubSectionViolin = 'fingerboard' | 'bowing' | 'left_hand' | 'anatomy_history';
export type SubSectionPiano = 'keyboard' | 'chords_scales' | 'technique_hanon' | 'anatomy_pedals';

export type ViolinString = 'G' | 'D' | 'A' | 'E';
export type ClefType = 'treble' | 'bass' | 'alto' | 'tenor';

export type NoteDurationType = 
  | 'breve' 
  | 'semibreve' 
  | 'minim' 
  | 'crotchet' 
  | 'quaver' 
  | 'semiquaver' 
  | 'demisemiquaver' 
  | 'hemidemisemiquaver';

export interface NoteValueInfo {
  id: NoteDurationType;
  name: Record<Language, string>;
  beats: number;
  fraction: string;
  restName: Record<Language, string>;
  description: Record<Language, string>;
}

export interface IntervalInfo {
  id: string;
  semitones: number;
  name: Record<Language, string>;
  shortName: string;
  ratio: string;
  cents: number;
  description: Record<Language, string>;
}

export interface ScaleDefinition {
  id: string;
  name: Record<Language, string>;
  type: 'major' | 'minor' | 'mode' | 'pentatonic' | 'blues' | 'makam';
  intervals: number[]; // semitones from root
  microtonalOffsets?: number[]; // cents offsets for makam / just intonation
  description: Record<Language, string>;
}

export interface ChordDefinition {
  id: string;
  name: string;
  symbol?: string;
  fullName?: Record<Language, string>;
  intervals: number[];
  formula: string;
  category: 'triad' | 'seventh' | 'extended' | 'altered';
  description?: string;
}

export interface ViolinPositionNote {
  string: 'G' | 'D' | 'A' | 'E';
  finger: 0 | 1 | 2 | 3 | 4;
  position: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  note: string; // e.g. "A4"
  frequency: number;
  solfege: string;
  german: string;
  isHarmonic?: boolean;
}

export interface BowingTechnique {
  id: string;
  name: string;
  origin: string;
  category: 'on-string' | 'off-string' | 'special-effects';
  description: Record<Language, string>;
  mechanics: {
    contactPoint: string;
    speed: string;
    pressure: string;
    bowRegion: string;
  };
  repertoireExample: string;
}

export interface PianoKeyData {
  note: string; // e.g. "C4"
  midi: number;
  freq: number;
  isBlack: boolean;
  octave: number;
  solfege: string;
  german: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | Date;
  category?: string;
  uiBlueprint?: string;
}

export interface FlashcardQuestion {
  clef: ClefType;
  noteName: string; // "C4"
  linePosition: number; // 0 is bottom line E4 on treble
  accidental?: 'sharp' | 'flat' | 'natural';
  options: string[];
  correctAnswer: string;
}
