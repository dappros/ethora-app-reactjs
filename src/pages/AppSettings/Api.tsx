import cn from 'classnames';
import { CopyButton } from '../../components/CopyButton';
import { Secret } from '../../components/Secret';
import { useTranslation } from '../../i18n/useTranslation';
import { ModelApp } from '../../models';
import './Api.scss';

interface Props {
  app: ModelApp;
}

// Hosted MCP endpoint, e.g. https://mcp.chat.example.com/mcp. Blank on
// deployments without the hosted MCP server: the assistant section is hidden
// then (same rule as UserSettings/AiAssistants.tsx).
const MCP_URL = (import.meta.env.VITE_MCP_PUBLIC_URL || '')
  .trim()
  .replace(/\/+$/, '');
const MCP_OAUTH_URL = MCP_URL ? `${MCP_URL.replace(/\/mcp$/, '')}/mcp/oauth` : '';

const sectionTitle = 'font-semibold font-sans text-normal mb-2';
const body = 'text-gray-500 text-sm font-sans';
const card = 'p-4 border border-gray-200 rounded-xl mb-8';
const th =
  'px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap';

export const Api = ({ app }: Props) => {
  const { t } = useTranslation();

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
              <tr className="bg-[#FCFCFC]">
                <th className={cn(th, 'w-1/2 r-delimiter rounded-l-lg')}>
                  {t('appSettingsApi.keyColumn')}
                </th>
                <th className={cn(th, 'w-1/2 rounded-r-lg')}>
                  {t('appSettingsApi.secretColumn')}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={cn('hover:!bg-[#F5F7F9]')}>
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
              <tr className="bg-[#FCFCFC]">
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
                <tr key={row.kind} className="hover:!bg-[#F5F7F9]">
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
    </div>
  );
};
