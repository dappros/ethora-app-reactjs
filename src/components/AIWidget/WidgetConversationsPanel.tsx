import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
// `httpV2` (not `httpV2App`) — the widget conversations endpoint uses the
// tenantActor auth flow on the server, which on the user-token path needs
// userId+appId claims that only the user JWT carries. The app-only JWT
// (`httpV2App`) lacks them and the middleware rejects with
// `TOKEN_MISSING_CLAIMS`.
import { httpV2 } from '../../http';
import { downloadCsv } from '../../utils/csv';

// Server response shape — matches the listWidgetConversationsService
// envelope. Kept minimal (no shared types module yet); when more views
// consume it we can promote into src/models.ts.
interface VisitorMetadata {
  userAgent: string;
  ip: string;
  country: string; // ISO-3166-1 alpha-2
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: string;
  capturedAt: string | null;
}

interface WidgetConversationRow {
  _id: string;
  name: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  visitor: {
    _id: string;
    uuid: string;
    xmppUsername: string;
    firstSeenAt: string;
    // null when the visitor row predates the metadata-capture rollout.
    metadata?: VisitorMetadata | null;
  } | null;
}

interface WidgetConversationsResponse {
  results: WidgetConversationRow[];
  pagination?: { limit: number; offset: number; total: number };
  total?: number;
  limit?: number;
  offset?: number;
}

// Single message row from GET /v2/apps/:appId/chats/:chatId/messages.
interface ChatMessageRow {
  id: string;
  originId: string | null;
  ts: number; // ms since epoch
  from: string; // bare JID of sender
  nick: string;
  body: string;
}

interface ChatMessagesResponse {
  results: ChatMessageRow[];
  total: number;
  nextBefore: number | null;
  chat: { _id: string; name: string; type: string };
  mamUnavailable: boolean;
}

interface WidgetConversationsPanelProps {
  appId: string;
  // Tells the parent how many conversations exist so the slim "Conversations:
  // N" readout in the header strip stays in sync with what the panel shows.
  // Called whenever a fresh list is fetched.
  onTotalChange?: (total: number) => void;
}

const PAGE_SIZE = 20;

function formatDate(value?: string): string {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  } catch {
    return value;
  }
}

// Visitor display: prefer the uuid suffix (a short readable handle that
// stays stable per browser), falling back to the JID. Never show the full
// xmppUsername in the list — it's noisy and includes the appId prefix
// repeated everywhere.
function formatVisitor(row: WidgetConversationRow): string {
  if (!row.visitor) return 'unknown visitor';
  const uuid = row.visitor.uuid;
  if (uuid && uuid.length >= 8) return `Visitor #${uuid.slice(0, 8)}`;
  return row.visitor.xmppUsername || 'unknown visitor';
}

// Tiny ISO-3166 → flag emoji helper. Skips IP-localhost / private
// ranges (where country is empty) without trying to be clever — emoji
// flags are a nice visual cue but never the only signal.
function flagFor(country: string): string {
  if (!country || country.length !== 2) return '';
  const A = 0x1f1e6 - 'A'.charCodeAt(0);
  const cc = country.toUpperCase();
  return String.fromCodePoint(cc.charCodeAt(0) + A, cc.charCodeAt(1) + A);
}

// Rich tooltip body for the visitor row. Renders a small key/value
// table; missing fields are shown as `—` so the operator can tell
// "we don't know" apart from "we knew it was Chrome on macOS".
function VisitorMetadataPopover({
  row,
}: {
  row: WidgetConversationRow;
}) {
  const { t } = useTranslation();
  const m = row.visitor?.metadata;
  const def = (v?: string) => (v && v.length ? v : '—');
  const browserLabel = m
    ? [m.browser, m.browserVersion].filter(Boolean).join(' ')
    : '';
  const osLabel = m ? [m.os, m.osVersion].filter(Boolean).join(' ') : '';
  return (
    <div className="text-xs leading-relaxed">
      <div className="font-semibold mb-1">
        {formatVisitor(row)}
      </div>
      <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-x-2 gap-y-0.5">
        <div className="text-gray-300">{t('aiWidgetConversations.jidLabel')}</div>
        <div className="font-mono break-all">
          {row.visitor?.xmppUsername || '—'}
        </div>
        <div className="text-gray-300">{t('aiWidgetConversations.countryLabel')}</div>
        <div>
          {m?.country
            ? `${flagFor(m.country)} ${m.country}`.trim()
            : '—'}
        </div>
        <div className="text-gray-300">{t('aiWidgetConversations.browserLabel')}</div>
        <div>{def(browserLabel)}</div>
        <div className="text-gray-300">{t('aiWidgetConversations.osLabel')}</div>
        <div>{def(osLabel)}</div>
        <div className="text-gray-300">{t('aiWidgetConversations.deviceLabel')}</div>
        <div>{m?.deviceType ? m.deviceType : t('aiWidgetConversations.desktopDefault')}</div>
        {/* IP is captured (drives the country lookup) but not shown by
            default — visitor IP is sensitive and showing it routinely
            puts operators in a tricky data-protection posture. A future
            "enterprise" flag will gate its visibility for installs that
            have a specific contract permitting it. */}
        <div className="text-gray-300">{t('aiWidgetConversations.firstSeenLabel')}</div>
        <div>
          {row.visitor?.firstSeenAt
            ? new Date(row.visitor.firstSeenAt).toLocaleString()
            : '—'}
        </div>
      </div>
      {!m && (
        <div className="mt-2 text-[11px] italic text-gray-300">
          {t('aiWidgetConversations.metadataUnavailable')}
        </div>
      )}
    </div>
  );
}

export function WidgetConversationsPanel({
  appId,
  onTotalChange,
}: WidgetConversationsPanelProps): ReactElement | null {
  const { t } = useTranslation();
  const [rows, setRows] = useState<WidgetConversationRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Modal: the row currently being inspected. We surface conversation
  // metadata + the room JID; a full message-history view (chat-component
  // pointed at the room JID, authenticated as the operator's tenant-owner
  // gateway user) is a follow-up that needs a per-deploy reader endpoint.
  const [selectedRow, setSelectedRow] = useState<WidgetConversationRow | null>(
    null
  );
  // Messages for the open conversation. Reset on every open. Page size of
  // 100 is the same default the backend uses; we don't paginate further
  // for now since the modal is a quick-look UX, not a deep-archive
  // browser. Older history is reachable by re-opening with a `before`
  // cursor in a future iteration.
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [mamUnavailable, setMamUnavailable] = useState<boolean>(false);

  // Bulk-selection + delete state. `selected` holds chat _ids the
  // operator has ticked on the *current page*; we deliberately reset
  // selection on page change to avoid the "wait, did I just confirm
  // delete on rows I can't see?" trap. Selecting across pages is a
  // different feature (Select All Across Pages) we don't ship yet.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // CSV export progress. Walks N conversations sequentially fetching
  // messages — fast for tens, slow for thousands. The progress label
  // gives the operator a signal so they don't navigate away mid-export.
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (nextOffset: number) => {
      if (!appId) return;
      setLoading(true);
      setError(null);
      try {
        const resp = await httpV2.get<WidgetConversationsResponse>(
          `/apps/${appId}/widget/conversations`,
          { params: { limit: PAGE_SIZE, offset: nextOffset } }
        );
        const results = resp?.data?.results || [];
        const t =
          resp?.data?.pagination?.total ??
          resp?.data?.total ??
          results.length;
        setRows(results);
        setTotal(t);
        setOffset(nextOffset);
        if (onTotalChange) onTotalChange(t);
      } catch (e: any) {
        setError(
          e?.response?.data?.error ||
            e?.message ||
            t('aiWidgetConversations.loadFailedFallback')
        );
      } finally {
        setLoading(false);
      }
    },
    [appId, onTotalChange, t]
  );

  useEffect(() => {
    void fetchPage(0);
  }, [fetchPage]);

  // Reset selection on page change — see selected-state comment above.
  useEffect(() => {
    setSelected(new Set());
  }, [offset, rows]);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage(checked: boolean) {
    setSelected(checked ? new Set(rows.map((r) => r._id)) : new Set());
  }

  const allOnPageSelected =
    rows.length > 0 && rows.every((r) => selected.has(r._id));
  const someOnPageSelected =
    selected.size > 0 && !allOnPageSelected;

  // Per-row delete: clear MAM history first, then drop the chat row +
  // user2chats + destroy the MUC room via the existing chat-delete
  // endpoint. Order matters — destroying the MUC room first orphans
  // the MAM rows but they'd still show up on a clear-history call. We
  // swallow individual failures so a partial multi-delete still
  // reports useful aggregate state.
  async function deleteOne(row: WidgetConversationRow): Promise<{ ok: boolean; error?: string }> {
    try {
      await httpV2.delete(`/apps/${appId}/chats/${row._id}/messages`);
    } catch (e: any) {
      // mamUnavailable on the install isn't fatal — keep going so the
      // chat row still gets removed.
      const code = e?.response?.data?.code;
      if (code !== 'MAM_NOT_CONFIGURED') {
        return { ok: false, error: e?.response?.data?.error || e?.message || 'history clear failed' };
      }
    }
    try {
      await httpV2.delete(`/apps/${appId}/chats`, { data: { name: row.name } });
    } catch (e: any) {
      return { ok: false, error: e?.response?.data?.error || e?.message || 'chat delete failed' };
    }
    return { ok: true };
  }

  // Given a list of conversation rows, fetch their messages and emit a
  // single CSV. Rows: convoIndex, timestamp, conversationId, visitor,
  // sender (visitor|bot|system), nick, body.
  async function exportConversationsAsCsv(
    convos: WidgetConversationRow[],
    fileLabel: string
  ) {
    setExporting(true);
    setExportProgress(`0/${convos.length}`);
    const out: string[][] = [
      ['timestamp', 'conversation_id', 'visitor', 'sender', 'nick', 'body'],
    ];
    let done = 0;
    for (const row of convos) {
      try {
        const resp = await httpV2.get<ChatMessagesResponse>(
          `/apps/${appId}/chats/${row._id}/messages`,
          { params: { limit: 500 } }
        );
        const visitorJid = row.visitor?.xmppUsername || '';
        for (const m of resp?.data?.results || []) {
          const isVisitor =
            visitorJid &&
            (m.from === visitorJid ||
              m.from.startsWith(`${visitorJid}@`) ||
              m.nick === visitorJid);
          const sender = isVisitor ? 'visitor' : 'bot';
          out.push([
            new Date(m.ts).toISOString(),
            row._id,
            formatVisitor(row),
            sender,
            m.nick || '',
            m.body || '',
          ]);
        }
      } catch (e) {
        // Per-conversation failure is non-fatal — log a sentinel row so
        // the operator can see what's missing rather than silently
        // skipping it.
        out.push([
          new Date().toISOString(),
          row._id,
          formatVisitor(row),
          'error',
          '',
          `[fetch failed: ${(e as any)?.message || e}]`,
        ]);
      }
      done++;
      setExportProgress(`${done}/${convos.length}`);
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    downloadCsv(`widget-conversations-${fileLabel}-${stamp}.csv`, out);
    setExporting(false);
    setExportProgress(null);
  }

  async function exportSelected() {
    const targets = rows.filter((r) => selected.has(r._id));
    if (!targets.length) return;
    await exportConversationsAsCsv(targets, `selected-${targets.length}`);
  }

  // Walk the full paginated list (all pages, ignoring the current
  // viewport offset) and export every conversation. Bounded by the
  // server-side total — operators with very large datasets should
  // export in batches via Select-All-on-page.
  async function exportAll() {
    setExporting(true);
    setExportProgress(t('aiWidgetConversations.fetchingList'));
    const all: WidgetConversationRow[] = [];
    try {
      for (let off = 0; off < total; off += PAGE_SIZE) {
        const r = await httpV2.get<WidgetConversationsResponse>(
          `/apps/${appId}/widget/conversations`,
          { params: { limit: PAGE_SIZE, offset: off } }
        );
        all.push(...(r?.data?.results || []));
      }
    } catch (e: any) {
      setExporting(false);
      setExportProgress(null);
      setDeleteError(
        `${t('aiWidgetConversations.exportFailedPrefix')} ${e?.message || e}`
      );
      return;
    }
    await exportConversationsAsCsv(all, `all-${all.length}`);
  }

  async function runBulkDelete() {
    setDeleting(true);
    setDeleteError(null);
    const targets = rows.filter((r) => selected.has(r._id));
    let okCount = 0;
    const errors: string[] = [];
    for (const row of targets) {
      const r = await deleteOne(row);
      if (r.ok) okCount++;
      else errors.push(`${formatVisitor(row)}: ${r.error}`);
    }
    setDeleting(false);
    setConfirmOpen(false);
    setSelected(new Set());
    if (errors.length) {
      setDeleteError(`${okCount}/${targets.length} deleted. ${errors.length} failed: ${errors.slice(0, 3).join('; ')}`);
    }
    // Re-fetch the current page so the deleted rows disappear and total
    // updates. If the current page becomes empty after deletion we
    // shift back one page so the operator isn't stranded on a blank
    // pagination state.
    const stillHasRowsOnPage = rows.length - okCount > 0 || offset === 0;
    void fetchPage(stillHasRowsOnPage ? offset : Math.max(0, offset - PAGE_SIZE));
  }

  const pageStart = offset + (rows.length ? 1 : 0);
  const pageEnd = offset + rows.length;
  const hasPrev = offset > 0;
  const hasNext = offset + rows.length < total;

  const empty = !loading && !error && rows.length === 0;

  const handleCopy = useCallback((value: string) => {
    try {
      void navigator.clipboard?.writeText(value);
    } catch {
      // ignore — user can select the text manually as a fallback
    }
  }, []);

  // Fetch a fresh page of messages whenever a conversation is opened.
  // AbortController so re-opening a different row mid-flight doesn't
  // race the previous fetch into the new modal.
  useEffect(() => {
    if (!selectedRow) {
      setMessages([]);
      setMessagesError(null);
      setMamUnavailable(false);
      return;
    }
    const ac = new AbortController();
    setMessagesLoading(true);
    setMessagesError(null);
    setMamUnavailable(false);
    httpV2
      .get<ChatMessagesResponse>(
        `/apps/${appId}/chats/${selectedRow._id}/messages`,
        { params: { limit: 100 }, signal: ac.signal }
      )
      .then((resp) => {
        const data = resp?.data;
        setMessages(data?.results || []);
        setMamUnavailable(Boolean(data?.mamUnavailable));
      })
      .catch((e: any) => {
        if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
        setMessagesError(
          e?.response?.data?.error ||
            e?.message ||
            t('aiWidgetConversations.loadMessagesFailedFallback')
        );
      })
      .finally(() => setMessagesLoading(false));
    return () => ac.abort();
  }, [appId, selectedRow, t]);

  // Heuristic: visitors have JID prefix `${appId}_widget-`, the bot is the
  // App's `${appId}_${aiBot.userId}-bot`. We don't know the exact bot
  // userId here, so anything not visitor-shaped is rendered as the bot
  // side. For widget rooms there are exactly two participants so this
  // is unambiguous; for non-widget rooms (when this modal gets reused
  // beyond Widget Conversations) we'd want a richer attribution model.
  function isVisitorMessage(row: ChatMessageRow): boolean {
    if (!selectedRow?.visitor) return false;
    const visJid = selectedRow.visitor.xmppUsername;
    return (
      row.from === visJid ||
      row.from.startsWith(`${visJid}@`) ||
      row.nick === visJid
    );
  }

  function formatTs(ms: number): string {
    if (!ms) return '';
    try {
      return new Date(ms).toLocaleString();
    } catch {
      return String(ms);
    }
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold font-sans text-[16px] flex items-center gap-2">
          <ChatBubbleOutlineIcon fontSize="small" />
          {t('aiWidgetConversations.heading')}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {loading ? t('aiWidgetConversations.loading') : `${total} ${t('aiWidgetConversations.totalSuffix')}`}
          </span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportAll}
            disabled={loading || exporting || total === 0}
            title={t('aiWidgetConversations.exportAllTitle')}
          >
            {t('aiWidgetConversations.exportAll')}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchPage(offset)}
            disabled={loading}
          >
            {t('aiWidgetConversations.refresh')}
          </Button>
        </div>
      </div>
      {exportProgress && (
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
          <CircularProgress size={14} />
          <span>{t('aiWidgetConversations.exportingCsvPrefix')} {exportProgress}</span>
        </div>
      )}

      {error && (
        <Box
          role="alert"
          sx={{
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light',
            backgroundColor: 'error.lighter',
            color: 'error.dark',
          }}
        >
          <span className="text-sm">{t('aiWidgetConversations.loadErrorPrefix')} {error}</span>
        </Box>
      )}

      {!error && empty && (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 font-sans">
          {t('aiWidgetConversations.emptyState')}
        </div>
      )}

      {!error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          {/* Bulk-action bar — appears as a sticky strip above the table
              once at least one row is ticked, so the operator doesn't
              lose track of selections while scrolling. Delete-selected
              opens a confirm modal; nothing destructive happens here. */}
          {selected.size > 0 && (
            <div className="flex items-center justify-between bg-red-50 border-b border-red-200 px-4 py-2 text-sm">
              <span className="text-red-700 font-medium">
                {selected.size} {t('aiWidgetConversations.selectedSuffix')}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={exportSelected}
                  disabled={deleting || exporting}
                >
                  {t('aiWidgetConversations.exportSelected')}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting || exporting}
                >
                  {t('aiWidgetConversations.deleteSelected')}
                </Button>
              </div>
            </div>
          )}
          {deleteError && (
            <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700">
              {deleteError}
            </div>
          )}
          <table className="min-w-full text-sm font-sans">
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr>
                <th className="px-2 py-2 font-semibold w-1">
                  <Checkbox
                    size="small"
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected}
                    onChange={(e) => toggleAllOnPage(e.target.checked)}
                    inputProps={{
                      'aria-label': t('aiWidgetConversations.selectAllOnPage'),
                    }}
                  />
                </th>
                <th className="px-4 py-2 font-semibold">{t('aiWidgetConversations.visitorHeader')}</th>
                <th className="px-4 py-2 font-semibold">{t('aiWidgetConversations.startedHeader')}</th>
                <th className="px-4 py-2 font-semibold">{t('aiWidgetConversations.lastActivityHeader')}</th>
                <th className="px-4 py-2 font-semibold w-1"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-gray-100">
                  <td className="px-2 py-2 w-1">
                    <Checkbox
                      size="small"
                      checked={selected.has(row._id)}
                      onChange={() => toggleOne(row._id)}
                      inputProps={{
                        'aria-label': `${t('aiWidgetConversations.selectConversationPrefix')} ${formatVisitor(row)}`,
                      }}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Tooltip
                      title={<VisitorMetadataPopover row={row} />}
                      arrow
                      placement="right"
                      enterDelay={150}
                      // Allow the operator to mouse over the popover
                      // body itself (e.g. to copy the IP) without it
                      // dismissing.
                      slotProps={{
                        tooltip: {
                          sx: {
                            maxWidth: 360,
                            bgcolor: 'rgba(17,24,39,0.95)',
                          },
                        },
                      }}
                    >
                      {/* Dotted underline = "this label has more
                          information on hover", standard convention. */}
                      <span
                        className="cursor-help"
                        style={{ borderBottom: '1px dotted rgba(0,0,0,0.3)' }}
                      >
                        {row.visitor?.metadata?.country && (
                          <span className="mr-1" aria-hidden="true">
                            {flagFor(row.visitor.metadata.country)}
                          </span>
                        )}
                        {formatVisitor(row)}
                      </span>
                    </Tooltip>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatDate(row.updatedAt)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <button
                      type="button"
                      className="text-brand-500 hover:underline"
                      onClick={() => setSelectedRow(row)}
                    >
                      {t('aiWidgetConversations.open')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && (rows.length > 0 || hasPrev || hasNext) && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">
            {rows.length > 0 ? `${pageStart}–${pageEnd} ${t('aiWidgetConversations.paginationOf')} ${total}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="outlined"
              onClick={() => fetchPage(Math.max(0, offset - PAGE_SIZE))}
              disabled={!hasPrev || loading}
            >
              {t('aiWidgetConversations.previous')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => fetchPage(offset + PAGE_SIZE)}
              disabled={!hasNext || loading}
            >
              {t('aiWidgetConversations.next')}
            </Button>
            {loading && <CircularProgress size={16} />}
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pr: 6 }}>
          {t('aiWidgetConversations.dialogTitle')}
          <IconButton
            aria-label="close"
            onClick={() => setSelectedRow(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <div className="font-sans text-sm space-y-3">
              <div>
                <div className="text-xs uppercase text-gray-500 mb-1">{t('aiWidgetConversations.visitorLabel')}</div>
                <div className="font-medium">{formatVisitor(selectedRow)}</div>
                {selectedRow.visitor && (
                  <div className="text-xs text-gray-500 mt-1 break-all">
                    {selectedRow.visitor.xmppUsername}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 mb-1">{t('aiWidgetConversations.startedLabel')}</div>
                <div>{formatDate(selectedRow.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 mb-1">{t('aiWidgetConversations.lastActivityLabel')}</div>
                <div>{formatDate(selectedRow.updatedAt)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 mb-1">{t('aiWidgetConversations.roomJidLabel')}</div>
                <div className="flex items-center gap-2">
                  <code className="break-all bg-gray-50 px-2 py-1 rounded text-xs">
                    {selectedRow.name}
                  </code>
                  <IconButton
                    size="small"
                    aria-label="copy room jid"
                    onClick={() => handleCopy(selectedRow.name)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 mb-1 flex items-center justify-between">
                  <span>{t('aiWidgetConversations.messagesLabel')}</span>
                  {messagesLoading && <CircularProgress size={12} />}
                </div>
                {mamUnavailable && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px dashed',
                      borderColor: 'warning.light',
                      backgroundColor: 'warning.lighter',
                      color: 'warning.dark',
                      fontSize: 12,
                    }}
                  >
                    {t('aiWidgetConversations.mamUnavailable')}
                  </Box>
                )}
                {messagesError && !mamUnavailable && (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'error.light',
                      backgroundColor: 'error.lighter',
                      color: 'error.dark',
                      fontSize: 12,
                    }}
                  >
                    {t('aiWidgetConversations.loadMessagesErrorPrefix')} {messagesError}
                  </Box>
                )}
                {!messagesLoading &&
                  !messagesError &&
                  !mamUnavailable &&
                  messages.length === 0 && (
                    <div className="text-xs text-gray-500 italic px-1">
                      {t('aiWidgetConversations.noMessagesYet')}
                    </div>
                  )}
                {messages.length > 0 && (
                  <div className="rounded-md border border-gray-200 bg-gray-50 max-h-[420px] overflow-y-auto p-2 space-y-2">
                    {messages.map((m) => {
                      const visitor = isVisitorMessage(m);
                      return (
                        <div
                          key={m.id}
                          className={
                            'flex ' +
                            (visitor ? 'justify-start' : 'justify-end')
                          }
                        >
                          <div
                            className={
                              'max-w-[78%] rounded-lg px-3 py-2 text-sm ' +
                              (visitor
                                ? 'bg-white border border-gray-200 text-gray-900'
                                : 'bg-brand-100 text-gray-900')
                            }
                          >
                            <div className="text-[10px] uppercase tracking-wide text-gray-500 mb-0.5">
                              {visitor ? t('aiWidgetConversations.visitorTag') : t('aiWidgetConversations.botTag')} · {formatTs(m.ts)}
                            </div>
                            <div className="whitespace-pre-wrap break-words">
                              {m.body || (
                                <em className="text-gray-400">{t('aiWidgetConversations.emptyBody')}</em>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk-delete confirmation. Two-phase to avoid accidental nuke
          when an operator hits Enter on a focused checkbox. The body
          is destructive (drops MAM rows + Mongo Chat row + destroys
          the MUC room) so we name what's about to disappear. */}
      <Dialog
        open={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {selected.size === 1
            ? t('aiWidgetConversations.confirmDeleteTitleOne').replace('{count}', String(selected.size))
            : t('aiWidgetConversations.confirmDeleteTitleOther').replace('{count}', String(selected.size))}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selected.size === 1
              ? t('aiWidgetConversations.confirmDeleteBodyOne')
              : t('aiWidgetConversations.confirmDeleteBodyOther')}
          </DialogContentText>
          {deleting && (
            <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
              <CircularProgress size={14} />
              <span>{t('aiWidgetConversations.deleting')}</span>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            {t('aiWidgetConversations.cancel')}
          </Button>
          <Button
            onClick={runBulkDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={<DeleteOutlineIcon />}
          >
            {t('aiWidgetConversations.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
