// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
import { Dialog, DialogPanel } from '@headlessui/react';
import { set } from 'lodash';
import { useMemo } from 'react';

import {
  CAPABILITIES,
  PRESETS,
  PresetId,
  capabilityOn,
  managesAnything,
  matchesPreset,
  setCapability,
  withPreset,
} from '../../lib/aclPresets';
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

  const applyPreset = (p: (typeof PRESETS)[number]) => setEditAcl(withPreset(acl, p.id));

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
