import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { ChatComponentPanel } from '../../components/ChatComponent/ChatComponentPanel';
import { Loading } from '../../components/Loading';
import { useLicenseStatus } from '../../hooks/useLicenseStatus';
import { httpGetChatComponentConfig, httpSaveChatComponentConfig } from '../../http';
import { ChatConfigRecord, cleanChatConfig, sameChatConfig } from '../../lib/chatComponentConfig';
import { announceChatComponentConfigSaved, noteChatComponentConfigVersion } from '../../lib/chatComponentConfigSync';

interface Props {
  appId: string;
  brandColor?: string | null;
  // Inside another page's card: no own scroll area.
  inline?: boolean;
}

// The App's chat component config, saved on the server and applied to the web
// chat. Nothing saved means the chat keeps its defaults. A save reaches the
// App's open chats on its own (the server pushes it); this page also tells
// the other tabs of this browser, so the admin's own open chat updates at once.
export function ChatComponent({ appId, brandColor, inline = false }: Props) {
  const { status, refresh } = useLicenseStatus();
  const [config, setConfig] = useState<ChatConfigRecord>({});
  const [saved, setSaved] = useState<ChatConfigRecord>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedVersion = useRef<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    httpGetChatComponentConfig(appId)
      .then((resp) => {
        if (cancelled) return;
        const stored = resp?.data?.config || {};
        setConfig(stored);
        setSaved(stored);
        savedVersion.current = resp?.data?.version;
        noteChatComponentConfigVersion(appId, resp?.data?.version);
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load the chat component settings');
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [appId]);

  const handleChange = useCallback((updates: ChatConfigRecord) => {
    setConfig((prev) => cleanChatConfig({ ...prev, ...updates }));
  }, []);

  const save = async (next: ChatConfigRecord) => {
    setSaving(true);
    try {
      const resp = await httpSaveChatComponentConfig(appId, next);
      const stored = resp.data.config || {};
      setConfig(stored);
      setSaved(stored);
      const version = resp.data.version;
      // A save that changed nothing keeps the version: nobody needs to hear about it
      if (version && version !== savedVersion.current) {
        savedVersion.current = version;
        announceChatComponentConfigSaved({ appId, version });
      }
      toast.success('Saved. Open chats pick it up in a moment.');
    } catch (e: any) {
      const data = e?.response?.data;
      if (data?.code === 'LICENSE_FEATURE_REQUIRED') {
        toast.error('Your license does not include some of these options.');
        refresh();
      } else {
        toast.error(data?.error || 'Could not save the chat component settings');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <Loading />;

  return (
    <div className={inline ? undefined : 'overflow-y-auto h-full'}>
      <ChatComponentPanel
        config={config}
        onChange={handleChange}
        onSave={() => save(config)}
        onReset={() => setConfig({})}
        isDirty={!sameChatConfig(config, saved)}
        saving={saving}
        features={status?.features}
        brandColor={brandColor}
      />
    </div>
  );
}
