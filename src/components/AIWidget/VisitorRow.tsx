import { Button } from '@mui/material';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { WidgetConversationRow, flagFor, formatDate, formatVisitor } from './widgetConversations';

// One website visitor's conversation, shown the same way in Conversations and
// Users > Visitors: visitor (id, flag and country), device, website page
// (first, last), first seen, last active, and "View (n messages)". Wide
// screens get table cells; phones get a stacked row.

// Flags are emoji: name the colour emoji fonts first so the flag shows
// instead of the two letters where the text font has no glyph for it.
const EMOJI_FONT = '"Apple Color Emoji", "Noto Color Emoji", "Twemoji Mozilla", "Segoe UI Emoji", sans-serif';

function pageLabel(url?: string) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname === '/' ? '' : u.pathname}`;
  } catch {
    return url;
  }
}

function useCountryName() {
  const { locale } = useTranslation();
  return useMemo(() => {
    try {
      const names = new Intl.DisplayNames([locale || 'en'], { type: 'region' });
      return (cc: string) => (cc ? names.of(cc.toUpperCase()) || cc : '');
    } catch {
      return (cc: string) => cc;
    }
  }, [locale]);
}

function pages(row: WidgetConversationRow) {
  const m = row.visitor?.metadata;
  const first = m?.pageUrl || '';
  const last = m?.lastPageUrl && m.lastPageUrl !== first ? m.lastPageUrl : '';
  return { first, last };
}

function DeviceIcon({ type }: { type: string }) {
  const { t } = useTranslation();
  const v = (type || '').toLowerCase();
  if (v === 'mobile') return <PhoneIphoneOutlinedIcon fontSize="small" titleAccess={t('appUsers.deviceMobile')} />;
  if (v === 'tablet') return <TabletMacOutlinedIcon fontSize="small" titleAccess={t('appUsers.deviceTablet')} />;
  return <DesktopWindowsOutlinedIcon fontSize="small" titleAccess={t('appUsers.deviceDesktop')} />;
}

// "View (12 messages)"; "View" when the count is not known.
export function useViewLabel() {
  const { t, locale } = useTranslation();
  return (row: WidgetConversationRow) => {
    const n = row.messageCount;
    if (n == null) return t('aiWidgetConversations.view');
    return (n === 1 ? t('aiWidgetConversations.viewMessagesOne') : t('aiWidgetConversations.viewMessagesOther')).replace('{n}', n.toLocaleString(locale));
  };
}

export function ViewMessagesButton({ row, onClick }: { row: WidgetConversationRow; onClick: () => void }) {
  const label = useViewLabel();
  return (
    <Button size="small" variant="outlined" onClick={onClick} data-testid="view-messages" sx={{ whiteSpace: 'nowrap' }}>
      {label(row)}
    </Button>
  );
}

function Country({ row }: { row: WidgetConversationRow }) {
  const { t } = useTranslation();
  const countryName = useCountryName();
  const cc = row.visitor?.metadata?.country || '';
  if (!cc) return <span className="text-xs text-gray-500">{t('appUsers.unknownCountry')}</span>;
  return (
    <span className="block whitespace-nowrap text-xs text-gray-500" data-testid="visitor-country">
      <span aria-hidden="true" className="mr-1" style={{ fontFamily: EMOJI_FONT }}>{flagFor(cc)}</span>
      {countryName(cc)}
    </span>
  );
}

function PageLinks({ row }: { row: WidgetConversationRow }) {
  const { t } = useTranslation();
  const { first, last } = pages(row);
  return (
    <>
      {first ? (
        <a href={first} target="_blank" rel="noreferrer noopener" className="text-brand-500 hover:underline break-all" title={first}>
          {pageLabel(first)}
        </a>
      ) : (
        <span className="text-gray-400">{t('appUsers.unknownPage')}</span>
      )}
      {last && (
        <div className="text-xs text-gray-500 break-all" title={last}>
          {t('appUsers.lastPagePrefix')} {pageLabel(last)}
        </div>
      )}
    </>
  );
}

export function VisitorHeaderCells() {
  const { t } = useTranslation();
  return (
    <>
      <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColVisitor')}</th>
      <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColDevice')}</th>
      <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColWebsite')}</th>
      <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColFirstSeen')}</th>
      <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColLastActive')}</th>
    </>
  );
}

export function VisitorCells({ row }: { row: WidgetConversationRow }) {
  const m = row.visitor?.metadata;
  const browser = m ? [m.browser, m.browserVersion?.split('.')[0]].filter(Boolean).join(' ') : '';
  const os = m ? [m.os, m.osVersion].filter(Boolean).join(' ') : '';
  return (
    <>
      <td className="px-4 py-3">
        <div className="font-medium">{formatVisitor(row)}</div>
        <Country row={row} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-gray-700">
          <DeviceIcon type={m?.deviceType || ''} />
          <span>{[browser, os].filter(Boolean).join(' · ') || '-'}</span>
        </div>
      </td>
      <td className="px-4 py-3 max-w-[22rem]">
        <PageLinks row={row} />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.visitor?.firstSeenAt || row.createdAt)}</td>
      <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.updatedAt)}</td>
    </>
  );
}

// Phone width: flag and visitor, the page, last active and "View (n
// messages)", with the table's own controls (a checkbox, Delete) around it.
export function VisitorStackedRow({ row, onOpen, leading, trailing }: { row: WidgetConversationRow; onOpen: () => void; leading?: ReactNode; trailing?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-2 p-3" data-testid="visitor-stacked-row">
      {leading}
      <div className="min-w-0 flex-1">
        <div className="font-medium">{formatVisitor(row)}</div>
        <Country row={row} />
        <div className="mt-1 text-sm">
          <PageLinks row={row} />
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {t('appUsers.visitorColLastActive')}: {formatDate(row.updatedAt)}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ViewMessagesButton row={row} onClick={onOpen} />
          {trailing}
        </div>
      </div>
    </div>
  );
}
