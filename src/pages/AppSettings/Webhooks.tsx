import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CopyButton } from '../../components/CopyButton';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import {
  AppWebhook,
  httpCreateAppWebhook,
  httpDeleteAppWebhook,
  httpListAppWebhooks,
  httpTestAppWebhook,
  httpUpdateAppWebhook,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelApp } from '../../models';

interface Props {
  app: ModelApp;
}

// Same limit as the backend (MAX_WEBHOOKS_PER_APP); the form hides past it.
const MAX_WEBHOOKS = 10;

const sectionTitle = 'font-semibold font-sans text-normal mb-2';
const body = 'text-gray-500 text-sm font-sans';
const card = 'p-4 border border-gray-200 rounded-xl mb-8';
const input =
  'w-full bg-gray-100 rounded-xl px-[12px] py-[12px] placeholder:text-gray-500 outline-none text-sm';
const linkButton = 'text-brand-500 hover:underline disabled:opacity-50 text-sm';

type Form = { id: string | null; url: string; description: string; events: string[] };

const emptyForm = (events: string[]): Form => ({
  id: null,
  url: '',
  description: '',
  events: events.slice(0, 1),
});

function errorText(e: unknown) {
  const err = e as { response?: { data?: { error?: string } }; message?: string } | undefined;
  return err?.response?.data?.error || err?.message || '';
}

function formatDateTime(value: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

export const Webhooks = ({ app }: Props) => {
  const { t } = useTranslation();

  const [items, setItems] = useState<AppWebhook[] | null>(null);
  const [eventNames, setEventNames] = useState<string[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  // Secret just returned by create / rotate; shown once.
  const [revealed, setRevealed] = useState<{ id: string; secret: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ kind: 'delete' | 'rotate'; hook: AppWebhook } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await httpListAppWebhooks(app._id);
      setItems(res.data.data.items || []);
      setEventNames(res.data.data.events || []);
    } catch (e) {
      setItems([]);
      toast.error(t('appWebhooks.toastError').replace('{error}', errorText(e)));
    }
  }, [app._id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const replaceItem = (hook: AppWebhook) =>
    setItems((list) => (list || []).map((h) => (h.id === hook.id ? hook : h)));

  const onSave = async () => {
    if (!form) return;
    const url = form.url.trim();
    if (!url) return setFormError(t('appWebhooks.errorUrl'));
    if (!form.events.length) return setFormError(t('appWebhooks.errorEvents'));
    setFormError('');
    setSaving(true);
    try {
      const fields = { url, events: form.events, description: form.description.trim() };
      if (form.id) {
        const res = await httpUpdateAppWebhook(app._id, form.id, fields);
        replaceItem(res.data.data);
        toast.success(t('appWebhooks.toastSaved'));
      } else {
        const res = await httpCreateAppWebhook(app._id, fields);
        const { secret, ...hook } = res.data.data;
        setItems((list) => [...(list || []), hook]);
        if (secret) setRevealed({ id: hook.id, secret });
        toast.success(t('appWebhooks.toastCreated'));
      }
      setForm(null);
    } catch (e) {
      setFormError(errorText(e));
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (hook: AppWebhook) => {
    setBusyId(hook.id);
    try {
      const res = await httpUpdateAppWebhook(app._id, hook.id, { enabled: !hook.enabled });
      replaceItem(res.data.data);
    } catch (e) {
      toast.error(t('appWebhooks.toastError').replace('{error}', errorText(e)));
    } finally {
      setBusyId(null);
    }
  };

  const onTest = async (hook: AppWebhook) => {
    setBusyId(hook.id);
    try {
      const { delivered, status, error } = (await httpTestAppWebhook(app._id, hook.id)).data.data;
      if (delivered) toast.success(t('appWebhooks.testOk').replace('{status}', String(status)));
      else toast.error(t('appWebhooks.testFailed').replace('{error}', error || `HTTP ${status}`));
    } catch (e) {
      toast.error(t('appWebhooks.toastError').replace('{error}', errorText(e)));
    } finally {
      setBusyId(null);
    }
  };

  const onConfirm = async () => {
    if (!confirm) return;
    const { kind, hook } = confirm;
    setBusyId(hook.id);
    try {
      if (kind === 'delete') {
        await httpDeleteAppWebhook(app._id, hook.id);
        setItems((list) => (list || []).filter((h) => h.id !== hook.id));
        if (revealed?.id === hook.id) setRevealed(null);
        if (form?.id === hook.id) setForm(null);
        toast.success(t('appWebhooks.toastDeleted'));
      } else {
        const res = await httpUpdateAppWebhook(app._id, hook.id, { rotateSecret: true });
        const { secret, ...updated } = res.data.data;
        replaceItem(updated);
        if (secret) setRevealed({ id: hook.id, secret });
      }
      setConfirm(null);
    } catch (e) {
      toast.error(t('appWebhooks.toastError').replace('{error}', errorText(e)));
    } finally {
      setBusyId(null);
    }
  };

  const eventLabel = (name: string) => {
    const key = `appWebhooks.event.${name}`;
    const label = t(key);
    return label === key ? name : label;
  };

  const toggleEvent = (name: string) =>
    setForm((f) =>
      f && { ...f, events: f.events.includes(name) ? f.events.filter((e) => e !== name) : [...f.events, name] }
    );

  const renderForm = () =>
    form && (
      <div className="mb-6 p-4 rounded-xl border border-gray-200">
        <div className="font-sans text-regular font-semibold mb-3">
          {form.id ? t('appWebhooks.editHeading') : t('appWebhooks.addHeading')}
        </div>
        <label className="block text-[13px] font-sans mb-1">{t('appWebhooks.urlLabel')}</label>
        <input
          type="url"
          value={form.url}
          maxLength={2048}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder={t('appWebhooks.urlPlaceholder')}
          className={cn(input, 'mb-3')}
        />
        <label className="block text-[13px] font-sans mb-1">{t('appWebhooks.descriptionLabel')}</label>
        <input
          type="text"
          value={form.description}
          maxLength={200}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={t('appWebhooks.descriptionPlaceholder')}
          className={cn(input, 'mb-3')}
        />
        <div className="text-[13px] font-sans mb-1">{t('appWebhooks.eventsLabel')}</div>
        <div className="mb-3">
          {eventNames.map((name) => (
            <label key={name} className="flex items-center gap-2 text-sm font-sans py-1">
              <input type="checkbox" checked={form.events.includes(name)} onChange={() => toggleEvent(name)} />
              <span>{eventLabel(name)}</span>
              <code className="text-gray-500 text-[12px]">{name}</code>
            </label>
          ))}
        </div>
        {formError && <div className="text-red-400 font-sans text-[12px] mb-3 break-words">{formError}</div>}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="hover:bg-brand-darker py-[8px] px-5 rounded-xl bg-brand-500 text-white disabled:opacity-50 text-sm"
          >
            {saving ? t('appWebhooks.saving') : form.id ? t('appWebhooks.saveButton') : t('appWebhooks.addButton')}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setForm(null);
              setFormError('');
            }}
            className="py-[8px] px-5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover text-sm"
          >
            {t('appWebhooks.cancelButton')}
          </button>
        </div>
      </div>
    );

  const renderItem = (hook: AppWebhook) => {
    const busy = busyId === hook.id;
    return (
      <div key={hook.id} className="py-4 border-b border-gray-200 last:border-b-0 px-2">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span
            className={cn(
              'text-[12px] font-sans px-2 py-[2px] rounded-full',
              hook.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            )}
          >
            {hook.enabled ? t('appWebhooks.statusEnabled') : t('appWebhooks.statusDisabled')}
          </span>
          <code className="font-mono text-sm break-all">{hook.url}</code>
        </div>
        {hook.description && <div className="text-sm font-sans mb-1">{hook.description}</div>}
        <div className={cn(body, 'text-[12px]')}>
          {hook.events.map(eventLabel).join(', ')}
          {' · '}
          {hook.lastDeliveryAt
            ? t('appWebhooks.lastDelivery').replace('{date}', formatDateTime(hook.lastDeliveryAt))
            : t('appWebhooks.neverDelivered')}
        </div>
        {hook.disabledReason && <div className="text-red-400 font-sans text-[12px]">{hook.disabledReason}</div>}
        {hook.lastError && (
          <div className="text-red-400 font-sans text-[12px] break-words">
            {t('appWebhooks.lastError').replace('{error}', hook.lastError)}
            {hook.consecutiveFailures > 0 &&
              ` · ${t('appWebhooks.failuresInRow').replace('{count}', String(hook.consecutiveFailures))}`}
          </div>
        )}

        {revealed?.id === hook.id && (
          <div className="mt-3 p-4 rounded-xl border border-brand-500">
            <div className="font-sans text-regular font-semibold mb-1">{t('appWebhooks.secretHeading')}</div>
            <div className="text-red-400 font-sans text-[12px] mb-3">{t('appWebhooks.secretWarning')}</div>
            <div className="flex items-center gap-2 mb-3">
              <code className="font-mono text-sm break-all">{revealed.secret}</code>
              <CopyButton value={revealed.secret} />
            </div>
            <button
              type="button"
              onClick={() => setRevealed(null)}
              className="py-[8px] px-5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover text-sm"
            >
              {t('appWebhooks.doneButton')}
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          <button type="button" disabled={busy} onClick={() => onTest(hook)} className={linkButton}>
            {t('appWebhooks.testButton')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setFormError('');
              setForm({ id: hook.id, url: hook.url, description: hook.description, events: hook.events });
            }}
            className={linkButton}
          >
            {t('appWebhooks.editButton')}
          </button>
          <button type="button" disabled={busy} onClick={() => onToggle(hook)} className={linkButton}>
            {hook.enabled ? t('appWebhooks.disableButton') : t('appWebhooks.enableButton')}
          </button>
          <button type="button" disabled={busy} onClick={() => setConfirm({ kind: 'rotate', hook })} className={linkButton}>
            {t('appWebhooks.rotateButton')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirm({ kind: 'delete', hook })}
            className="text-red-400 hover:underline disabled:opacity-50 text-sm"
          >
            {t('appWebhooks.deleteButton')}
          </button>
        </div>
      </div>
    );
  };

  const atLimit = (items?.length || 0) >= MAX_WEBHOOKS;

  return (
    <div className="overflow-y-auto">
      <div className={sectionTitle}>{t('appWebhooks.heading')}</div>
      <p className={cn(body, 'mb-2')}>{t('appWebhooks.intro')}</p>
      <p className={cn(body, 'mb-4 text-[12px]')}>{t('appWebhooks.signatureNote')}</p>

      <div className={card}>
        {form && !form.id && renderForm()}

        {items === null ? null : items.length === 0 && !form ? (
          <div className={cn(body, 'px-2 text-[12px] mb-4')}>{t('appWebhooks.noWebhooks')}</div>
        ) : (
          items.map((hook) => (
            <div key={hook.id}>{form?.id === hook.id ? renderForm() : renderItem(hook)}</div>
          ))
        )}

        {items !== null && !form && (
          <div className="px-2 mt-2">
            {atLimit ? (
              <div className={cn(body, 'text-[12px]')}>
                {t('appWebhooks.limitReached').replace('{max}', String(MAX_WEBHOOKS))}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setForm(emptyForm(eventNames));
                }}
                className="hover:bg-brand-darker py-[8px] px-5 rounded-xl bg-brand-500 text-white text-sm"
              >
                {t('appWebhooks.addButton')}
              </button>
            )}
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          title={confirm.kind === 'delete' ? t('appWebhooks.deleteTitle') : t('appWebhooks.rotateTitle')}
          message={
            <>
              <span className="font-semibold break-all">{confirm.hook.url}</span>
              <div className="mt-2">
                {confirm.kind === 'delete' ? t('appWebhooks.deleteMessage') : t('appWebhooks.rotateMessage')}
              </div>
            </>
          }
          confirmLabel={confirm.kind === 'delete' ? t('appWebhooks.deleteButton') : t('appWebhooks.rotateButton')}
          danger={confirm.kind === 'delete'}
          busy={busyId === confirm.hook.id}
          onConfirm={onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};
