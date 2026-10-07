import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { httpHardDeleteUsers, httpV2 } from '../../http';
import { useTranslation } from '../../i18n/useTranslation';
import { WidgetConversationDialog } from '../AIWidget/WidgetConversationDialog';
import {
  WidgetConversationRow,
  WidgetConversationsResponse,
  deleteWidgetConversation,
  flagFor,
  formatDate,
  formatVisitor,
} from '../AIWidget/widgetConversations';

const PAGE_SIZE = 20;

type ApiError = { response?: { data?: { error?: string } }; message?: string };
const errorText = (e: unknown) => (e as ApiError)?.response?.data?.error || (e as ApiError)?.message || '';

// Anonymous website visitors of an App: one per widget conversation, so the
// list comes from the widget conversations endpoint (same data and transcript
// as AI Widget > Conversations history), shown as people.
export function VisitorsTable({ appId, onTotalChange }: { appId: string; onTotalChange?: (n: number) => void }): ReactElement {
  const { t, locale } = useTranslation();
  const [rows, setRows] = useState<WidgetConversationRow[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<WidgetConversationRow | null>(null);
  const [toDelete, setToDelete] = useState<WidgetConversationRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const countryName = useMemo(() => {
    try {
      const names = new Intl.DisplayNames([locale || 'en'], { type: 'region' });
      return (cc: string) => (cc ? names.of(cc.toUpperCase()) || cc : '');
    } catch {
      return (cc: string) => cc;
    }
  }, [locale]);

  const load = useCallback(
    async (nextOffset: number) => {
      setLoading(true);
      try {
        const resp = await httpV2.get<WidgetConversationsResponse>(`/apps/${appId}/widget/conversations`, {
          params: { limit: PAGE_SIZE, offset: nextOffset },
        });
        const data = resp.data;
        const n = data?.total ?? data?.pagination?.total ?? 0;
        setRows(data?.results || []);
        setTotal(n);
        setOffset(nextOffset);
        onTotalChange?.(n);
      } catch (e) {
        toast.error(errorText(e) || t('appUsers.visitorsLoadFailed'));
      } finally {
        setLoading(false);
      }
    },
    [appId, onTotalChange, t]
  );

  useEffect(() => {
    void load(0);
  }, [load]);

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const r = await deleteWidgetConversation(appId, toDelete);
    if (r.ok && toDelete.visitor?._id) {
      try {
        await httpHardDeleteUsers(appId, [toDelete.visitor._id], 'visitor deleted from Users > Visitors');
      } catch (e) {
        r.ok = false;
        r.error = errorText(e);
      }
    }
    setDeleting(false);
    setToDelete(null);
    if (r.ok) toast.success(t('appUsers.visitorDeleted'));
    else toast.error(`${t('appUsers.visitorDeleteFailed')} ${r.error || ''}`.trim());
    const stay = rows.length > 1 || offset === 0;
    void load(stay ? offset : Math.max(0, offset - PAGE_SIZE));
  };

  const deviceIcon = (type: string) => {
    const v = (type || '').toLowerCase();
    if (v === 'mobile') return <PhoneIphoneOutlinedIcon fontSize="small" titleAccess={t('appUsers.deviceMobile')} />;
    if (v === 'tablet') return <TabletMacOutlinedIcon fontSize="small" titleAccess={t('appUsers.deviceTablet')} />;
    return <DesktopWindowsOutlinedIcon fontSize="small" titleAccess={t('appUsers.deviceDesktop')} />;
  };

  const pageLabel = (url?: string) => {
    if (!url) return '';
    try {
      const u = new URL(url);
      return `${u.host}${u.pathname === '/' ? '' : u.pathname}`;
    } catch {
      return url;
    }
  };

  if (!loading && rows.length === 0) {
    return (
      <div className="bg-brand-150 p-4 text-sm font-sans rounded-xl mb-4" data-testid="visitors-empty">
        {t('appUsers.visitorsEmpty')}
      </div>
    );
  }

  return (
    <div data-testid="visitors-table">
      <p className="font-sans text-xs text-gray-500 mb-3">{t('appUsers.visitorsIntro')}</p>
      <div className="overflow-x-auto mb-4">
        <table className="border-collapse w-full min-w-[900px] table-auto text-sm font-sans">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-700">
              <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColVisitor')}</th>
              <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColDevice')}</th>
              <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColWebsite')}</th>
              <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColFirstSeen')}</th>
              <th className="px-4 py-2 font-semibold">{t('appUsers.visitorColLastActive')}</th>
              <th className="px-4 py-2 font-semibold w-1"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const m = row.visitor?.metadata;
              const browser = m ? [m.browser, m.browserVersion?.split('.')[0]].filter(Boolean).join(' ') : '';
              const os = m ? [m.os, m.osVersion].filter(Boolean).join(' ') : '';
              const first = m?.pageUrl || '';
              const last = m?.lastPageUrl && m.lastPageUrl !== first ? m.lastPageUrl : '';
              return (
                <tr key={row._id} className="border-t border-gray-200 align-top">
                  <td className="px-4 py-3">
                    <div className="font-medium">{formatVisitor(row)}</div>
                    <div className="text-xs text-gray-500">
                      {m?.country ? `${flagFor(m.country)} ${countryName(m.country)}` : t('appUsers.unknownCountry')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      {deviceIcon(m?.deviceType || '')}
                      <span>{[browser, os].filter(Boolean).join(' · ') || '-'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[22rem]">
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
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.visitor?.firstSeenAt || row.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(row.updatedAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button size="small" variant="outlined" onClick={() => setOpen(row)}>
                        {t('appUsers.openConversation')}
                      </Button>
                      <Button size="small" color="error" onClick={() => setToDelete(row)}>
                        {t('appUsers.deleteVisitor')}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600 font-sans">
        <span>
          {total ? `${offset + 1}-${offset + rows.length} ${t('aiWidgetConversations.paginationOf')} ${total}` : ''}
        </span>
        <div className="flex items-center gap-2">
          {loading && <CircularProgress size={16} />}
          <Button size="small" disabled={loading || offset === 0} onClick={() => load(Math.max(0, offset - PAGE_SIZE))}>
            {t('aiWidgetConversations.previous')}
          </Button>
          <Button size="small" disabled={loading || offset + rows.length >= total} onClick={() => load(offset + PAGE_SIZE)}>
            {t('aiWidgetConversations.next')}
          </Button>
        </div>
      </div>

      <WidgetConversationDialog appId={appId} row={open} onClose={() => setOpen(null)} />

      <Dialog open={Boolean(toDelete)} onClose={() => !deleting && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('appUsers.deleteVisitorTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('appUsers.deleteVisitorBody')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)} disabled={deleting}>
            {t('aiWidgetConversations.cancel')}
          </Button>
          <Button onClick={remove} color="error" variant="contained" disabled={deleting}>
            {deleting ? t('aiWidgetConversations.deleting') : t('appUsers.deleteVisitor')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
