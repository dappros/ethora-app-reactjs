// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Phase 1 (Agents): Add Agent to chat modal. Used from the Chats admin tab "Bots" column.
// Three input modes:
//   1. pick from this user's Agents (most common)
//   2. pick from public Agents list
//   3. paste a known address (works for unlisted/public agents)

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { actionInviteAgentToChat, actionListAgents } from '../../actions';
import { ModelAgent, ModelAppDefaulRooom } from '../../models';

interface Props {
  appId: string;
  chat: ModelAppDefaulRooom;
  onClose: () => void;
}

export const InviteAgentToChatModal: React.FC<Props> = ({ appId, chat, onClose }) => {
  const [mine, setMine] = useState<ModelAgent[]>([]);
  const [publicAgents, setPublicAgents] = useState<ModelAgent[]>([]);
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<'mine' | 'public' | 'address'>('mine');

  useEffect(() => {
    actionListAgents({ visibility: 'mine' }).then((items) => setMine(items)).catch(() => {});
    actionListAgents({ visibility: 'public' }).then((items) => setPublicAgents(items)).catch(() => {});
  }, []);

  async function invite(idOrAddress: string) {
    setBusy(true);
    try {
      await actionInviteAgentToChat(idOrAddress, { appId, chatId: chat.chatId });
      toast.success(`Invited to ${chat.title}`);
      onClose();
    } catch (e: any) {
      toast.error(`Failed: ${e?.response?.data?.error || e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[520px] max-w-[95%] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add bot to "{chat.title}"</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black">&times;</button>
        </div>
        <div className="flex gap-2 border-b">
          {(['mine', 'public', 'address'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                'px-3 py-2 text-sm border-b-2 ' +
                (tab === t ? 'border-brand-500 text-brand-500 font-semibold' : 'border-transparent text-gray-500')
              }
            >
              {t === 'mine' ? 'My agents' : t === 'public' ? 'Public agents' : 'Paste address'}
            </button>
          ))}
        </div>

        {tab === 'mine' && (
          <div className="max-h-[320px] overflow-auto">
            {mine.length === 0 && <div className="text-gray-500 text-sm">You have no agents yet. Create one in the AI Bots tab.</div>}
            {mine.map((a) => (
              <button
                key={a.id}
                disabled={busy}
                onClick={() => invite(a.id)}
                className="w-full flex items-center gap-2 border rounded p-2 mb-2 text-left hover:bg-gray-50"
              >
                {a.avatarUrl ? (
                  <img src={a.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                    {a.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{a.displayName}</div>
                  <div className="text-[10px] text-gray-500 truncate">{a.address}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'public' && (
          <div className="max-h-[320px] overflow-auto">
            {publicAgents.length === 0 && <div className="text-gray-500 text-sm">No public agents available on this server.</div>}
            {publicAgents.map((a) => (
              <button
                key={a.id}
                disabled={busy}
                onClick={() => invite(a.id)}
                className="w-full flex items-center gap-2 border rounded p-2 mb-2 text-left hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{a.displayName}</div>
                  <div className="text-xs text-gray-500 truncate">{a.bio}</div>
                  <div className="text-[10px] text-gray-400 truncate">{a.address}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'address' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Paste an Agent address (EOA-style). The agent owner must have set the agent to public or unlisted, otherwise the invite is rejected.
            </p>
            <input
              className="border rounded px-2 py-2 w-full font-mono text-sm"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button
              disabled={busy || !address}
              onClick={() => invite(address)}
              className="bg-brand-500 hover:bg-brand-400 text-white rounded px-4 py-2 disabled:opacity-50"
            >
              Invite
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
