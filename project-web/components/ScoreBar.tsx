import { clamp, formatScore, scoreLevel } from '@/lib/format';

export type ScoreVariant = 'semantic' | 'bm25' | 'qa';

interface ScoreBarProps {
  score: number;
  variant?: ScoreVariant;
  label?: string;
}

/**
 * Bar skor.
 * variant: 'semantic' | 'bm25' -> warna mengikuti tingkat skor (hijau / kuning / abu)
 *          'qa'                -> selalu oranye (aksen jawaban ulasan)
 */
export default function ScoreBar({ score, variant = 'semantic', label = 'Relevansi' }: ScoreBarProps) {
  const value = clamp(Number(score) || 0, 0, 1);
  const pct = Math.round(value * 100);
  return (
    <div className="score">
      <div className="score-head"><span>{label}</span><span className="score-value">{formatScore(value)}</span></div>
      <div
        className={`progress progress--${variant} progress--${scoreLevel(value)}`}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={formatScore(value)}
      >
        <span className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
