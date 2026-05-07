import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ReactElement, useCallback, useEffect, useState } from 'react';
// `httpV2` (not `httpV2App`) — the widget conversations endpoint uses the
// tenantActor auth flow on the server, which on the user-token path needs
// userId+appId claims that only the user JWT carries. The app-only JWT
// (`httpV2App`) lacks them and the middleware rejects with
// `TOKEN_MISSING_CLAIMS`.
import { httpV2 } from '../../http';

// Server response shape — matches the listWidgetConversationsService
// envelope. Kept minimal (no shared types module yet); when more views
// consume it we can promote into src/models.ts.
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
  } | null;
}

interface WidgetConversationsResponse {
  results: WidgetConversationRow[];
  pagination?: { limit: number; offset: number; total: number };
  total?: number;
  limit?: number;
  offset?: number;
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

export function WidgetConversationsPanel({
  appId,
  onTotalChange,
}: WidgetConversationsPanelProps): ReactElement | null {
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
        setError(e?.response?.data?.error || e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    },
    [appId, onTotalChange]
  );

  useEffect(() => {
    void fetchPage(0);
  }, [fetchPage]);

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

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold font-sans text-[16px] flex items-center gap-2">
          <ChatBubbleOutlineIcon fontSize="small" />
          Widget conversations
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {loading ? 'Loading…' : `${total} total`}
          </span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchPage(offset)}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

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
          <span className="text-sm">Couldn't load conversations: {error}</span>
        </Box>
      )}

      {!error && empty && (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 font-sans">
          No widget conversations yet. They appear here once visitors start
          chatting via the embedded widget.
        </div>
      )}

      {!error && rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm font-sans">
            <thead className="bg-gray-50 text-left text-gray-700">
              <tr>
                <th className="px-4 py-2 font-semibold">Visitor</th>
                <th className="px-4 py-2 font-semibold">Started</th>
                <th className="px-4 py-2 font-semibold">Last activity</th>
                <th className="px-4 py-2 font-semibold w-1"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-t border-gray-100">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {formatVisitor(row)}
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
                      Open
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
            {rows.length > 0 ? `${pageStart}–${pageEnd} of ${total}` : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="small"
              variant="outlined"
              onClick={() => fetchPage(Math.max(0, offset - PAGE_SIZE))}
              disabled={!hasPrev || loading}
            >
              Previous
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => fetchPage(offset + PAGE_SIZE)}
              disabled={!hasNext || loading}
            >
              Next
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
          Widget conversation
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
                <div className="text-xs uppercase text-gray-500 mb-1">Visitor</div>
                <div className="font-medium">{formatVisitor(selectedRow)}</div>
                {selectedRow.visitor && (
                  <div className="text-xs text-gray-500 mt-1 break-all">
                    {selectedRow.visitor.xmppUsername}
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 mb-1">Started</div>
                <div>{formatDate(selectedRow.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 mb-1">Last activity</div>
                <div>{formatDate(selectedRow.updatedAt)}</div>
              </div>
              <div>
                <div className="text-xs uppercase text-gray-500 mb-1">Room JID</div>
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
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'grey.300',
                  backgroundColor: 'grey.50',
                  color: 'grey.700',
                }}
              >
                <strong className="block mb-1">Message history viewer</strong>
                Inline message history for widget conversations is on the
                roadmap — it requires a backend reader that fetches from
                ejabberd's <code>mod_mam</code> archive for the room JID
                above. Until that lands, the room JID is the handle to use
                for any direct XMPP / archive inspection.
              </Box>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
