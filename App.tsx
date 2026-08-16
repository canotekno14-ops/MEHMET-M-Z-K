import React, { useState } from 'react';
import { Language, MainSection, TheorySubSection } from './types';
import { Header } from './Header';
import { QuickToolsModal } from './QuickToolsModal';
import { AcousticsLab } from './AcousticsLab';
import { NotationMaster } from './NotationMaster';
import { SolfegeSightReading } from './SolfegeSightReading';
import { ViolinMasterclass } from './ViolinMasterclass';
import { PianoMasterclass } from './PianoMasterclass';
import { ConservatoryExamPrep } from './ConservatoryExamPrep';
import { InteractiveBlueprints } from './InteractiveBlueprints';
import { AIMusicTutor } from './AIMusicTutor';
import { TRANSLATIONS } from './translations';
import { Waves, Clock, Music, Volume2 } from 'lucide-react';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tr');
  const [activeSection, setActiveSection] = useState<MainSection>('theory');
  const [activeTheorySub, setActiveTheorySub] = useState<TheorySubSection>('acoustics');
  const [isQuickToolsOpen, setIsQuickToolsOpen] = useState<boolean>(false);
  const [quickToolsTab, setQuickToolsTab] = useState<'metronome' | 'tuner'>('metronome');

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.tr;

  const handleOpenQuickTools = (tab: 'metronome' | 'tuner' = 'metronome') => {
    setQuickToolsTab(tab);
    setIsQuickToolsOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Persistent Navigation Header with Multilingual Switcher & Quick Tools */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onOpenQuickTools={handleOpenQuickTools}
      />

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* SECTION 1: GLOBAL MUSIC THEORY & SOLFEGE */}
        {activeSection === 'theory' && (
          <div className="space-y-6">
            {/* Theory Sub-Modules Selector */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-900 rounded-2xl border border-stone-800 w-fit">
              <button
                id="theory-sub-acoustics-btn"
                onClick={() => setActiveTheorySub('acoustics')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTheorySub === 'acoustics'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>{t.tabAcoustics}</span>
              </button>

              <button
                id="theory-sub-notation-btn"
                onClick={() => setActiveTheorySub('notation')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTheorySub === 'notation'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{t.tabNotation}</span>
              </button>

              <button
                id="theory-sub-solfege-btn"
                onClick={() => setActiveTheorySub('solfege')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTheorySub === 'solfege'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>{t.tabScalesModes}</span>
              </button>
            </div>

            {/* Sub-view rendering */}
            {activeTheorySub === 'acoustics' && <AcousticsLab language={currentLanguage} />}
            {activeTheorySub === 'notation' && <NotationMaster language={currentLanguage} />}
            {activeTheorySub === 'solfege' && <SolfegeSightReading language={currentLanguage} />}
          </div>
        )}

        {/* SECTION 2: VIOLIN MASTERCLASS */}
        {activeSection === 'violin' && <ViolinMasterclass language={currentLanguage} />}

        {/* SECTION 3: PIANO MASTERCLASS */}
        {activeSection === 'piano' && <PianoMasterclass language={currentLanguage} />}

        {/* SECTION 4: CONSERVATORY EXAM PREPARATION MODULE */}
        {activeSection === 'conservatory' && <ConservatoryExamPrep language={currentLanguage} />}

        {/* SECTION 5: INTERACTIVE BLUEPRINTS & SIGHT READING GAMES */}
        {activeSection === 'games' && (
          <div className="space-y-6">
            <InteractiveBlueprints language={currentLanguage} />
            <SolfegeSightReading language={currentLanguage} />
          </div>
        )}

        {/* SECTION 6: AI MAESTRO TUTOR */}
        {activeSection === 'ai_tutor' && <AIMusicTutor language={currentLanguage} />}
      </main>

      {/* Floating Quick Metronome / Tuner Button for Rapid Mobile Access */}
      <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2">
        <button
          onClick={() => handleOpenQuickTools('metronome')}
          className="w-12 h-12 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center shadow-2xl shadow-amber-600/50 border border-amber-400/40 transition active:scale-95"
          title="Acoustic Metronome & Tuner"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Global Quick Tools Modal (Metronome & Diapason Tuner) */}
      <QuickToolsModal
        isOpen={isQuickToolsOpen}
        onClose={() => setIsQuickToolsOpen(false)}
        initialTab={quickToolsTab}
        language={currentLanguage}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-stone-800/80 bg-stone-950 py-6 text-stone-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-serif font-bold text-sm">𝄞 MuseAcademy AI</span>
            <span>— Global Music Theory, Violin & Piano Masterclass Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <span>Standart: A4 = 440 Hz</span>
            <span>•</span>
            <span>12-TET & 53-TET Komaları</span>
            <span>•</span>
            <span>Multilingual Sovereignty [TR | EN | AR | FA | RU | JA | DE]</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
