import cn from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { CopyButton } from '../../components/CopyButton';
import { ConfirmModal } from '../../components/modal/ConfirmModal';
import { Secret } from '../../components/Secret';
import {
  AppServerToken,
  AppServerTokenCreated,
  httpCreateAppServerToken,
  httpListAppServerTokens,
  httpRevokeAppServerToken,
} from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelApp } from '../../models';
import './Api.scss';

import { env } from '../../config/env';
interface Props {
  app: ModelApp;
}

// Hosted MCP endpoint, e.g. https://mcp.chat.example.com/mcp. Blank on
// deployments without the hosted MCP server: the assistant section is hidden
// then (same rule as UserSettings/AiAssistants.tsx).
const MCP_URL = (env.VITE_MCP_PUBLIC_URL || '')
  .trim()
  .replace(/\/+$/, '');
const MCP_OAUTH_URL = MCP_URL ? `${MCP_URL.replace(/\/mcp$/, '')}/mcp/oauth` : '';

// Public v2 API base for the curl example (VITE_API_V2, falling back to the
// v1 base with the version swapped).
const API_V2 = (
  (env.VITE_API_V2 as string | undefined) ||
  ((env.VITE_API as string | undefined) || '').replace(/\/v1\/?$/, '/v2')
)
  .trim()
  .replace(/\/+$/, '');

const TTL_OPTIONS = [30, 90, 365] as const;

function formatDate(value?: string) {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
}

const sectionTitle = 'font-semibold font-sans text-normal mb-2';
const body = 'text-gray-500 text-sm font-sans';
const card = 'p-4 border border-gray-200 rounded-xl mb-8';
const th =
  'px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap';

export const Api = ({ app }: Props) => {
  const { t } = useTranslation();

  // Server (B2B) tokens. `tokens === null` means the backend has no
  // server-tokens endpoints (404) and the whole section stays hidden.
  const [tokens, setTokens] = useState<AppServerToken[] | null>(null);
  const [stName, setStName] = useState('');
  const [stTtl, setStTtl] = useState<number>(90);
  const [stCreating, setStCreating] = useState(false);
  const [stCreated, setStCreated] = useState<AppServerTokenCreated | null>(null);
  const [stRevoke, setStRevoke] = useState<AppServerToken | null>(null);
  const [stBusy, setStBusy] = useState(false);

  const loadTokens = useCallback(async () => {
    try {
      const res = await httpListAppServerTokens(app._id);
      setTokens(res.data?.data?.items || []);
    } catch {
      setTokens(null);
    }
  }, [app._id]);

  useEffect(() => {
    void loadTokens();
  }, [loadTokens]);

  const onCreateToken = async () => {
    setStCreating(true);
    try {
      const res = await httpCreateAppServerToken(app._id, {
        name: stName.trim() || undefined,
        ttlDays: stTtl,
      });
      setStCreated(res.data?.data || null);
      setStName('');
      toast.success(t('appSettingsApi.stToastCreated'));
      await loadTokens();
    } catch {
      toast.error(t('appSettingsApi.stToastError'));
    } finally {
      setStCreating(false);
    }
  };

  const onRevokeToken = async () => {
    if (!stRevoke) return;
    setStBusy(true);
    try {
      await httpRevokeAppServerToken(app._id, stRevoke.id);
      toast.success(t('appSettingsApi.stToastRevoked'));
      setStRevoke(null);
      if (stCreated?.id === stRevoke.id) setStCreated(null);
      await loadTokens();
    } catch {
      toast.error(t('appSettingsApi.stToastError'));
    } finally {
      setStBusy(false);
    }
  };

  const curlExample = (token: string) =>
    `curl -H "x-custom-token: ${token}" ${API_V2 || '<api-base>/v2'}/apps/${app._id}/chats`;

  const credentialRows = [
    {
      kind: t('appSettingsApi.credUserKind'),
      when: t('appSettingsApi.credUserWhen'),
      how: t('appSettingsApi.credUserHow'),
    },
    {
      kind: t('appSettingsApi.credAppKind'),
      when: t('appSettingsApi.credAppWhen'),
      how: t('appSettingsApi.credAppHow'),
    },
    {
      kind: t('appSettingsApi.credServerKind'),
      when: t('appSettingsApi.credServerWhen'),
      how: t('appSettingsApi.credServerHow'),
    },
  ];

  return (
    <div className="overflow-hidden">
      <div className={sectionTitle}>{t('appSettingsApi.heading')}</div>
      <p className={cn(body, 'mb-4')}>{t('appSettingsApi.description')}</p>

      <div className={card}>
        <div className="mx-2 hidden-scroll overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className={cn(th, 'w-1/2 r-delimiter rounded-l-lg')}>
                  {t('appSettingsApi.keyColumn')}
                </th>
                <th className={cn(th, 'w-1/2 rounded-r-lg')}>
                  {t('appSettingsApi.secretColumn')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={cn('hover:!bg-gray-100')}>
                <td className="r-delimiter px-4 py-[20px] font-sans font-normal text-sm rounded-l-lg">
                  <div className="flex justify-items-center">
                    <span className="mr-2">{app._id}</span>
                    <CopyButton value={app._id} />
                  </div>
                </td>
                <td className=" px-4 font-sans font-normal text-sm text-center rounded-r-lg whitespace-nowrap">
                  <div className="flex justify-items-center">
                    <Secret className="mr-2" value={app.appSecret} />
                    <CopyButton value={app.appSecret} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={cn(body, 'mt-4 mb-0 px-2')}>
          {t('appSettingsApi.rotateNote')}
        </p>
      </div>

      <div className={sectionTitle}>{t('appSettingsApi.credHeading')}</div>
      <p className={cn(body, 'mb-4')}>{t('appSettingsApi.credIntro')}</p>

      <div className={card}>
        <div className="mx-2 hidden-scroll overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className={cn(th, 'rounded-l-lg')}>
                  {t('appSettingsApi.credColKind')}
                </th>
                <th className={cn(th, 'whitespace-normal')}>
                  {t('appSettingsApi.credColWhen')}
                </th>
                <th className={cn(th, 'rounded-r-lg')}>
                  {t('appSettingsApi.credColHow')}
                </th>
              </tr>
            </thead>
            <tbody className="font-sans font-normal text-sm">
              {credentialRows.map((row) => (
                <tr key={row.kind} className="hover:!bg-gray-100">
                  <td className="px-4 py-3 align-top whitespace-nowrap">
                    {row.kind}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-600">
                    {row.when}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-600">
                    {row.how}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {tokens !== null && (
        <>
          <div className={sectionTitle}>{t('appSettingsApi.stHeading')}</div>
          <p className={cn(body, 'mb-4')}>{t('appSettingsApi.stIntro')}</p>

          <div className={card}>
            {stCreated && (
              <div className="mb-6 p-4 rounded-xl border border-brand-500">
                <div className="font-sans text-regular font-semibold mb-1">
                  {t('appSettingsApi.stCreatedHeading')}
                </div>
                <div className="text-red-400 font-sans text-[12px] mb-3">
                  {t('appSettingsApi.stCreatedWarning')}
                </div>
                <div className="flex items-center mb-3">
                  <Secret className="mr-2" value={stCreated.token} />
                  <CopyButton value={stCreated.token} />
                </div>
                <div className="text-gray-500 font-sans text-[12px] mb-1">
                  {t('appSettingsApi.stCurlLabel')}
                </div>
                <div className="flex items-start gap-2 bg-gray-100 rounded-xl px-[12px] py-[12px] mb-3">
                  <pre className="flex-1 min-w-0 overflow-x-auto text-[12px] font-mono whitespace-pre">
                    {curlExample(stCreated.token)}
                  </pre>
                  <CopyButton value={curlExample(stCreated.token)} />
                </div>
                <button
                  type="button"
                  onClick={() => setStCreated(null)}
                  className="py-[8px] px-5 rounded-xl border border-brand-500 text-brand-500 hover:bg-brand-hover text-sm"
                >
                  {t('appSettingsApi.stDoneButton')}
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 mb-4 px-2">
              <input
                type="text"
                value={stName}
                maxLength={64}
                onChange={(e) => setStName(e.target.value)}
                placeholder={t('appSettingsApi.stNamePlaceholder')}
                className="flex-1 bg-gray-100 rounded-xl px-[12px] py-[12px] placeholder:text-gray-500 outline-none text-sm"
              />
              <label className="flex items-center gap-2 text-[13px] font-sans">
                <span className="whitespace-nowrap">{t('appSettingsApi.stTtlLabel')}</span>
                <select
                  value={stTtl}
                  onChange={(e) => setStTtl(Number(e.target.value))}
                  className="bg-gray-100 rounded-xl px-[12px] py-[12px] outline-none"
                >
                  {TTL_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {t(`appSettingsApi.stTtl${d}`)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={stCreating}
                onClick={onCreateToken}
                className="hover:bg-brand-darker py-[12px] px-6 rounded-xl bg-brand-500 text-white disabled:opacity-50 whitespace-nowrap text-sm"
              >
                {stCreating
                  ? t('appSettingsApi.stCreating')
                  : t('appSettingsApi.stCreateButton')}
              </button>
            </div>

            {tokens.length === 0 ? (
              <div className={cn(body, 'px-2 text-[12px]')}>
                {t('appSettingsApi.stNoTokens')}
              </div>
            ) : (
              <div className="mx-2 hidden-scroll overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className={cn(th, 'rounded-l-lg')}>{t('appSettingsApi.stColName')}</th>
                      <th className={th}>{t('appSettingsApi.stColCreated')}</th>
                      <th className={th}>{t('appSettingsApi.stColExpires')}</th>
                      <th className={cn(th, 'rounded-r-lg')} />
                    </tr>
                  </thead>
                  <tbody className="font-sans font-normal text-sm">
                    {tokens.map((tk) => (
                      <tr key={tk.id} className="hover:!bg-gray-100">
                        <td className="px-4 py-3 break-all">{tk.name || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(tk.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(tk.expiresAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setStRevoke(tk)}
                            className="text-red-400 hover:underline"
                          >
                            {t('appSettingsApi.stRevokeButton')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {MCP_OAUTH_URL && (
        <>
          <div className={sectionTitle}>
            {t('appSettingsApi.assistantHeading')}
          </div>
          <p className={cn(body, 'mb-2')}>{t('appSettingsApi.assistantIntro')}</p>
          <div className={card}>
            <div className="flex items-center px-2">
              <code className="font-mono text-sm mr-2 break-all">
                {MCP_OAUTH_URL}
              </code>
              <CopyButton value={MCP_OAUTH_URL} />
            </div>
            <p className={cn(body, 'mt-4 mb-0 px-2')}>
              {t('appSettingsApi.assistantNote')}
            </p>
          </div>
        </>
      )}

      {stRevoke && (
        <ConfirmModal
          title={t('appSettingsApi.stRevokeTitle')}
          message={
            <>
              <span className="font-semibold">{stRevoke.name || stRevoke.id}</span>
              <div className="mt-2">{t('appSettingsApi.stRevokeMessage')}</div>
            </>
          }
          confirmLabel={t('appSettingsApi.stRevokeConfirm')}
          danger
          busy={stBusy}
          onConfirm={onRevokeToken}
          onCancel={() => setStRevoke(null)}
        />
      )}
    </div>
  );
};
