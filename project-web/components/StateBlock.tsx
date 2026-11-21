import type { ReactNode } from 'react';

/* Ilustrasi garis sederhana untuk state kosong / error (bukan ikon dalam lingkaran) */
const ILLUSTRATIONS: Record<'empty' | 'error', ReactNode> = {
  empty: (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="40" cy="36" r="22" /><path d="m56 52 16 16" />
      <path d="M34 30a6 6 0 1 1 8.5 5.5c-1.6.8-2.5 2-2.5 3.5v1.5" /><path d="M40 46h.01" />
      <path d="M8 72h80" strokeDasharray="2 5" />
    </svg>
  ),
  error: (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M48 12 82 66H14Z" /><path d="M48 32v14" /><path d="M48 55h.01" />
      <path d="M8 72h80" strokeDasharray="2 5" />
    </svg>
  ),
};

export interface StateAction {
  label: string;
  action: string;
  /** 'chip' menampilkan chip contoh kueri; selain itu varian tombol (.btn--primary, .btn--secondary) */
  variant?: 'chip' | 'primary' | 'secondary';
}

interface StateBlockProps {
  illustration?: 'empty' | 'error';
  title: string;
  text?: string;
  actions?: StateAction[];
  tone?: '' | 'danger';
  compact?: boolean;
  onAction?: (action: string) => void;
}

/** Blok state umum (kosong / tidak ada hasil / error). */
export default function StateBlock({ illustration, title, text = '', actions = [], tone = '', compact = false, onAction }: StateBlockProps) {
  const toneClass = tone ? ` state--${tone}` : '';
  return (
    <div className={`state${toneClass}${compact ? ' state--compact' : ''}`} role={tone === 'danger' ? 'alert' : undefined}>
      {illustration && !compact && <span className="state__art">{ILLUSTRATIONS[illustration]}</span>}
      <h3 className="state__title">{title}</h3>
      {text && <p className="state__text">{text}</p>}
      {actions.length > 0 && (
        <div className="state__actions">
          {actions.map((a) => (
            <button
              key={a.action}
              type="button"
              className={a.variant === 'chip' ? 'chip chip--example' : `btn btn--${a.variant || 'secondary'}`}
              onClick={() => onAction?.(a.action)}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
