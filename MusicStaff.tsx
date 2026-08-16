import React from 'react';
import { ClefType } from './types';

interface MusicStaffProps {
  clef?: ClefType;
  notes?: Array<{
    name: string; // e.g. "C4", "A4", "F#5", "Eb4"
    duration?: string;
    accidental?: 'sharp' | 'flat' | 'natural';
    highlight?: boolean;
    label?: string;
  }>;
  width?: number;
  height?: number;
  timeSignature?: string;
}

export const MusicStaff: React.FC<MusicStaffProps> = ({
  clef = 'treble',
  notes = [],
  width = 380,
  height = 140,
  timeSignature = '4/4',
}) => {
  const staffLineSpacing = 14;
  const staffTopY = 40;
  // 5 staff lines
  const lines = [0, 1, 2, 3, 4].map((i) => staffTopY + i * staffLineSpacing);

  // Map pitch to vertical staff step (half line spacing)
  // For treble clef: E4 is line 0 (bottom line Y = staffTopY + 4 * 14 = 96)
  // For bass clef: G2 is bottom line
  // For alto: F3 is bottom line
  // For tenor: D3 is bottom line
  const getNoteY = (noteName: string, activeClef: ClefType): { y: number; accidental?: string; octave: number } => {
    const match = noteName.match(/^([A-G])([#b]?)(\d)$/);
    if (!match) return { y: staffTopY + 2 * staffLineSpacing, octave: 4 };

    const [, letter, acc, octStr] = match;
    const oct = parseInt(octStr, 10);
    const letterSteps: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
    const totalStep = oct * 7 + letterSteps[letter];

    // Reference base step for bottom line of staff
    let bottomLineStep = 4 * 7 + 2; // E4 = 30 for Treble
    if (activeClef === 'bass') bottomLineStep = 2 * 7 + 4; // G2 = 18
    if (activeClef === 'alto') bottomLineStep = 3 * 7 + 3; // F3 = 24
    if (activeClef === 'tenor') bottomLineStep = 3 * 7 + 1; // D3 = 22

    const stepsAboveBottom = totalStep - bottomLineStep;
    const bottomLineY = staffTopY + 4 * staffLineSpacing;
    const y = bottomLineY - (stepsAboveBottom * staffLineSpacing) / 2;

    return { y, accidental: acc || undefined, octave: oct };
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white/95 rounded-xl border border-stone-200 shadow-inner">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[420px] select-none"
        style={{ overflow: 'visible' }}
      >
        {/* Staff Lines */}
        {lines.map((y, idx) => (
          <line
            key={idx}
            x1="20"
            y1={y}
            x2={width - 20}
            y2={y}
            stroke="#1c1917"
            strokeWidth="1.5"
          />
        ))}

        {/* Start and End Bar lines */}
        <line x1="20" y1={lines[0]} x2="20" y2={lines[4]} stroke="#1c1917" strokeWidth="2.5" />
        <line x1={width - 20} y1={lines[0]} x2={width - 20} y2={lines[4]} stroke="#1c1917" strokeWidth="2.5" />

        {/* Clef Symbol (Stylized SVG Clef) */}
        {clef === 'treble' && (
          <text
            x="32"
            y={staffTopY + 44}
            fontSize="52"
            fill="#0f172a"
            fontFamily="serif"
            className="font-bold"
          >
            𝄞
          </text>
        )}
        {clef === 'bass' && (
          <text
            x="32"
            y={staffTopY + 36}
            fontSize="46"
            fill="#0f172a"
            fontFamily="serif"
            className="font-bold"
          >
            𝄢
          </text>
        )}
        {clef === 'alto' && (
          <text
            x="32"
            y={staffTopY + 38}
            fontSize="44"
            fill="#0f172a"
            fontFamily="serif"
            className="font-bold"
          >
            𝄡
          </text>
        )}
        {clef === 'tenor' && (
          <text
            x="32"
            y={staffTopY + 30}
            fontSize="44"
            fill="#0f172a"
            fontFamily="serif"
            className="font-bold"
          >
            𝄡
          </text>
        )}

        {/* Time Signature */}
        {timeSignature && (
          <g transform="translate(82, 0)">
            <text
              x="0"
              y={staffTopY + 24}
              fontSize="24"
              fontWeight="bold"
              fontFamily="serif"
              fill="#1c1917"
              textAnchor="middle"
            >
              {timeSignature.split('/')[0]}
            </text>
            <text
              x="0"
              y={staffTopY + 50}
              fontSize="24"
              fontWeight="bold"
              fontFamily="serif"
              fill="#1c1917"
              textAnchor="middle"
            >
              {timeSignature.split('/')[1]}
            </text>
          </g>
        )}

        {/* Notes */}
        {notes.map((noteItem, idx) => {
          const spacing = (width - 150) / Math.max(notes.length, 1);
          const x = 130 + idx * spacing + (notes.length === 1 ? 40 : 0);
          const { y, accidental } = getNoteY(noteItem.name, clef);
          const isHigh = y < staffTopY + 2 * staffLineSpacing;
          const stemUp = !isHigh;

          // Ledger lines calculation
          const bottomLineY = staffTopY + 4 * staffLineSpacing;
          const topLineY = staffTopY;
          const ledgerLines: number[] = [];

          if (y > bottomLineY + 6) {
            for (let ly = bottomLineY + staffLineSpacing; ly <= y + 2; ly += staffLineSpacing) {
              ledgerLines.push(ly);
            }
          } else if (y < topLineY - 6) {
            for (let ly = topLineY - staffLineSpacing; ly >= y - 2; ly -= staffLineSpacing) {
              ledgerLines.push(ly);
            }
          }

          return (
            <g key={idx} className="transition-all duration-200">
              {/* Ledger lines */}
              {ledgerLines.map((ly, lIdx) => (
                <line
                  key={lIdx}
                  x1={x - 14}
                  y1={ly}
                  x2={x + 14}
                  y2={ly}
                  stroke="#1c1917"
                  strokeWidth="1.5"
                />
              ))}

              {/* Accidental */}
              {accidental === '#' && (
                <text
                  x={x - 18}
                  y={y + 5}
                  fontSize="22"
                  fontWeight="bold"
                  fill="#b91c1c"
                  textAnchor="middle"
                >
                  ♯
                </text>
              )}
              {accidental === 'b' && (
                <text
                  x={x - 18}
                  y={y + 4}
                  fontSize="22"
                  fontWeight="bold"
                  fill="#1d4ed8"
                  textAnchor="middle"
                >
                  ♭
                </text>
              )}

              {/* Note Head (Rotated Ellipse) */}
              <ellipse
                cx={x}
                cy={y}
                rx="7"
                ry="5"
                transform={`rotate(-22 ${x} ${y})`}
                fill={noteItem.highlight ? '#2563eb' : '#09090b'}
                stroke={noteItem.highlight ? '#1d4ed8' : '#000'}
                strokeWidth="1"
              />

              {/* Note Stem */}
              <line
                x1={stemUp ? x + 6.5 : x - 6.5}
                y1={y}
                x2={stemUp ? x + 6.5 : x - 6.5}
                y2={stemUp ? y - 36 : y + 36}
                stroke={noteItem.highlight ? '#2563eb' : '#09090b'}
                strokeWidth="2"
              />

              {/* Label */}
              {noteItem.label && (
                <text
                  x={x}
                  y={y > staffTopY + 2 * staffLineSpacing ? y - 18 : y + 26}
                  fontSize="12"
                  fontWeight="600"
                  fill="#475569"
                  textAnchor="middle"
                >
                  {noteItem.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
