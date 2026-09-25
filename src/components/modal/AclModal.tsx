// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
import { Dialog, DialogPanel } from '@headlessui/react';
import { set } from 'lodash';
import { useMemo } from 'react';

import { ModelUserACL } from '../../models';
import { IconClose } from '../Icons/IconClose';
import './AclModal.scss';
import { CheckboxApp } from '../CheckboxApp';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  onClose: () => void;
  acl: ModelUserACL;
  setEditAcl: (a: ModelUserACL) => void;
  updateAcl: () => void;
}

type Flag = 'create' | 'read' | 'update' | 'delete' | 'admin';
type Area = 'appSettings' | 'appUsers' | 'appTokens' | 'appPush' | 'appStats';

// The flags each area actually has on the backend (validation/user/acl/
// updateAclSchema.js). Anything else is not a permission, so it is not drawn
// as a greyed-out box any more.
const AREAS: Array<{ area: Area; label: string; flags: Flag[] }> = [
  { area: 'appSettings', label: 'aclModal.rowSettings', flags: ['read', 'update', 'admin'] },
  { area: 'appUsers', label: 'aclModal.rowUsers', flags: ['create', 'read', 'update', 'delete', 'admin'] },
  { area: 'appTokens', label: 'aclModal.rowTokens', flags: ['create', 'read', 'update', 'admin'] },
  { area: 'appPush', label: 'aclModal.rowPushNotifications', flags: ['create', 'read', 'update', 'admin'] },
  { area: 'appStats', label: 'aclModal.rowStatistics', flags: ['read', 'admin'] },
];
const COLUMNS: Flag[] = ['create', 'read', 'update', 'delete', 'admin'];

// Presets are just named grant sets over the same flags; picking one fills
// the grid, touching the grid switches back to "Custom". Every preset that
// manages anything includes Settings > Read, because that flag is what puts
// the app in the user's list (the backend forces it too).
type PresetId = 'member' | 'analyst' | 'userManager' | 'admin' | 'custom';
type Grants = Partial<Record<Area, Partial<Record<Flag, boolean>>>>;
const PRESETS: Array<{ id: Exclude<PresetId, 'custom'>; grants: Grants }> = [
  { id: 'member', grants: {} },
  { id: 'analyst', grants: { appSettings: { read: true }, appStats: { read: true } } },
  {
    id: 'userManager',
    grants: { appSettings: { read: true }, appUsers: { create: true, read: true, update: true, delete: true, admin: true } },
  },
  {
    id: 'admin',
    grants: {
      appSettings: { read: true, update: true, admin: true },
      appUsers: { create: true, read: true, update: true, delete: true, admin: true },
      appTokens: { create: true, read: true, update: true, admin: true },
      appPush: { create: true, read: true, update: true, admin: true },
      appStats: { read: true, admin: true },
    },
  },
];

function flagOf(acl: ModelUserACL, area: Area, flag: Flag): boolean {
  const row = (acl.application as unknown as Record<Area, Partial<Record<Flag, boolean>>>)[area];
  return Boolean(row?.[flag]);
}

function managesAnything(acl: ModelUserACL): boolean {
  return AREAS.some(({ area, flags }) => flags.some((f) => flagOf(acl, area, f)));
}

function matchesPreset(acl: ModelUserACL, grants: Grants): boolean {
  return AREAS.every(({ area, flags }) => flags.every((f) => flagOf(acl, area, f) === Boolean(grants[area]?.[f])));
}

export function AclModal({ onClose, acl, setEditAcl, updateAcl }: Props) {
  const { t } = useTranslation();

  const preset: PresetId = useMemo(() => PRESETS.find((p) => matchesPreset(acl, p.grants))?.id ?? 'custom', [acl]);
  const managed = managesAnything(acl);

  const setFlags = (mutate: (next: ModelUserACL) => void) => {
    const next: ModelUserACL = JSON.parse(JSON.stringify(acl));
    mutate(next);
    // Settings > Read follows any management grant; see the preset comment.
    if (managesAnything(next)) set(next, 'application.appSettings.read', true);
    setEditAcl(next);
  };

  const applyPreset = (grants: Grants) =>
    setFlags((next) => {
      AREAS.forEach(({ area, flags }) => flags.forEach((f) => set(next, `application.${area}.${f}`, Boolean(grants[area]?.[f]))));
    });

  const toggle = (area: Area, flag: Flag, isSet: boolean) => setFlags((next) => set(next, `application.${area}.${flag}`, isSet));

  const presetButton = (id: PresetId, onClick?: () => void) => (
    <button
      key={id}
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border px-3 py-2 text-left text-sm ${
        preset === id ? 'border-brand-500 bg-brand-150 text-brand-500' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      <div className="font-semibold">{t(`aclModal.preset_${id}`)}</div>
      <div className="text-xs text-gray-500">{t(`aclModal.preset_${id}_hint`)}</div>
    </button>
  );

  const th = 'px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap';

  return (
    <Dialog className="fixed inset-0 flex justify-center items-center bg-black/30" open={true} onClose={() => {}}>
      <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto">
        <div className="font-varela text-[24px] text-center relative flex justify-center items-center mb-6">
          <span>{t('aclModal.title')}</span>
          <button className="absolute top-0 right-0" onClick={() => onClose()}>
            <IconClose />
          </button>
        </div>

        <div className="font-sans font-semibold text-regular mb-1">{t('aclModal.presetsTitle')}</div>
        <div className="font-sans text-xs text-gray-500 mb-3">{t('aclModal.presetsDescription')}</div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {PRESETS.map((p) => presetButton(p.id, () => applyPreset(p.grants)))}
          {preset === 'custom' && presetButton('custom')}
        </div>

        <div className="font-sans font-semibold text-regular mb-1">{t('aclModal.appLevelTitle')}</div>
        <div className="font-sans text-xs text-gray-500 mb-3">{t('aclModal.appLevelDescription')}</div>
        <div className="mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap rounded-l-lg">
                  {t('aclModal.colName')}
                </th>
                {COLUMNS.map((c, i) => (
                  <th key={c} className={`${th} ${i === COLUMNS.length - 1 ? 'rounded-r-lg' : ''}`}>
                    {t(`aclModal.col${c[0].toUpperCase()}${c.slice(1)}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AREAS.map(({ area, label, flags }) => (
                <tr key={area}>
                  <td className="pl-4 py-3 rounded-l-lg font-inter text-xs whitespace-nowrap">{t(label)}</td>
                  {COLUMNS.map((c) => {
                    const exists = flags.includes(c);
                    const locked = area === 'appSettings' && c === 'read' && managed;
                    return (
                      <td key={c} className="px-4 text-center">
                        {exists ? (
                          <div className="flex justify-center" title={locked ? t('aclModal.settingsReadLocked') : undefined}>
                            <CheckboxApp
                              checked={flagOf(acl, area, c)}
                              disabled={locked}
                              onChange={(isSet) => toggle(area, c, isSet)}
                            />
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="font-sans text-xs text-gray-500 mb-6">{t('aclModal.settingsReadNote')}</div>

        <div className="font-sans font-semibold text-regular mb-1">{t('aclModal.serverLevelTitle')}</div>
        <div className="font-sans text-xs text-gray-500 mb-3">{t('aclModal.serverLevelDescription')}</div>
        <div className="mb-8 flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
          <CheckboxApp checked={acl.network.netStats.read} onChange={(isSet) => setFlags((next) => set(next, 'network.netStats.read', isSet))} />
          <span className="font-inter text-xs">{t('aclModal.rowNetworkStatistics')}</span>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <button className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500" onClick={onClose}>
            {t('aclModal.cancel')}
          </button>
          <button className="w-full rounded-xl bg-brand-500 py-[12px] text-white hover:bg-brand-darker" onClick={() => updateAcl()}>
            {t('aclModal.updateAcl')}
          </button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}
