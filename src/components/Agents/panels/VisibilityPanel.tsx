import classNames from 'classnames';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { actionSetAgentVisibility } from '../../../actions';
import { useTranslation } from '../../../i18n/useTranslation';
import { ModelAgent } from '../../../models';

export const VisibilityPanel: React.FC<{
  agent: ModelAgent;
  isOwned: boolean;
  isSuperWriteAdmin: boolean;
  onChanged: (a: ModelAgent) => void;
}> = ({ agent, isOwned, isSuperWriteAdmin, onChanged }) => {
  const { t } = useTranslation();
  const canEdit = isOwned || isSuperWriteAdmin;
  // Making an agent public is the one visibility change that exposes it (and
  // its knowledge base, through clones) to everyone on the server: confirm it.
  const [confirmPublic, setConfirmPublic] = useState(false);
  const choose = (v: 'private' | 'unlisted' | 'public') => {
    if (v === 'public' && agent.visibility !== 'public') {
      setConfirmPublic(true);
      return;
    }
    doSet(agent.id, v, onChanged, t);
  };
  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t('agentSettings.visibilityHeading')}</h3>
        <p className="text-sm text-gray-600">
          {t('agentSettings.visibilityDescription')}
        </p>
      </div>

      <div className="space-y-2">
        <VisibilityOption
          value="private"
          current={agent.visibility}
          canEdit={canEdit}
          onChange={choose}
          label={t('agentSettings.visibilityPrivateLabel')}
          description={t('agentSettings.visibilityPrivateDesc')}
        />
        <VisibilityOption
          value="unlisted"
          current={agent.visibility}
          canEdit={canEdit}
          onChange={choose}
          label={t('agentSettings.visibilityUnlistedLabel')}
          description={t('agentSettings.visibilityUnlistedDesc')}
        />
        <VisibilityOption
          value="public"
          current={agent.visibility}
          canEdit={canEdit}
          onChange={choose}
          label={t('agentSettings.visibilityPublicLabel')}
          description={t('agentSettings.visibilityPublicDesc')}
          sensitive
        />
      </div>

      {!canEdit && (
        <div className="rounded-md border border-gray-300 bg-gray-50 p-2 text-xs text-gray-700">
          {t('agentSettings.visibilityNotEditableMain')}
          {agent.visibility === 'public' && (
            <> {t('agentSettings.visibilityNotEditableCloneHint')}</>
          )}
        </div>
      )}

      {confirmPublic && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-label={t('agentSettings.makePublicTitle')}>
          <div className="bg-white rounded-xl p-5 w-[480px] max-w-[90%] space-y-3">
            <h3 className="text-lg font-semibold">{t('agentSettings.makePublicTitle')}</h3>
            <p className="text-sm text-gray-700">
              {t('agentSettings.makePublicBody').replace('{name}', agent.displayName || '')}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirmPublic(false)} className="border rounded px-4 py-2 text-sm hover:bg-gray-100">
                {t('agentSettings.makePublicCancel')}
              </button>
              <button
                onClick={() => {
                  setConfirmPublic(false);
                  doSet(agent.id, 'public', onChanged, t);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white rounded px-4 py-2 text-sm"
              >
                {t('agentSettings.makePublicConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOwned && isSuperWriteAdmin && (
        <div className="rounded-md border border-purple-300 bg-purple-50 p-2 text-xs text-purple-900 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-200">
          <strong>{t('agentSettings.superadminModerationTitle')}</strong>{' '}
          {t('agentSettings.superadminModerationBody')}
        </div>
      )}
    </div>
  );
};

const VISIBILITY_LABEL_KEY: Record<'private' | 'unlisted' | 'public', string> = {
  private: 'agentSettings.visibilityPrivateLabel',
  unlisted: 'agentSettings.visibilityUnlistedLabel',
  public: 'agentSettings.visibilityPublicLabel',
};

async function doSet(
  agentId: string,
  v: 'private' | 'unlisted' | 'public',
  onChanged: (a: ModelAgent) => void,
  t: (key: string) => string
) {
  try {
    const updated = await actionSetAgentVisibility(agentId, v);
    if (updated) onChanged(updated);
    toast.success(`${t('agentSettings.visibilitySetToastPrefix')} ${t(VISIBILITY_LABEL_KEY[v])}`);
  } catch (err: any) {
    toast.error(`${t('agentSettings.failedPrefix')} ${err?.response?.data?.error || err.message}`);
  }
}

const VisibilityOption: React.FC<{
  value: 'private' | 'unlisted' | 'public';
  current: string;
  canEdit: boolean;
  onChange: (v: 'private' | 'unlisted' | 'public') => void;
  label: string;
  description: string;
  // Exposes the agent beyond its owner: drawn in amber so it reads as a
  // deliberate step.
  sensitive?: boolean;
}> = ({ value, current, canEdit, onChange, label, description, sensitive }) => {
  const isChecked = current === value;
  return (
    <label className={classNames(
      'flex items-start gap-3 border rounded-lg p-3 cursor-pointer',
      sensitive
        ? isChecked ? 'border-amber-500 bg-amber-50' : 'border-amber-200 bg-amber-50/60'
        : isChecked ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white',
      !canEdit && 'cursor-not-allowed opacity-70'
    )}>
      <input
        type="radio"
        name="visibility"
        value={value}
        checked={isChecked}
        disabled={!canEdit}
        onChange={() => onChange(value)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </label>
  );
};
