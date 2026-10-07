import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useTranslation } from '../../i18n/useTranslation';
import { httpV2 } from '../../http';
import {
  ChatMessageRow,
  ChatMessagesResponse,
  WidgetConversationRow,
  formatDate,
  formatVisitor,
} from './widgetConversations';

// One widget conversation: visitor, times, room and the transcript. Used by
// Conversations history (AI Widget tab) and Users > Visitors.
export function WidgetConversationDialog({
  appId,
  row: selectedRow,
  onClose,
}: {
  appId: string;
  row: WidgetConversationRow | null;
  onClose: () => void;
}): ReactElement {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [mamUnavailable, setMamUnavailable] = useState<boolean>(false);

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
      <Dialog
        open={Boolean(selectedRow)}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pr: 6 }}>
          {t('aiWidgetConversations.dialogTitle')}
          <IconButton
            aria-label="close"
            onClick={onClose}
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
                      '.dark &': { color: 'warning.light' },
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
                      '.dark &': { color: 'error.light' },
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

  );
}
