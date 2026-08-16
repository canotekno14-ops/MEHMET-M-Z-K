import React from 'react';
import { Language, MainSection } from './types';
import { TRANSLATIONS } from './translations';
import { Music, Activity, Disc, Sparkles, BookOpen, Volume2, Timer } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeSection: MainSection;
  onSectionChange: (sec: MainSection) => void;
  onOpenQuickTools: (initialTab?: 'metronome' | 'tuner') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  activeSection,
  onSectionChange,
  onOpenQuickTools,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.tr;

  const sections: { id: MainSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'theory', label: '1. Müzik Teorisi & Solfej', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'violin', label: '2. Keman Masterclass', icon: <Activity className="w-4 h-4" />, badge: 'Strings' },
    { id: 'piano', label: '3. Piyano Masterclass', icon: <Disc className="w-4 h-4" />, badge: '88-Key' },
    { id: 'conservatory', label: '4. Konservatuvar Sınavları', icon: <Timer className="w-4 h-4 text-amber-400" />, badge: 'Ear Exam' },
    { id: 'games', label: 'İnteraktif Sahne & Deşifre', icon: <Music className="w-4 h-4" />, badge: 'Blueprints' },
    { id: 'ai_tutor', label: 'Maestro AI', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Bar: Multilingual Sovereignty & Global Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 text-xs">
        {/* Language Navigation Bar [TR | EN | AR | FA | RU | JA | DE] */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <span className="text-stone-400 font-medium mr-1 select-none">Language / Dil:</span>
          <div className="flex items-center bg-stone-950 p-1 rounded-lg border border-stone-800">
            {LANGUAGES.map((lang) => {
              const isActive = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-btn-${lang.code}`}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                  title={`${lang.label} (${lang.notationStyle})`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.code.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Tools Launchers */}
        <div className="flex items-center gap-2">
          <button
            id="quick-tool-metronome-btn"
            onClick={() => onOpenQuickTools('metronome')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition font-medium border border-stone-700 text-xs"
          >
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.btnMetronome}</span>
          </button>
          <button
            id="quick-tool-tuner-btn"
            onClick={() => onOpenQuickTools('tuner')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition font-medium border border-stone-700 text-xs"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.btnDroneTuner}</span>
          </button>
        </div>
      </div>

      {/* Main Header Brand & Primary Curriculum Modules */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-600/20">
              <span className="text-xl">𝄞</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-stone-50 font-serif">
                  MuseAcademy AI
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Masterclass
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md line-clamp-1">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {sections.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  id={`nav-section-${sec.id}`}
                  onClick={() => onSectionChange(sec.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {sec.icon}
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
