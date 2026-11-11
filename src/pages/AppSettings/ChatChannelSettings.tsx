import { useEffect, useState } from 'react';
import { SubmitModal } from '../../components/modal/SubmitModal';
import { httpGetChatChannel, httpPutChatChannel, type ChatChannelPolicy } from '../../http';
import type { ModelAppDefaulRooom } from '../../models';
import { apiError } from '../../utils/apiError';

export function ChatChannelSettings({ appId, chat, onClose }: { appId: string; chat: ModelAppDefaulRooom; onClose: () => void }) {
  const [policy, setPolicy] = useState<ChatChannelPolicy | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    httpGetChatChannel(appId, chat.jid).then(({ data }) => {
      if (live) setPolicy(data);
    }).catch((e) => {
      if (live) setError(apiError(e, 'Could not load chat settings.').message);
    });
    return () => { live = false; };
  }, [appId, chat.jid]);

  return <SubmitModal onClose={saving ? () => {} : onClose}>
    <h2 className="text-xl font-semibold">Channel settings</h2>
    <p className="mb-4 mt-1 text-sm text-gray-600">{chat.title} · Keep this chat and its history. Choose who can post in it.</p>
    {!policy && !error && <p role="status">Loading chat settings…</p>}
    {policy && <form className="space-y-4" onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      setError('');
      try {
        await httpPutChatChannel(appId, chat.jid, policy);
        onClose();
      } catch (e) { setError(apiError(e, 'Could not save chat settings.').message); }
      finally { setSaving(false); }
    }}>
      <label className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
        <input type="checkbox" className="mt-1 accent-brand-500" checked={policy.readOnly} disabled={saving} onChange={(event) => setPolicy({ ...policy, readOnly: event.target.checked })} />
        <span><strong className="block text-sm">Only app admins can post</strong><span className="text-sm text-gray-600">Members can read announcements in this chat.</span></span>
      </label>
      {policy.readOnly && <fieldset className="space-y-2 pl-3" disabled={saving}>
        <legend className="mb-2 text-sm font-semibold">Member interactions</legend>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-500" checked={policy.commentsEnabled} onChange={(event) => setPolicy({ ...policy, commentsEnabled: event.target.checked })} /> Allow thread comments</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-500" checked={policy.reactionsEnabled} onChange={(event) => setPolicy({ ...policy, reactionsEnabled: event.target.checked })} /> Allow reactions</label>
      </fieldset>}
      <div className="flex justify-end gap-3">
        <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Cancel</button>
        <button disabled={saving} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save channel settings'}</button>
      </div>
    </form>}
    {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
  </SubmitModal>;
}
