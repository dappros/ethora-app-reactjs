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
  // For the title: "Permissions for {user} in {app}". Optional so older
  // callers keep working.
  userLabel?: string;
  appLabel?: string;
}

type Flag = 'create' | 'read' | 'update' | 'delete' | 'admin';
type Area = 'appSettings' | 'appUsers' | 'appTokens' | 'appPush' | 'appStats';

// The flags each area has on the backend (validation/user/acl/updateAclSchema.js).
// appTokens is kept for presets and preset matching but is not shown: the
// only thing it gates is ERC-20 token creation, which installs no longer use.
const AREAS: Array<{ area: Area; flags: Flag[] }> = [
  { area: 'appSettings', flags: ['read', 'update', 'admin'] },
  { area: 'appUsers', flags: ['create', 'read', 'update', 'delete', 'admin'] },
  { area: 'appTokens', flags: ['create', 'read', 'update', 'admin'] },
  { area: 'appPush', flags: ['create', 'read', 'update', 'admin'] },
  { area: 'appStats', flags: ['read', 'admin'] },
];

// What the panel actually lets a person do, expressed over those flags.
// Each capability owns a set of flags: on = all of them true, off = all
// false. The "see" capability is what puts the app in the user's list and
// follows any other grant (the backend forces it too).
type CapabilityId = 'see' | 'settings' | 'manageUsers' | 'removeUsers' | 'permissions' | 'push' | 'stats';
const CAPABILITIES: Array<{ id: CapabilityId; flags: Array<[Area, Flag]> }> = [
  { id: 'see', flags: [['appSettings', 'read']] },
  { id: 'settings', flags: [['appSettings', 'update'], ['appSettings', 'admin']] },
  { id: 'manageUsers', flags: [['appUsers', 'create'], ['appUsers', 'read'], ['appUsers', 'update']] },
  { id: 'removeUsers', flags: [['appUsers', 'delete']] },
  { id: 'permissions', flags: [['appUsers', 'admin']] },
  { id: 'push', flags: [['appPush', 'create'], ['appPush', 'read'], ['appPush', 'update'], ['appPush', 'admin']] },
  { id: 'stats', flags: [['appStats', 'read'], ['appStats', 'admin']] },
];

type PresetId = 'member' | 'analyst' | 'userManager' | 'admin' | 'custom';
const PRESETS: Array<{ id: Exclude<PresetId, 'custom'>; on: CapabilityId[]; tokens?: boolean }> = [
  { id: 'member', on: [] },
  { id: 'analyst', on: ['see', 'stats'] },
  { id: 'userManager', on: ['see', 'manageUsers', 'removeUsers', 'permissions'] },
  { id: 'admin', on: ['see', 'settings', 'manageUsers', 'removeUsers', 'permissions', 'push', 'stats'], tokens: true },
];

function flagOf(acl: ModelUserACL, area: Area, flag: Flag): boolean {
  const row = (acl.application as unknown as Record<Area, Partial<Record<Flag, boolean>>>)[area];
  return Boolean(row?.[flag]);
}

function capabilityOn(acl: ModelUserACL, id: CapabilityId): boolean {
  const cap = CAPABILITIES.find((c) => c.id === id);
  return Boolean(cap && cap.flags.every(([a, f]) => flagOf(acl, a, f)));
}

function managesAnything(acl: ModelUserACL): boolean {
  return AREAS.some(({ area, flags }) => flags.some((f) => !(area === 'appSettings' && f === 'read') && flagOf(acl, area, f)));
}

function matchesPreset(acl: ModelUserACL, preset: (typeof PRESETS)[number]): boolean {
  const capsMatch = CAPABILITIES.every((c) => capabilityOn(acl, c.id) === preset.on.includes(c.id));
  const tokensMatch = AREAS.find((a) => a.area === 'appTokens')!.flags.every((f) => flagOf(acl, 'appTokens', f) === Boolean(preset.tokens));
  return capsMatch && tokensMatch;
}

export function AclModal({ onClose, acl, setEditAcl, updateAcl, userLabel, appLabel }: Props) {
  const { t } = useTranslation();

  const preset: PresetId = useMemo(() => PRESETS.find((p) => matchesPreset(acl, p))?.id ?? 'custom', [acl]);
  const managed = managesAnything(acl);

  const edit = (mutate: (next: ModelUserACL) => void) => {
    const next: ModelUserACL = JSON.parse(JSON.stringify(acl));
    mutate(next);
    if (managesAnything(next)) set(next, 'application.appSettings.read', true);
    setEditAcl(next);
  };

  const setCapability = (next: ModelUserACL, id: CapabilityId, on: boolean) => {
    CAPABILITIES.find((c) => c.id === id)!.flags.forEach(([a, f]) => set(next, `application.${a}.${f}`, on));
  };

  const applyPreset = (p: (typeof PRESETS)[number]) =>
    edit((next) => {
      CAPABILITIES.forEach((c) => setCapability(next, c.id, p.on.includes(c.id)));
      AREAS.find((a) => a.area === 'appTokens')!.flags.forEach((f) => set(next, `application.appTokens.${f}`, Boolean(p.tokens)));
    });

  const title =
    userLabel && appLabel
      ? t('aclModal.titleFor').replace('{user}', userLabel).replace('{app}', appLabel)
      : t('aclModal.title');

  return (
    <Dialog className="fixed inset-0 flex justify-center items-center bg-black/30" open={true} onClose={() => {}}>
      <DialogPanel className="p-8 bg-white rounded-2xl relative w-full max-w-[640px] max-h-[90vh] overflow-y-auto">
        <div className="font-varela text-[22px] text-center relative flex justify-center items-center mb-6 pr-8">
          <span>{title}</span>
          <button className="absolute top-0 right-0" onClick={() => onClose()}>
            <IconClose />
          </button>
        </div>

        <div className="font-sans font-semibold text-regular mb-1">{t('aclModal.presetsTitle')}</div>
        <div className="font-sans text-xs text-gray-500 mb-3">{t('aclModal.presetsDescription')}</div>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[...PRESETS.map((p) => ({ id: p.id as PresetId, onClick: () => applyPreset(p) })), ...(preset === 'custom' ? [{ id: 'custom' as PresetId, onClick: undefined }] : [])].map(
            ({ id, onClick }) => (
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
            )
          )}
        </div>

        <div className="font-sans font-semibold text-regular mb-1">{t('aclModal.capabilitiesTitle')}</div>
        <div className="font-sans text-xs text-gray-500 mb-3">{t('aclModal.capabilitiesDescription')}</div>
        <div className="flex flex-col gap-2 mb-8">
          {CAPABILITIES.map(({ id }) => {
            const locked = id === 'see' && managed;
            return (
              <label
                key={id}
                className={`flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 ${locked ? 'bg-gray-50' : 'cursor-pointer hover:bg-gray-50'}`}
                title={locked ? t('aclModal.settingsReadLocked') : undefined}
              >
                <div className="pt-0.5">
                  <CheckboxApp checked={capabilityOn(acl, id)} disabled={locked} onChange={(on) => edit((next) => setCapability(next, id, on))} />
                </div>
                <div className="min-w-0">
                  <div className="font-sans text-sm">{t(`aclModal.cap_${id}`)}</div>
                  <div className="font-sans text-xs text-gray-500">{t(`aclModal.cap_${id}_hint`)}</div>
                </div>
              </label>
            );
          })}
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
