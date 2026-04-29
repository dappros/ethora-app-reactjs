import { Checkbox, Dialog, DialogPanel, Field, Label } from '@headlessui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IconAdd } from '../../components/Icons/IconAdd';
import { IconCheckbox } from '../../components/Icons/IconCheckbox';
import { ModelAppDefaulRooom } from '../../models';
import { IconClose } from '../../components/Icons/IconClose';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createAppChat, deleteDefaultRooms, getDefaultRooms, httpBroadcastChatsV2, httpGetBroadcastChatsJobV2 } from '../../http';
import { Loading } from '../../components/Loading';
import { IconDelete } from '../../components/Icons/IconDelete';
import { SubmitModal } from '../../components/modal/SubmitModal';
import { toast } from 'react-toastify';
import { IconMinus } from '../../components/Icons/IconMinus';
import { InviteAgentToChatModal } from '../../components/AIWidget/InviteAgentToChatModal';
import { httpListBotInstances, httpLeaveChatAgentBotInstance } from '../../http';
import { actionListAgents } from '../../actions';
import { useAppStore } from '../../store/useAppStore';
import { ModelAgent, ModelBotInstance } from '../../models';

interface Props {
  allowUsersToCreateRooms: boolean
  setAllowUsersToCreateRooms: (value: boolean) => void
  defaultChatRooms: Array<ModelAppDefaulRooom>,
  setDefaultChatRooms: (value: Array<ModelAppDefaulRooom>) => void,
  appId: string,
  domainName?: string,
  // Per-app default broadcast sender (Save Settings persists; per-broadcast
  // override below is a separate, session-only toggle).
  broadcastSenderName: string,
  setBroadcastSenderName: (value: string) => void,
  broadcastSenderPhotoUrl: string,
  setBroadcastSenderPhotoUrl: (value: string) => void,
}

interface Inputs {
  chatTitle: string;
  pinned: false;
}

export function Chats({
  allowUsersToCreateRooms,
  setAllowUsersToCreateRooms,
  defaultChatRooms,
  setDefaultChatRooms,
  appId,
  domainName,
  broadcastSenderName,
  setBroadcastSenderName,
  broadcastSenderPhotoUrl,
  setBroadcastSenderPhotoUrl,
}: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [allRowsSelected, setAllRowsSelected] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  // Phase 1 (Agents): modal for inviting an Agent into a specific chat row.
  const [inviteForChat, setInviteForChat] = useState<ModelAppDefaulRooom | null>(null);
  // Phase 1 (Agents): bot-instances + agents loaded for this app, used to render the
  // "bots in this room" inline list per chat row + the Remove buttons.
  // We fetch once per app and re-fetch after invite/leave so the row reflects reality.
  const [botInstances, setBotInstances] = useState<ModelBotInstance[]>([]);
  const agentsCache = useAppStore((s) => s.agents);
  const reloadBotInstances = async () => {
    if (!appId) return;
    try {
      const r = await httpListBotInstances({ appId });
      setBotInstances(r.data?.items || []);
    } catch (e) {
      // Silent: a transient failure here just means stale chips on the row,
      // not a user-actionable failure.
      console.warn('Failed to load bot instances for chats UI', e);
    }
  };
  useEffect(() => {
    if (!appId) return;
    reloadBotInstances();
    // Hydrate the agents cache so we can show display names + addresses for each bot
    // chip without an extra round trip per row.
    actionListAgents({ visibility: 'mine' }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  // Broadcast Message (async job)
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastMode, setBroadcastMode] = useState<'all' | 'selected'>('all');
  const [broadcastSelected, setBroadcastSelected] = useState<Record<string, boolean>>({});
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastJobId, setBroadcastJobId] = useState<string | null>(null);
  const [broadcastJob, setBroadcastJob] = useState<any>(null);
  const broadcastToastRef = useRef<{ completed: boolean; failed: boolean }>({ completed: false, failed: false });
  // Per-broadcast sender override. When unchecked we send the request without
  // a `sender` field and the API falls back to app.broadcastSender (configured
  // in the panel above), then to app.displayName. When checked, the inputs
  // below take precedence for THIS broadcast only and are not persisted.
  const [overrideSender, setOverrideSender] = useState(false);
  const [overrideSenderName, setOverrideSenderName] = useState('');
  const [overrideSenderPhotoUrl, setOverrideSenderPhotoUrl] = useState('');
  // Toggles isSystemMessage="true" on the wire so chat-component renders the
  // broadcast as a banner via SystemMessage instead of a regular chat bubble.
  // Default off (per product decision) so broadcasts look like a normal
  // message from the configured sender by default.
  const [broadcastIsSystem, setBroadcastIsSystem] = useState(false);

  const [rowsSelected, setRowsSelected] = useState(
    defaultChatRooms.map((_) => false)
  );

  const [someSelected, setSomeSelected] = useState(false);

  const {
    register,
    handleSubmit,
    reset
  } = useForm<Inputs>();

  const setSelect = (select: boolean, index: number) => {
    const newRowsSelected = rowsSelected.concat([]);
    newRowsSelected[index] = select;

    if (newRowsSelected.every((el) => el === true)) {
      setAllRowsSelected(true);
    } else {
      setAllRowsSelected(false);
    }

    if (newRowsSelected.some((el) => el === true)) {
      setSomeSelected(true);
    } else {
      setSomeSelected(false);
    }

    setRowsSelected(newRowsSelected);
  };

  const renderActionsForSelected = () => {
    let selectedIndexes = [];

    rowsSelected.forEach((el, index) => {
      if (el === true) {
        selectedIndexes.push(index);
      }
    });

    if (someSelected || allRowsSelected) {
      // 
      return (
        <div className="shadow px-[16px] py-[12px] flex gap-[16px] items-center justify-center z-50 transform -translate-x-1/2 bg-white rounded-xl fixed left-[50%] bottom-[30px]">
          <button
            className="text-brand-500 inline-flex font-varela text-base items-center justify-center"
            onClick={() => setShowDelete(true)}
          >
            <div className="mr-2">
              <IconDelete />
            </div>
            Delete
          </button>
        </div>
      );
    } else {
      return null;
    }
  };

  const onSelectAllRows = (selected: boolean) => {
    if (someSelected) {
      setAllRowsSelected(false);
      setRowsSelected(rowsSelected.map((_el) => false));
      setSomeSelected(false);
    } else {
      setAllRowsSelected(selected);
      setRowsSelected(rowsSelected.map((_el) => selected));
    }
  };

  const getSelectedIndexes = () => {
    let indexes: Array<number> = [];

    rowsSelected.forEach((el, index) => {
      if (el === true) {
        indexes.push(index);
      }
    });

    return indexes;
  };

  const onSubmit: SubmitHandler<Inputs> = async ({ chatTitle }) => {
    setShowLoading(true)
    try {
      await createAppChat(appId, chatTitle, true)
      const { data } = await getDefaultRooms(appId)
      setDefaultChatRooms(data)
      
      // Refresh app config to update defaultRooms in the store
      const { actionGetConfig } = await import('../../actions')
      await actionGetConfig(domainName)
      
      setShowLoading(false)
      reset()
      setShowCreate(false)
      toast.success('Chat created successfully')
    } catch (error: any) {
      setShowLoading(false)
      console.error('Failed to create chat:', error)
      toast.error(error?.response?.data?.error || 'Failed to create chat')
    }
  }

  const onDelete = async () => {
    let selectedRooms: Array<ModelAppDefaulRooom> = [];
    rowsSelected.forEach((el, index) => {
      if (el === true) {
        let item = defaultChatRooms[index];
        selectedRooms.push(item);
      }
    });
    setShowLoading(true)
    for (const room of selectedRooms) {
      await deleteDefaultRooms(appId, room.jid)
    }
    setSomeSelected(false)
    setAllRowsSelected(false)
    setShowLoading(false)
    setShowDelete(false)
    const { data } = await getDefaultRooms(appId)
    setDefaultChatRooms(data)
  }

  // Broadcast helpers
  const pinnedRooms = defaultChatRooms || [];

  const selectedPinnedRooms = useMemo(() => {
    return pinnedRooms.filter((r) => broadcastSelected[r.jid]);
  }, [pinnedRooms, broadcastSelected]);

  function getChatNameFromJid(jid: string) {
    const s = String(jid || '');
    return s.split('@')[0] || s;
  }

  useEffect(() => {
    // Keep broadcast selection keys stable when pinned rooms list changes.
    const next: Record<string, boolean> = {};
    for (const r of pinnedRooms) {
      next[r.jid] = Boolean(broadcastSelected[r.jid]);
    }
    setBroadcastSelected(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedRooms.length]);

  useEffect(() => {
    if (!broadcastJobId) return;
    let alive = true;
    broadcastToastRef.current = { completed: false, failed: false };
    let timerId: number | null = null;

    const tick = async () => {
      try {
        const { data } = await httpGetBroadcastChatsJobV2(broadcastJobId);
        if (!alive) return;
        setBroadcastJob(data);
        if (data?.state === 'completed' && !broadcastToastRef.current.completed) {
          broadcastToastRef.current.completed = true;
          const total = data?.result?.total ?? 0;
          const sent = (data?.result?.results || []).filter((r: any) => r.status === 'sent').length;
          toast.success(`Broadcast completed: sent ${sent}/${total}`);
          if (timerId) window.clearInterval(timerId);
          alive = false;
        }
        if (data?.state === 'failed' && !broadcastToastRef.current.failed) {
          broadcastToastRef.current.failed = true;
          toast.error(`Broadcast failed: ${data?.error || 'unknown error'}`);
          if (timerId) window.clearInterval(timerId);
          alive = false;
        }
      } catch (_e: any) {
        // Best-effort polling; avoid noisy errors in UI.
      }
    };

    tick();
    timerId = window.setInterval(() => {
      if (!alive) return;
      tick();
    }, 2000);

    return () => {
      alive = false;
      if (timerId) window.clearInterval(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastJobId]);

  const canSendBroadcast =
    Boolean(broadcastText.trim()) &&
    (broadcastMode === 'all' || selectedPinnedRooms.length > 0) &&
    !broadcastSending;

  const onSendBroadcast = async () => {
    if (!canSendBroadcast) return;
    setBroadcastSending(true);
    setBroadcastJob(null);
    setBroadcastJobId(null);
    try {
      const payload: any = {
        text: broadcastText.trim(),
        metadata: { source: 'admin_ui' },
      };
      if (broadcastMode === 'all') {
        payload.allRooms = true;
      } else {
        payload.chatNames = selectedPinnedRooms.map((r) => getChatNameFromJid(r.jid));
      }
      // Only send `sender` when the operator explicitly opted in to override
      // the per-app default. Empty inputs would otherwise silently overwrite
      // app.broadcastSender / app.displayName fallbacks on the server.
      if (overrideSender) {
        const overrideName = overrideSenderName.trim();
        const overridePhoto = overrideSenderPhotoUrl.trim();
        if (overrideName || overridePhoto) {
          payload.sender = {};
          if (overrideName) payload.sender.name = overrideName;
          if (overridePhoto) payload.sender.photoUrl = overridePhoto;
        }
      }
      if (broadcastIsSystem) {
        payload.isSystemMessage = true;
      }
      const { data } = await httpBroadcastChatsV2(payload);
      setBroadcastJobId(String(data.jobId));
      toast.info('Broadcast enqueued');
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to start broadcast');
    } finally {
      setBroadcastSending(false);
    }
  };

  return (
    <div className="overflow-hidden">
      <p className="font-semibold font-sans text-[16px] mb-2">New Chats</p>

      <Field className="flex items-center cursor-pointer mb-2">
        <Checkbox
          className="group mr-2 size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
          checked={allowUsersToCreateRooms}
          onChange={setAllowUsersToCreateRooms}
        >
          <IconCheckbox className="hidden group-data-[checked]:block" />
        </Checkbox>
        <Label className="cursor-pointer font-sans text-sm">
          Allow Users to create new Chats
        </Label>
      </Field>
      <p className="font-sans text-xs text-gray-500 mb-8">
        When enabled, your Users can create new Chats and invite other Users
        there. When disabled, only pre-existing Chats or Chats created by your
        business can be used.
      </p>
      <p className="font-semibold font-sans text-[16px] mb-2">Pinned Chats</p>
      <p className="font-sans text-xs text-gray-500 mb-4">
        Pinned or “starred” Chats are permanent chat rooms that your Users will
        automatically see and join.
      </p>
      <div className="p-4 border border-gray-200 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div className="font-sans font-semibold text-base">List of chats</div>
          <div>
            <button onClick={() => setShowCreate(true)} className="flex items-center justify-center md:w-[184px] h-[40px] w-[40px] bg-brand-500 rounded-xl text-white text-sm font-varela">
              <IconAdd color="white" className="md:mr-2" />
              <span className="hidden md:block">Add New Chat</span>
            </button>
          </div>
        </div>
        <div className="mx-2 overflow-auto">

          {!defaultChatRooms.length && (
            <div className="bg-[#F3F6FC] p-4 text-sm font-sans rounded-xl mb-4">
              There are no chats yet, or you can add them by clicking the 'Add New Chat'
              button
            </div>
          )}

          {!!defaultChatRooms.length && (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FCFCFC]">
                  <th className="pl-4 py-2 w-[32px] rounded-l-lg">
                    <Field className="flex items-center cursor-pointer">
                      <Checkbox
                        className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                        checked={(someSelected || allRowsSelected)}
                        onChange={onSelectAllRows}
                      >
                        {allRowsSelected && (
                          <IconCheckbox className="hidden group-data-[checked]:block" />
                        )}
                        {(someSelected && !allRowsSelected) && (
                          <IconMinus className="hidden group-data-[checked]:block" />
                        )}
                      </Checkbox>
                    </Field>
                  </th>
                  <th className="px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap">
                    Chat Name
                  </th>
                  <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                    Created By
                  </th>
                  {/* Phase 1 (Agents): per-row action to invite an Agent into the chat. */}
                  <th className="px-4 text-gray-500 font-normal font-inter text-xs text-center whitespace-nowrap">
                    Bots
                  </th>
                </tr>
              </thead>
              <tbody>
                {defaultChatRooms.map((el, index) => {
                  return (
                    <tr key={el.jid} className="hover:!bg-[#F5F7F9]">
                      <td className="pl-4 py-2 w-[32px] rounded-l-lg">
                        <Field className="flex items-center cursor-pointer">
                          <Checkbox
                            className="group size-4 rounded-[4px] border border-brand-500 data-[checked]:bg-brand-500 flex justify-center items-center"
                            checked={rowsSelected[index]}
                            onChange={(isSet) => setSelect(isSet, index)}
                          >
                            <IconCheckbox className="hidden group-data-[checked]:block" />
                          </Checkbox>
                        </Field>
                      </td>
                      <td className="px-4 py-[20px] font-sans font-normal text-sm  whitespace-nowrap">
                        {el.title}
                      </td>
                      <td className="px-4 font-sans font-normal text-sm text-center  whitespace-nowrap">
                        {el.creator}
                      </td>
                      <td className="px-4 font-sans font-normal text-sm text-left">
                        <RoomBotsCell
                          chatJid={el.jid}
                          botInstances={botInstances}
                          agents={agentsCache}
                          onInvite={() => setInviteForChat(el)}
                          onRemoved={reloadBotInstances}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot></tfoot>
            </table>
          )}


        </div>
      </div>

      {/* Default Broadcast Sender (per-app, persisted with Save Settings).
          Without this set, broadcasts render as "Deleted User" in chat-component
          because the system chat account JID is not in usersSet. The backend
          falls back to app.displayName when this is blank, so leaving it empty
          is fine for most apps. */}
      <div className="mt-8">
        <p className="font-semibold font-sans text-[16px] mb-2">Default Broadcast Sender</p>
        <p className="font-sans text-xs text-gray-500 mb-4">
          Identity stamped on broadcast announcements when no per-broadcast override is set. Leave blank to use the App display name as the sender.
        </p>
        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Sender name</label>
              <input
                type="text"
                value={broadcastSenderName}
                onChange={(e) => setBroadcastSenderName(e.target.value)}
                placeholder="e.g. Acme Health"
                maxLength={120}
                className="rounded-2xl bg-gray-100 py-3 px-6 w-full outline-none font-sans text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Avatar URL (optional)</label>
              <input
                type="url"
                value={broadcastSenderPhotoUrl}
                onChange={(e) => setBroadcastSenderPhotoUrl(e.target.value)}
                placeholder="https://cdn.example.com/logo.png"
                maxLength={2048}
                className="rounded-2xl bg-gray-100 py-3 px-6 w-full outline-none font-sans text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast */}
      <div className="mt-8">
        <p className="font-semibold font-sans text-[16px] mb-2">Broadcast Message</p>
        <p className="font-sans text-xs text-gray-500 mb-4">
          Send an announcement to your chats. You can broadcast to all chats, or choose a subset from your pinned rooms list.
        </p>

        <div className="p-4 border border-gray-200 rounded-xl">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-4 md:items-center">
              <label className="inline-flex items-center gap-2 font-sans text-sm cursor-pointer">
                <input
                  type="radio"
                  name="broadcast-mode"
                  checked={broadcastMode === 'all'}
                  onChange={() => setBroadcastMode('all')}
                />
                All chats (recommended)
              </label>
              <label className="inline-flex items-center gap-2 font-sans text-sm cursor-pointer">
                <input
                  type="radio"
                  name="broadcast-mode"
                  checked={broadcastMode === 'selected'}
                  onChange={() => setBroadcastMode('selected')}
                />
                Selected pinned chats
              </label>
            </div>

            {broadcastMode === 'selected' && (
              <div className="bg-[#F3F6FC] p-4 rounded-xl">
                {!pinnedRooms.length && (
                  <div className="font-sans text-sm text-gray-700">
                    No pinned rooms found. Add pinned chats above or switch to “All chats”.
                  </div>
                )}
                {!!pinnedRooms.length && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {pinnedRooms.map((r) => (
                      <label key={r.jid} className="flex items-center gap-2 font-sans text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(broadcastSelected[r.jid])}
                          onChange={(e) => {
                            setBroadcastSelected((prev) => ({ ...prev, [r.jid]: e.target.checked }));
                          }}
                        />
                        <span className="truncate">{r.title}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Per-broadcast sender override (NOT persisted; just for this send).
                Default-off so the per-app "Default Broadcast Sender" + app
                fallback chain controls the rendering unless explicitly bypassed. */}
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 font-sans text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={overrideSender}
                  onChange={(e) => setOverrideSender(e.target.checked)}
                />
                Override sender for this broadcast
              </label>
              {overrideSender && (
                <div className="flex flex-col md:flex-row gap-3 pl-6">
                  <input
                    type="text"
                    value={overrideSenderName}
                    onChange={(e) => setOverrideSenderName(e.target.value)}
                    placeholder="Sender name (e.g. CEO Update)"
                    maxLength={120}
                    className="flex-1 rounded-2xl bg-gray-100 py-2 px-4 outline-none font-sans text-sm"
                  />
                  <input
                    type="url"
                    value={overrideSenderPhotoUrl}
                    onChange={(e) => setOverrideSenderPhotoUrl(e.target.value)}
                    placeholder="Avatar URL (optional)"
                    maxLength={2048}
                    className="flex-1 rounded-2xl bg-gray-100 py-2 px-4 outline-none font-sans text-sm"
                  />
                </div>
              )}
              <label className="inline-flex items-center gap-2 font-sans text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={broadcastIsSystem}
                  onChange={(e) => setBroadcastIsSystem(e.target.checked)}
                />
                Render as system announcement (banner)
              </label>
            </div>

            <textarea
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Type your broadcast message…"
              className="rounded-2xl bg-gray-100 py-3 px-6 w-full min-h-[96px] outline-none font-sans text-sm"
              maxLength={4000}
            />

            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="font-sans text-xs text-gray-500">
                {broadcastText.trim().length}/4000
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setBroadcastText('');
                    setBroadcastJobId(null);
                    setBroadcastJob(null);
                    setBroadcastSelected({});
                    setBroadcastMode('all');
                    setOverrideSender(false);
                    setOverrideSenderName('');
                    setOverrideSenderPhotoUrl('');
                    setBroadcastIsSystem(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-varela text-sm"
                  type="button"
                >
                  Clear
                </button>
                <button
                  onClick={onSendBroadcast}
                  disabled={!canSendBroadcast}
                  className="px-4 py-2 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-varela text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  {broadcastSending ? 'Sending…' : 'Send Broadcast'}
                </button>
              </div>
            </div>

            {broadcastJobId && (
              <div className="mt-2 bg-[#FCFCFC] border border-gray-200 rounded-xl p-4">
                <div className="font-sans text-sm font-semibold mb-1">Broadcast job</div>
                <div className="font-sans text-xs text-gray-600">
                  Job ID: <span className="font-mono">{broadcastJobId}</span>
                </div>
                <div className="font-sans text-xs text-gray-600 mt-1">
                  State: <span className="font-mono">{broadcastJob?.state || 'loading…'}</span>
                </div>
                {broadcastJob?.progress && typeof broadcastJob.progress === 'object' && (
                  <div className="font-sans text-xs text-gray-600 mt-1">
                    Progress: {broadcastJob.progress.processed}/{broadcastJob.progress.total}
                  </div>
                )}
                {broadcastJob?.state === 'completed' && (
                  <div className="font-sans text-xs text-gray-700 mt-2">
                    Completed. Sent:{' '}
                    {(broadcastJob?.result?.results || []).filter((r: any) => r.status === 'sent').length}/
                    {(broadcastJob?.result?.total ?? 0)}
                  </div>
                )}
                {broadcastJob?.state === 'completed' && Array.isArray(broadcastJob?.result?.results) && (
                  <div className="mt-3">
                    <div className="font-sans text-xs text-gray-600 mb-1">Details (first 20)</div>
                    <div className="max-h-[180px] overflow-auto border border-gray-200 rounded-lg bg-white">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-[#FCFCFC]">
                            <th className="px-3 py-2 text-gray-500 font-normal font-inter text-xs text-left">Room</th>
                            <th className="px-3 py-2 text-gray-500 font-normal font-inter text-xs text-left">Status</th>
                            <th className="px-3 py-2 text-gray-500 font-normal font-inter text-xs text-left">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(broadcastJob.result.results || []).slice(0, 20).map((r: any) => (
                            <tr key={`${r.chatName}-${r.status}`} className="border-t border-gray-100">
                              <td className="px-3 py-2 font-sans text-xs">{r.chatName}</td>
                              <td className="px-3 py-2 font-mono text-xs">{r.status}</td>
                              <td className="px-3 py-2 font-sans text-xs text-gray-600">{r.error || ''}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {broadcastJob?.state === 'failed' && (
                  <div className="font-sans text-xs text-red-700 mt-2">
                    Failed: {broadcastJob?.error || 'unknown error'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {renderActionsForSelected()}
      {showLoading && (<Loading />)}
      {showCreate && (
        <Dialog
          className="fixed inset-x-0 inset-y-0 z-50 flex justify-center items-center bg-black/50 transition duration-300 ease-out data-[closed]:opacity-0"
          open={showCreate}
          transition
          onClose={() => { }}
        >
          <DialogPanel className="p-4 sm:p-8 bg-white rounded-3xl w-full max-w-[640px] m-8 relative">
            <button
              className="absolute top-[15px] right-[15px] "
              onClick={() => setShowCreate(false)}
            >
              <IconClose />
            </button>
            <div className="font-varela text-[18px] md:text-[24px] text-center md:mb-8 mb-[24px]">
              Create New Chat for your App Users
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                type="text"
                placeholder="Chat Title"
                {...register('chatTitle', { required: true })}
                className="rounded-2xl bg-gray-100 py-3 px-6 w-full mb-[24px] md:mb-8 outline-none"
              />
              <div className="flex flex-col md:flex-row gap-[16px] md:gap-8 items-start">
                <button
                  className="w-full rounded-xl border py-[12px] border-brand-500 text-brand-500 hover:bg-brand-hover"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button className="w-full py-[12px] rounded-xl bg-brand-500 text-white hover:bg-brand-darker">
                  Continue
                </button>
              </div>
            </form>
          </DialogPanel>
        </Dialog>
      )}
      {showDelete && (
        <SubmitModal onClose={() => setShowDelete(false)}>
          <div className="font-varela text-[24px] text-center mb-8">Delete App Room</div>
          <p className="font-sans text-[14px] mb-8 text-center">
            {`Are you sure you want to delete ${getSelectedIndexes().length} ${getSelectedIndexes().length > 1 ? 'rooms' : 'room'}?`}
          </p>
          <div className="flex gap-8">
            <button
              onClick={() => setShowDelete(false)}
              className="w-full hover:bg-brand-hover rounded-xl border py-[12px] border-brand-500 text-brand-500"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete()}
              className="w-full py-[12px] rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              Submit
            </button>
          </div>
        </SubmitModal>
      )}
      {/* Phase 1 (Agents): Add-Bot-to-chat modal. Lists this user's Agents and accepts a
          paste-in agent address (so an unlisted public agent can be invited by someone
          who only knows the address). */}
      {inviteForChat && (
        <InviteAgentToChatModal
          appId={appId}
          chat={inviteForChat}
          onClose={() => {
            setInviteForChat(null);
            // Refresh chips so a freshly-invited bot appears in the row immediately.
            reloadBotInstances();
          }}
        />
      )}
    </div>
  );
}

// Inline chip list of bots currently in a chat row + an "+ Add Bot" button at the end.
// Each chip has an x-remove that calls /v2/agents/:id/bot-instances/:biId/leave-chat,
// which sends "X has left" into the room, drops MUC presence, and unaffiliates the bot
// user from the room - so it can't slip back in on reconnect.
const RoomBotsCell: React.FC<{
  chatJid: string;
  botInstances: ModelBotInstance[];
  agents: ModelAgent[];
  onInvite: () => void;
  onRemoved: () => void;
}> = ({ chatJid, botInstances, agents, onInvite, onRemoved }) => {
  // Filter to bots whose joinedRooms contains this chat. We do the filter client-side
  // so the parent fetches once for the whole app instead of once per row.
  const inThisRoom = useMemo(
    () => botInstances.filter((bi) => Array.isArray(bi.joinedRooms) && bi.joinedRooms.includes(chatJid)),
    [botInstances, chatJid]
  );
  const agentByid = useMemo(() => {
    const m = new Map<string, ModelAgent>();
    agents.forEach((a) => m.set(a.id, a));
    return m;
  }, [agents]);

  return (
    <div className="flex items-center gap-1 flex-wrap justify-end">
      {inThisRoom.map((bi) => {
        const ag = agentByid.get(bi.agentId);
        const label = ag?.displayName || bi.xmppUsername.split('_').slice(1).join('_') || 'AI Bot';
        return (
          <span
            key={bi.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-700 border"
            title={`${label}${ag?.address ? ' · ' + ag.address : ''} · BotInstance ${bi.id}`}
          >
            <span className="truncate max-w-[140px]">{label}</span>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (!ag) {
                  toast.error('Cannot remove: agent metadata missing');
                  return;
                }
                if (!confirm(`Remove "${label}" from this chat? The bot stays running and can be re-invited later.`)) return;
                try {
                  await httpLeaveChatAgentBotInstance(ag.id, bi.id, chatJid);
                  toast.success(`${label} removed from chat`);
                  onRemoved();
                } catch (err: any) {
                  toast.error(`Remove failed: ${err?.response?.data?.error || err.message}`);
                }
              }}
              className="text-gray-400 hover:text-red-600"
              aria-label={`Remove ${label} from chat`}
            >
              ×
            </button>
          </span>
        );
      })}
      <button
        onClick={onInvite}
        className="text-brand-500 hover:underline text-xs ml-1 whitespace-nowrap"
        title="Invite an AI agent into this chat"
      >
        + Add Bot
      </button>
    </div>
  );
};
