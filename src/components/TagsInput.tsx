// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Chip-style tag editor: type a tag and press Enter or comma to add it, click
// the cross to remove, pick from the app's existing tags as you type. Tags
// are trimmed, lower-cased and de-duplicated; the same rules the tag
// endpoints apply.
import { useMemo, useState } from 'react';

export function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase().slice(0, 64);
}

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  autoFocus?: boolean;
}

export function TagsInput({ value, onChange, suggestions = [], placeholder, autoFocus }: Props) {
  const [draft, setDraft] = useState('');
  const matches = useMemo(() => {
    const q = normalizeTag(draft);
    if (!q) return [];
    return suggestions.filter((s) => s.includes(q) && !value.includes(s)).slice(0, 8);
  }, [draft, suggestions, value]);

  const add = (raw: string) => {
    const tag = normalizeTag(raw);
    if (!tag || value.includes(tag)) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };
  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 min-h-[44px]">
        {value.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-150 text-brand-500 rounded-2xl text-xs">
            {tag}
            <button type="button" onClick={() => remove(tag)} aria-label={`remove ${tag}`} className="leading-none hover:text-red-500">
              ×
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm py-1"
          value={draft}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) {
              remove(value[value.length - 1]);
            }
          }}
          onBlur={() => draft && add(draft)}
        />
      </div>
      {matches.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-xl bg-white shadow-lg border border-gray-100 py-1">
          {matches.map((m) => (
            <button
              key={m}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(m)}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100"
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
