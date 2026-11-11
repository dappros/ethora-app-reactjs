import { useState } from 'react';
import { Link } from 'react-router-dom';
import { env } from '../../config/env';
import { actionUpdateApp } from '../../actions';
import type { ModelApp } from '../../models';

type CommunicationOptions = {
  callsEnabled: boolean;
  scheduledCallsEnabled: boolean;
  autoCreateAssistantChat: boolean;
};

const saveClass = 'rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50';

function useSave(appId: string) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const save = async (values: CommunicationOptions) => {
    setSaving(true);
    setMessage('');
    setError(false);
    try {
      await actionUpdateApp(appId, values);
      setMessage('Saved');
    } catch {
      setMessage('Could not save. Try again.');
      setError(true);
    } finally {
      setSaving(false);
    }
  };
  return { save, saving, message, error };
}

export function CommunicationSettings({ app }: { app: ModelApp }) {
  const initial: CommunicationOptions = {
    callsEnabled: app.callsEnabled !== false,
    scheduledCallsEnabled: app.scheduledCallsEnabled !== false,
    autoCreateAssistantChat: app.autoCreateAssistantChat === true,
  };
  const [value, setValue] = useState(initial);
  const { save, saving, message, error } = useSave(app._id);
  const dirty = Object.keys(initial).some((key) => initial[key as keyof CommunicationOptions] !== value[key as keyof CommunicationOptions]);
  const callsAvailable = env.VITE_VIDEO_CALLS_ENABLED === 'true';
  const fields = [
    { key: 'callsEnabled', title: 'Voice and video calls', hint: 'Let members start calls in chats.' },
    { key: 'scheduledCallsEnabled', title: 'Schedule meetings', hint: 'Let members pick a time and send a meeting invitation.' },
    { key: 'autoCreateAssistantChat', title: 'Private chat with the app assistant', hint: 'Automatically add a private conversation with the connected assistant to each member’s chat list.' },
  ] as const;
  return <section className="mb-6 space-y-4 rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
    <h2 className="text-lg font-semibold">Calls and assistant chat</h2>
    {!callsAvailable && <p className="rounded-lg bg-gray-100 p-3 text-sm text-gray-700">Calls are unavailable on this server. Private assistant chats can still be enabled.</p>}
    {fields.map(({ key, title, hint }) => <label key={key} className="flex items-start justify-between gap-4 border-b border-gray-200 pb-3">
      <span><span className="block font-medium">{title}</span><span className="mt-1 block text-sm text-gray-600">{hint}</span></span>
      <span className="mt-1 inline-flex shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only"
          checked={value[key] && (key === 'autoCreateAssistantChat' || callsAvailable) && (key !== 'scheduledCallsEnabled' || value.callsEnabled)}
          disabled={saving || (key !== 'autoCreateAssistantChat' && !callsAvailable) || (key === 'scheduledCallsEnabled' && !value.callsEnabled)}
          onChange={(event) => setValue({ ...value, [key]: event.target.checked })} />
        <span aria-hidden="true" className="relative h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand-500 peer-checked:after:translate-x-5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 peer-disabled:opacity-50" />
      </span>
    </label>)}
    {value.autoCreateAssistantChat && <Link className="block text-sm text-brand-500 underline" to={`/app/admin/apps/${app._id}/assistant`}>Choose the app’s assistant</Link>}
    <div className="flex flex-wrap items-center gap-3">
      <button className={saveClass} type="button" disabled={!dirty || saving} onClick={() => void save(value)}>Save communication settings</button>
      {message && <span role={error ? 'alert' : 'status'} className="text-sm text-gray-700">{message}</span>}
    </div>
  </section>;
}
