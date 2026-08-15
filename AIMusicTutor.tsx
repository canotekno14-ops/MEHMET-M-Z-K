import React, { useState, useRef, useEffect } from 'react';
import { Language, AIMessage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, Bot, User, Loader2, Music, BookOpen, Activity, Disc, RotateCcw } from 'lucide-react';

interface AIMusicTutorProps {
  language: Language;
}

export const AIMusicTutor: React.FC<AIMusicTutorProps> = ({ language }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.tr;

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      content: `### 𝄞 Hoş Geldiniz! Ben MuseAcademy Maestro AI

Dünyanın en kapsamlı **Müzik Teorisi, Solfej, Keman ve Piyano Masterclass** uzmanıyım.
[TR | EN | AR | FA | RU | JA | DE] dillerinde, terminolojiyi her dilin kurallarına göre (Türkçe Do-Re-Mi, İngilizce C-D-E, Almanca H vb.) uygulayarak yanıt veririm.

Aşağıdaki başlıklarda veya aklınıza gelen herhangi bir teknik/müzikolojik konuda bana danışabilirsiniz:
- **Akustik & Ses Fiziği:** Frekans hesaplamaları ($f = 440 \\cdot 2^{(n-69)/12}$), doğuşkanlar (overtones), 12-TET vs Saf akort vs Türk Makamı (53-TET komalar).
- **Keman Pedagojisi:** Galamian & Flesch yay teknikleri (Martelé, Spiccato, Sautillé, Ricochet, Sul Ponticello), 1-7. pozisyon kaymaları (shifting), vibrato frekans modülasyonu.
- **Piyano Pedagojisi:** Hanon No. 1–60 parmak bağımsızlığı, Taubman rotasyon & ağırlık aktarımı, 3 pedal (Damper, Sostenuto, Una Corda) mekaniği.
- **Form & Armoni:** Barok Füg, Sonat Allegro formu, Romen rakamları ile derece analizi, Neapolitan 6lısı, Augmented 6th akorları.`,
      timestamp: new Date(),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    {
      title: 'Bach Chaconne BWV 1004 Keman Analizi',
      prompt: 'Bach Partita No. 2 Chaconne (BWV 1004) için arpejleme (bariolage), yay ağırlık kontrolü ve 3-4 sesli akorların icra prensiplerini detaylı açıkla.',
      category: 'violin',
    },
    {
      title: 'Chopin Etütleri & Taubman Kol Ağırlığı',
      prompt: 'Chopin Op. 10 No. 1 ve Op. 25 No. 1 etütlerinde bilek gerilimini önlemek için Taubman rotasyon ve serbest yerçekimi kol ağırlığı (arm weight) tekniğini adım adım anlat.',
      category: 'piano',
    },
    {
      title: 'Segah Makamı & 53-TET Komaları',
      prompt: 'Türk Sanat Müziği Segah makamı ile Batı Klasik Müziği arasındaki mikrotonal koma farklarını (Holder koması, 53-TET vs 12-TET) ve perde frekanslarını matematiksel olarak karşılaştır.',
      category: 'theory',
    },
    {
      title: 'Keman 3. ve 5. Pozisyon Kayma Egzersizi Üret',
      prompt: 'Sol el başparmak pivotu ve glissando/shift mekaniğini geliştirmek için 1., 3. ve 5. pozisyonlar arasında geçiş sağlayan özel bir Kreutzer/Sevcik tarzı egzersiz oluştur.',
      category: 'exercise',
    },
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuery.trim();
    if (!textToSend || isLoading) return;

    const userMsg: AIMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: AIMessage = {
        role: 'assistant',
        content: data.text || 'Üzgünüm, şu anda yanıt oluşturulamadı.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI Request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Bağlantı hatası: ${err.message || 'Sunucuya ulaşılamadı'}. Lütfen tekrar deneyin.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 shadow-xl flex flex-col h-[750px] overflow-hidden animate-in fade-in duration-300">
      {/* Tutor Header */}
      <div className="p-4 bg-stone-950/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-600/30">
            <Sparkles className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-100 text-sm font-serif">MuseAcademy AI Maestro</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Gemini 3.7 Pro
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Müzikoloji, Solfej, Keman & Piyano Masterclass Asistanı
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages((prev) => [prev[0]]);
          }}
          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Sohbeti Sıfırla
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 bg-stone-950/40 border-b border-stone-800/60 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] text-stone-400 font-semibold whitespace-nowrap pl-1">Önerilen Konular:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-750 text-stone-300 hover:text-white text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 shrink-0"
          >
            {qp.category === 'violin' && <Activity className="w-3 h-3 text-amber-400" />}
            {qp.category === 'piano' && <Disc className="w-3 h-3 text-sky-400" />}
            {qp.category === 'theory' && <BookOpen className="w-3 h-3 text-emerald-400" />}
            {qp.category === 'exercise' && <Music className="w-3 h-3 text-purple-400" />}
            <span>{qp.title}</span>
          </button>
        ))}
      </div>

      {/* Message Chat History */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  isUser
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-stone-800 text-amber-400 border border-stone-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-amber-600 text-white border-amber-500 rounded-tr-none'
                    : 'bg-stone-950 text-stone-200 border-stone-800 rounded-tl-none prose-invert shadow-md'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="markdown-content space-y-3">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-stone-800 border border-stone-700 text-amber-400 flex items-center justify-center shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 bg-stone-950 text-stone-400 rounded-2xl rounded-tl-none border border-stone-800 text-xs flex items-center gap-2">
              <span>Maestro yanıt hazırlıyor, analiz yapılıyor...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-stone-950 border-t border-stone-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 max-w-5xl mx-auto"
        >
          <input
            id="ai-tutor-input"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Bir müzik teorisi kavramı, keman yay tekniği veya piyano egzersizi sorun..."
            disabled={isLoading}
            className="flex-1 bg-stone-900 border border-stone-750 focus:border-amber-500 rounded-xl px-4 py-3 text-xs md:text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition shadow-inner"
          />

          <button
            id="ai-tutor-send-btn"
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={`px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
              inputQuery.trim() && !isLoading
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Gönder</span>
          </button>
        </form>
      </div>
    </div>
  );
};
