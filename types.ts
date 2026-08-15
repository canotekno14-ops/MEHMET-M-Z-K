export type Language = 'tr' | 'en' | 'de' | 'ar' | 'fa' | 'ru' | 'ja';

export type MainSection = 'theory' | 'violin' | 'piano' | 'conservatory' | 'games' | 'ai_tutor';

export type TheorySubSection = 'acoustics' | 'notation' | 'solfege';

export interface TranslationSchema {
  navTheory: string;
  navViolin: string;
  navPiano: string;
  navConservatory: string;
  navGames: string;
  navAITutor: string;
  tabAcoustics: string;
  tabNotation: string;
  tabScalesModes: string;
  [key: string]: string;
}
