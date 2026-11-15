// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// T&S > Settings (docs/TRUST_AND_SAFETY.md sections 2, 10, 12 and 13): the
// `trustSafety` group of the install-wide server settings, moved here from
// the Server settings page. The presets above the fields, the image level
// picker (with the custom nudity fields and the advanced thresholds), the
// text checks, retention and deleted content. Reads and saves through the
// server settings API (GET / PUT /v2/server-settings, DELETE one key).
import type { AxiosError } from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { httpV2 } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import type { ServerSetting, ServerSettingsResponse } from '../../models';
import { useAppStore } from '../../store/useAppStore';
import {
  TS_GROUP,
  TS_IMAGE_CUSTOM_KEYS,
  TS_IMAGE_LEVEL_KEY,
  TS_IMAGE_LEVEL_THRESHOLD_KEYS,
  TS_PRESET_KEYS,
  TS_PRESET_VALUES,
  TsPresetName,
  matchingPreset,
} from '../../utils/trustSafety';
import { SettingRow } from '../serverSettings/SettingRow';
import { ImageLevelPicker } from './ImageLevelPicker';
import { PresetBar } from './PresetBar';

type ApiErr = AxiosError<{ error?: string; code?: string; details?: Record<string, string> }>;

interface Props {
  // Called after a save or reset (the Overview's status changes with it).
  onSaved?: () => void;
}

export function TrustSafetySettingsPanel({ onSaved }: Props) {
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser);
  const canEdit = Boolean(currentUser?.isSuperAdmin?.write);
  const [data, setData] = useState<ServerSettingsResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const r = await httpV2.get<ServerSettingsResponse>('/server-settings');
      setData(r.data);
    } catch (e) {
      const err = e as ApiErr;
      setLoadError(err.response?.data?.error || err.message);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const settings = useMemo(() => (data?.settings || []).filter((s) => s.group === TS_GROUP), [data]);
  const settingByKey = useMemo(() => {
    const m: Record<string, ServerSetting> = {};
    for (const s of settings) m[s.key] = s;
    return m;
  }, [settings]);

  const draftOf = (s: ServerSetting) => (drafts[s.key] !== undefined ? drafts[s.key] : s.type === 'secret' ? '' : s.value);
  const changed = (s: ServerSetting) => drafts[s.key] !== undefined && drafts[s.key] !== (s.type === 'secret' ? '' : s.value);

  // The drafted value of every preset key, the preset those values match,
  // and applying a preset (fills the drafts and TS_PROFILE). Presets are
  // compared on the keys this server has (an API without TS_IMAGE_LEVEL
  // still recognises them).
  const tsKnown = (k: string) => Boolean(settingByKey[k]);
  const tsValues = (d: Record<string, string>) => {
    const out: Record<string, string> = {};
    for (const k of TS_PRESET_KEYS) out[k] = d[k] !== undefined ? d[k] : settingByKey[k]?.value ?? '';
    return out;
  };
  const currentPreset = matchingPreset(tsValues(drafts), tsKnown);

  const applyPreset = (preset: TsPresetName) => {
    setDrafts((d) => {
      const next = { ...d };
      for (const [k, v] of Object.entries(TS_PRESET_VALUES[preset])) if (tsKnown(k)) next[k] = v;
      if (settingByKey.TS_PROFILE) next.TS_PROFILE = preset;
      return next;
    });
    setFieldErrors({});
    setMessage({ kind: 'ok', text: t('trustSafety.presets.applied').replace('{preset}', t(`trustSafety.preset.${preset}`)) });
  };

  const updateDraft = (key: string, v: string) =>
    setDrafts((d) => {
      const next = { ...d, [key]: v };
      // A value changed by hand: the profile follows (a preset or Custom).
      if (TS_PRESET_KEYS.includes(key) && settingByKey.TS_PROFILE) {
        next.TS_PROFILE = matchingPreset(tsValues(next), tsKnown) || 'custom';
      }
      return next;
    });

  const save = async () => {
    const values: Record<string, string> = {};
    for (const s of settings) if (changed(s)) values[s.key] = drafts[s.key];
    if (!Object.keys(values).length) return;
    setBusy(true);
    setMessage(null);
    setFieldErrors({});
    try {
      const r = await httpV2.put<ServerSettingsResponse>('/server-settings', { values });
      setData(r.data);
      setDrafts({});
      setMessage({ kind: 'ok', text: t('serverSettings.saved') });
      onSaved?.();
    } catch (e) {
      const err = e as ApiErr;
      setFieldErrors(err.response?.data?.details || {});
      setMessage({ kind: 'error', text: t('serverSettings.failed').replace('{error}', err.response?.data?.error || err.message) });
    } finally {
      setBusy(false);
    }
  };

  const reset = async (s: ServerSetting) => {
    setBusy(true);
    setMessage(null);
    try {
      const r = await httpV2.delete<ServerSettingsResponse>(`/server-settings/${encodeURIComponent(s.key)}`);
      setData(r.data);
      setDrafts((d) => {
        const next = { ...d };
        delete next[s.key];
        return next;
      });
      setMessage({ kind: 'ok', text: t('serverSettings.resetDone') });
      onSaved?.();
    } catch (e) {
      const err = e as ApiErr;
      setMessage({ kind: 'error', text: t('serverSettings.failed').replace('{error}', err.response?.data?.error || err.message) });
    } finally {
      setBusy(false);
    }
  };

  const row = (s: ServerSetting) => (
    <SettingRow
      key={s.key}
      setting={s}
      value={draftOf(s)}
      disabled={!canEdit || busy}
      onChange={(v) => updateDraft(s.key, v)}
      error={fieldErrors[s.key]}
      canReset={canEdit}
      resetDisabled={busy}
      onReset={() => void reset(s)}
    />
  );

  if (loadError) {
    return <p className="text-sm text-red-600 dark:text-red-400">{t('tsHub.settings.loadFailed').replace('{error}', loadError)}</p>;
  }
  if (!data) return <p className="text-sm text-gray-500">{t('tsHub.loading')}</p>;
  if (!settings.length) {
    return <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl">{t('tsHub.settings.unavailable')}</div>;
  }

  const hasLevel = Boolean(settingByKey[TS_IMAGE_LEVEL_KEY]);
  const dirty = settings.some(changed);

  return (
    <div className="max-w-3xl min-w-0">
      <p className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">{t('trustSafety.service.note')}</p>
      <div className="rounded-2xl bg-gray-50 p-4 md:p-8 mb-6 min-w-0">
        <h3 className="font-varela text-[18px] md:text-[20px] mb-4">{t('serverSettings.group.trustSafety')}</h3>
        <PresetBar current={currentPreset} disabled={!canEdit || busy} onApply={applyPreset} />
        <div className="grid grid-cols-1 gap-5">
          {settings.map((s) => {
            if (!hasLevel) return row(s);
            // With image levels the picker stands in for the level, its
            // thresholds and the custom nudity fields.
            if (s.key === TS_IMAGE_LEVEL_KEY) {
              const rowsOf = (keys: string[]) => keys.map((k) => settingByKey[k]).filter(Boolean).map(row);
              return (
                <ImageLevelPicker
                  key={s.key}
                  value={draftOf(s)}
                  disabled={!canEdit || busy}
                  error={fieldErrors[s.key]}
                  onChange={(level) => updateDraft(s.key, level)}
                  customRows={rowsOf(TS_IMAGE_CUSTOM_KEYS)}
                  thresholdRows={rowsOf(TS_IMAGE_LEVEL_THRESHOLD_KEYS)}
                />
              );
            }
            if (TS_IMAGE_CUSTOM_KEYS.includes(s.key) || TS_IMAGE_LEVEL_THRESHOLD_KEYS.includes(s.key)) return null;
            return row(s);
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void save()}
            disabled={!canEdit || busy || !dirty}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm disabled:opacity-50"
          >
            {busy ? t('serverSettings.saving') : t('serverSettings.save')}
          </button>
          {message && (
            <span className={message.kind === 'ok' ? 'text-sm text-green-700 dark:text-green-400' : 'text-sm text-red-700 dark:text-red-400'}>
              {message.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
