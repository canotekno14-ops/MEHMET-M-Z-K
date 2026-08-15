import React from 'react';
import { Language, MainSection } from './types';
import { TRANSLATIONS } from './translations';
import { BookOpen, Music2, Piano, GraduationCap, Gamepad2, Bot, Volume2 } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeSection: MainSection;
  onSectionChange: (section: MainSection) => void;
  onOpenQuickTools: (tab: 'metronome' | 'tuner') => void;
}

export default function Header({
  currentLanguage,
  onLanguageChange,
  activeSection,
  onSectionChange,
  onOpenQuickTools,
}: HeaderProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.tr;

  const languages: { code: Language; label: string }[] = [
    { code: 'tr', label: 'TR' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'ar', label: 'AR' },
    { code: 'fa', label: 'FA' },
    { code: 'ru', label: 'RU' },
    { code: 'ja', label: 'JA' },
  ];

  const navItems: { id: MainSection; label: string; icon: React.ReactNode }[] = [
    { id: 'theory', label: t.navTheory, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'violin', label: t.navViolin, icon: <Music2 className="w-4 h-4" /> },
    { id: 'piano', label: t.navPiano, icon: <Piano className="w-4 h-4" /> },
    { id: 'conservatory', label: t.navConservatory, icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'games', label: t.navGames, icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'ai_tutor', label: t.navAITutor, icon: <Bot className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500 text-xl font-bold font-serif shadow-inner">
            𝄞
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-100 tracking-tight flex items-center gap-2">
              MuseAcademy
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                PRO AI
              </span>
            </h1>
            <p className="text-[10px] text-stone-400 font-medium">Acoustics & Conservatory Masterclass</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-stone-900/80 p-1 rounded-2xl border border-stone-800/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeSection === item.id
                  ? 'bg-stone-800 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenQuickTools('metronome')}
            className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 transition"
            title="Metronome & Tuner"
          >
            <Volume2 className="w-4 h-4 text-amber-500" />
          </button>

          <div className="flex items-center bg-stone-900 rounded-xl border border-stone-800 p-0.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                  currentLanguage === lang.code
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
