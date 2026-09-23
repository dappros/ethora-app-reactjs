// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CopyButton } from '../../components/CopyButton';
import { Loading } from '../../components/Loading';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import {
  httpCreateUserApiKey,
  httpListUserApiKeys,
  httpListUserOauthGrants,
  httpRevokeUserApiKey,
  httpRevokeUserOauthGrant,
  UserApiKey,
  UserApiKeyCreated,
  UserOauthGrant,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { EmailVerification } from './EmailVerification';

import { env } from '../../config/env';
// Public MCP endpoint, e.g. https://mcp.chat.example.com/mcp. Blank when the
// deployment does not run the hosted MCP server; the page then hides the
// connection snippets but still manages API keys.
const MCP_URL = (env.VITE_MCP_PUBLIC_URL || '').trim().replace(/\/+$/, '');
// Base without the trailing /mcp so the personal URL can be built as
// <base>/mcp/k/<key> (same scheme the MCP server accepts as a bearer).
const MCP_BASE = MCP_URL.replace(/\/mcp$/, '');

const TTL_OPTIONS = [30, 90, 365] as const;

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

function personalUrl(token: string) {
  return `${MCP_BASE}/mcp/k/${token}`;
}

function cursorSnippet(token: string) {
  return JSON.stringify(
    {
      mcpServers: {
        ethora: {
          url: MCP_URL,
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    },
    null,
    2
  );
}

interface SnippetProps {
  label: string;
  value: string;
  hint?: string;
  multiline?: boolean;
}

function Snippet({ label, value, hint, multiline }: SnippetProps) {
  return (
    <div className="mb-4">
      <div className="font-sans text-regular font-semibold mb-1">{label}</div>
      {hint && (
        <div className="text-gray-500 font-sans text-[12px] mb-2">{hint}</div>
      )}
      <div className="flex items-start gap-2 bg-gray-100 rounded-xl px-[12px] py-[12px]">
        {multiline ? (
          <pre className="flex-1 min-w-0 overflow-x-auto text-[12px] font-mono whitespace-pre">
            {value}
          </pre>
        ) : (
          <div className="flex-1 min-w-0 overflow-x-auto text-[13px] font-mono whitespace-nowrap">
            {value}
          </div>
        )}
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export function AiAssistants() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<UserApiKey[]>([]);
  const [grants, setGrants] = useState<UserOauthGrant[] | null>(null);
  const [name, setName] = useState('');
  const [ttlDays, setTtlDays] = useState<number>(90);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<UserApiKeyCreated | null>(null);
  const [revokeKey, setRevokeKey] = useState<UserApiKey | null>(null);
  const [revokeGrant, setRevokeGrant] = useState<UserOauthGrant | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpListUserApiKeys();
      setKeys(res.data?.data?.items || []);
    } catch {
      toast.error(t('userSettingsAi.toastError'));
    } finally {
      setLoading(false);
    }
    // OAuth grants are optional: the endpoint 404s on deployments without the
    // OAuth server, in which case the whole section stays hidden.
    try {
      const res = await httpListUserOauthGrants();
      setGrants(res.data?.data?.items || []);
    } catch {
      setGrants(null);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    setCreating(true);
    try {
      const res = await httpCreateUserApiKey({
        name: name.trim() || undefined,
        ttlDays,
      });
      setCreated(res.data?.data || null);
      setName('');
      toast.success(t('userSettingsAi.toastCreated'));
      await load();
    } catch {
      toast.error(t('userSettingsAi.toastError'));
    } finally {
      setCreating(false);
    }
  };

  const onRevokeKey = async () => {
    if (!revokeKey) return;
    setBusy(true);
    try {
      await httpRevokeUserApiKey(revokeKey.id);
      toast.success(t('userSettingsAi.toastRevoked'));
      if (created && created.id === revokeKey.id) setCreated(null);
      await load();
    } catch {
      toast.error(t('userSettingsAi.toastError'));
    } finally {
      setBusy(false);
      setRevokeKey(null);
    }
  };

  const onRevokeGrant = async () => {
    if (!revokeGrant) return;
    setBusy(true);
    try {
      await httpRevokeUserOauthGrant(revokeGrant.id);
      toast.success(t('userSettingsAi.toastDisconnected'));
      await load();
    } catch {
      toast.error(t('userSettingsAi.toastError'));
    } finally {
      setBusy(false);
      setRevokeGrant(null);
    }
  };

  return (
    <div className="md:ml-4 pb-8">
      <p className="font-sans text-regular font-semibold mb-2">
        {t('userSettingsAi.heading')}
      </p>
      <div className="text-gray-500 font-sans text-[12px] mb-4">
        {t('userSettingsAi.intro')}
      </div>

      {/* Quiet, opt-in only: connecting ChatGPT needs a verified address, so
          the state belongs on this tab. It renders nothing when the backend
          does not report one. */}
      <EmailVerification />

      {MCP_URL ? (
        <Snippet label={t('userSettingsAi.endpointLabel')} value={MCP_URL} />
      ) : (
        <div className="mb-6 text-[12px] font-sans bg-gray-100 rounded-xl px-[12px] py-[12px]">
          {t('userSettingsAi.mcpDisabled')}
        </div>
      )}

      {created && (
        <div className="mb-8 rounded-2xl border border-brand-500 p-4">
          <div className="font-sans text-regular font-semibold mb-1">
            {t('userSettingsAi.newKeyHeading')}
          </div>
          <div className="text-red-500 font-sans text-[12px] mb-4">
            {t('userSettingsAi.newKeyWarning')}
          </div>
          <Snippet label={t('userSettingsAi.keyLabel')} value={created.token} />
          {MCP_URL && (
            <>
              <Snippet
                label={t('userSettingsAi.personalUrlLabel')}
                value={personalUrl(created.token)}
                hint={t('userSettingsAi.personalUrlHint')}
              />
              <Snippet
                label={t('userSettingsAi.claudeCodeLabel')}
                value={`claude mcp add --transport http ethora ${personalUrl(created.token)}`}
              />
              <Snippet
                label={t('userSettingsAi.cursorLabel')}
                value={cursorSnippet(created.token)}
                multiline
              />
            </>
          )}
          <button
            type="button"
            onClick={() => setCreated(null)}
            className="py-[10px] px-6 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover"
          >
            {t('userSettingsAi.doneButton')}
          </button>
        </div>
      )}

      <p className="font-sans text-regular font-semibold mb-1">
        {t('userSettingsAi.keysHeading')}
      </p>
      <div className="text-gray-500 font-sans text-[12px] mb-3">
        {t('userSettingsAi.keysDescription')}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4 max-w-[640px]">
        <input
          type="text"
          value={name}
          maxLength={64}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('userSettingsAi.namePlaceholder')}
          className="flex-1 bg-gray-100 rounded-xl px-[12px] py-[12px] placeholder:text-gray-500 outline-none"
        />
        <label className="flex items-center gap-2 text-[13px] font-sans">
          <span className="whitespace-nowrap">{t('userSettingsAi.ttlLabel')}</span>
          <select
            value={ttlDays}
            onChange={(e) => setTtlDays(Number(e.target.value))}
            className="bg-gray-100 rounded-xl px-[12px] py-[12px] outline-none"
          >
            {TTL_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {t(`userSettingsAi.ttl${d}`)}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={creating}
          onClick={onCreate}
          className="hover:bg-brand-darker py-[12px] px-6 rounded-xl bg-brand-500 text-white disabled:opacity-50 whitespace-nowrap"
        >
          {creating ? t('userSettingsAi.creating') : t('userSettingsAi.createButton')}
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="text-gray-500 font-sans text-[12px] mb-8">
          {t('userSettingsAi.noKeys')}
        </div>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-[13px] font-sans">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colName')}</th>
                <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colCreated')}</th>
                <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colExpires')}</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t border-gray-200">
                  <td className="py-2 pr-4 break-all">{k.name || '-'}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatDate(k.createdAt)}</td>
                  <td className="py-2 pr-4 whitespace-nowrap">{formatDate(k.expiresAt)}</td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setRevokeKey(k)}
                      className="text-red-400 hover:underline"
                    >
                      {t('userSettingsAi.revokeButton')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {grants !== null && (
        <>
          <p className="font-sans text-regular font-semibold mb-1">
            {t('userSettingsAi.grantsHeading')}
          </p>
          <div className="text-gray-500 font-sans text-[12px] mb-3">
            {t('userSettingsAi.grantsDescription')}
          </div>
          {grants.length === 0 ? (
            <div className="text-gray-500 font-sans text-[12px]">
              {t('userSettingsAi.noGrants')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] font-sans">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colApp')}</th>
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colScope')}</th>
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colCreated')}</th>
                    <th className="py-2 pr-4 font-normal">{t('userSettingsAi.colExpires')}</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {grants.map((g) => (
                    <tr key={g.id} className="border-t border-gray-200">
                      <td className="py-2 pr-4 break-all">{g.clientName || '-'}</td>
                      <td className="py-2 pr-4">{g.scope || '-'}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{formatDate(g.createdAt)}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{formatDate(g.expiresAt)}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => setRevokeGrant(g)}
                          className="text-red-400 hover:underline"
                        >
                          {t('userSettingsAi.disconnectButton')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {revokeKey && (
        <ConfirmModal
          title={t('userSettingsAi.revokeTitle')}
          message={
            <>
              <span className="font-semibold">{revokeKey.name || revokeKey.id}</span>
              <div className="mt-2">{t('userSettingsAi.revokeMessage')}</div>
            </>
          }
          confirmLabel={t('userSettingsAi.revokeConfirm')}
          danger
          busy={busy}
          onConfirm={onRevokeKey}
          onCancel={() => setRevokeKey(null)}
        />
      )}
      {revokeGrant && (
        <ConfirmModal
          title={t('userSettingsAi.disconnectTitle')}
          message={
            <>
              <span className="font-semibold">{revokeGrant.clientName || revokeGrant.id}</span>
              <div className="mt-2">{t('userSettingsAi.disconnectMessage')}</div>
            </>
          }
          confirmLabel={t('userSettingsAi.disconnectButton')}
          danger
          busy={busy}
          onConfirm={onRevokeGrant}
          onCancel={() => setRevokeGrant(null)}
        />
      )}
      {loading && <Loading />}
    </div>
  );
}
