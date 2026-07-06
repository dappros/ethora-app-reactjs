import { Chat } from '@ethora/chat-component';
import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  actionLoadOwnedApps,
  actionRefreshOwnerSession,
  actionSwitchChatApp,
} from '../actions';
import { createChatConfig } from '../config/chatBootstrap';
import { useIsMobileView } from '../hooks/useIsMobileView';
import { useAppStore } from '../store/useAppStore';
import type { ModelApp, ModelCurrentUser, ModelOwnerSession } from '../models';

interface ChatComponentProps {
  // The app whose chat space is being rendered. For the legacy base-app
  // path this is the user's own currentApp; for owner-session mode this is
  // the app the admin selected via the switcher (looked up in the apps[]
  // list so we get the correct displayName / primaryColor / defaultRooms).
  config: ModelApp | null;
  // The base-app end user. Only used in legacy mode (no ownerSession).
  // When ownerSession is set, the chat-component binds the owner JID via
  // chatTokens.accessToken instead and ignores this.
  currentUser: ModelCurrentUser | null;
  ownerSession: ModelOwnerSession | null;
}

// Build a user-readable summary of an axios error from /v2/apps/:id/owner-session.
// The backend's 502 response shape is:
//   { error: "Failed to provision owner gateway",
//     code: "OWNER_PROVISION_FAILED",
//     details: { reason: "...", xmppResponse: { status, statusText, data, code } } }
// We collapse those into a single human-readable line for the toast.
function formatOwnerSessionError(e: unknown): string {
  const err = e as {
    response?: {
      data?: {
        error?: string;
        details?: {
          reason?: string;
          xmppResponse?: {
            status?: number | null;
            statusText?: string | null;
            code?: string | null;
            data?: unknown;
          } | null;
        };
      };
    };
    message?: string;
  };
  const headline = err?.response?.data?.error || err?.message || 'unknown error';
  const reason = err?.response?.data?.details?.reason;
  const xmpp = err?.response?.data?.details?.xmppResponse;
  let xmppExtra = '';
  if (xmpp && (xmpp.status || xmpp.code || xmpp.data)) {
    const dataMsg =
      xmpp.data && typeof xmpp.data === 'object'
        ? (xmpp.data as { message?: string; reason?: string }).message ||
          (xmpp.data as { message?: string; reason?: string }).reason ||
          ''
        : typeof xmpp.data === 'string'
          ? xmpp.data
          : '';
    const parts = [
      xmpp.status ? `HTTP ${xmpp.status}` : null,
      xmpp.statusText || null,
      xmpp.code || null,
      dataMsg || null,
    ].filter(Boolean);
    if (parts.length) xmppExtra = ` [ejabberd: ${parts.join(' / ')}]`;
  }
  return `${headline}${reason ? `: ${reason}` : ''}${xmppExtra}`;
}

const MemoizedChat = React.memo(function ChatComponent({
  config,
  currentUser,
  ownerSession,
}: ChatComponentProps) {
  // The override path packs the target app's appToken + a freshly-minted
  // owner JWT and a refreshFunction that re-mints it on expiry. We DON'T
  // touch localStorage / outer admin auth here, so the chat-component's
  // refreshes can never stomp on the admin's own session in this tab.
  // We also forward ownerSession itself so createChatConfig can build the
  // owner-shaped userLogin.user (preferred over jwtLogin on this deployment
  // because /v1/users/client expects type:'client' tokens we don't mint).
  // Reactive: recomputes chatConfig when the viewport crosses the mobile
  // breakpoint so room-list paddings update on resize, not just at load.
  const isMobileView = useIsMobileView();

  const ownerOverride = useMemo(() => {
    if (!ownerSession) return undefined;
    return {
      appToken: ownerSession.appToken,
      chatToken: ownerSession.chatTokens.accessToken,
      ownerSession,
      refreshFunction: async () => {
        try {
          const fresh = await actionRefreshOwnerSession();
          if (!fresh) return null;
          return {
            accessToken: fresh.chatTokens.accessToken,
            refreshToken: fresh.chatTokens.refreshToken,
          };
        } catch {
          return null;
        }
      },
    };
  }, [ownerSession]);

  const chatConfig = useMemo(
    () =>
      createChatConfig({
        app: config,
        chatToken: currentUser?.token || null,
        isMobileView,
        // Forwarding currentUser lets createChatConfig set userLogin from the
        // base-app User's xmpp creds when no owner override is active. This
        // is the load-bearing fix for the email-login path because the
        // upstream-only jwtLogin flow expects a type:'client' JWT from
        // /v1/users/client that loginWithEmail doesn't produce.
        currentUser,
        ownerOverride,
      }),
    [
      config,
      currentUser?.token,
      currentUser?.xmppUsername,
      currentUser?.xmppPassword,
      currentUser?._id,
      ownerOverride,
      isMobileView,
    ]
  );

  return <Chat config={chatConfig} />;
});

// Header App-switcher (Option A). For tenant admins with at least one
// owned app, render a dropdown that lets them pick which app's chat space
// is active in this tab. Two non-obvious decisions baked in here:
//
//   1. We always include "Base app (your account)" as the first option so
//      admins can revert to the default end-user experience without
//      clearing localStorage by hand.
//   2. Single-app admins still see a static label ("Acme Health") rather
//      than a degenerate one-item dropdown, because in that case the
//      switcher adds noise without choice.
function ChatAppSwitcher({
  apps,
  currentApp,
  chatAppId,
  onSwitch,
  switching,
}: {
  apps: Array<ModelApp>;
  currentApp: ModelApp | null;
  chatAppId: string | null;
  onSwitch: (appId: string | null) => void;
  switching: boolean;
}) {
  const ownedApps = apps; // server already filters to the admin's own apps
  // Visible label for the "no override" option - "(base app)" makes it
  // obvious to the admin that this is their account-level identity, not
  // a shadow gateway tied to any particular owned app.
  const baseLabel = currentApp ? `${currentApp.displayName} (base app)` : 'Base app';

  if (ownedApps.length === 0) {
    return null;
  }

  if (ownedApps.length === 1 && !chatAppId) {
    return (
      <div className="flex flex-col items-start text-sm font-sans">
        <span className="text-gray-500 text-xs">Testing chats in</span>
        <span className="font-medium">{baseLabel}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-sans">
      <label className="text-gray-500 text-xs whitespace-nowrap">Testing chats in</label>
      <select
        value={chatAppId || ''}
        disabled={switching}
        onChange={(e) => onSwitch(e.target.value || null)}
        className="rounded-xl border border-gray-300 px-3 py-2 bg-white outline-none disabled:opacity-50"
      >
        <option value="">{baseLabel}</option>
        {ownedApps.map((a) => (
          <option key={a._id} value={a._id}>
            {a.displayName}
          </option>
        ))}
      </select>
      {switching && <span className="text-xs text-gray-500">Switching…</span>}
    </div>
  );
}

export default function ChatPage() {
  const config = useAppStore((s) => s.currentApp);
  // Use the dedicated ownedApps slot, not the paginated `apps` slot. The
  // latter only holds whichever page of AdminApps the admin last viewed
  // (limit=10 by default), so reading it here would mean the dropdown
  // shows ~5 of N owned apps and changes content based on the AdminApps
  // page state. ownedApps is loaded with a high limit by
  // actionLoadOwnedApps below.
  const apps = useAppStore((s) => s.ownedApps);
  const isAdmin = useAppStore((s) => s.currentApp?.isAllowedNewAppCreate);
  const chatAppId = useAppStore((s) => s.chatAppId);
  const ownerSession = useAppStore((s) => s.ownerSession);
  const currentUser = useAppStore((s) => s.currentUser);

  const [switching, setSwitching] = useState(false);

  // Load the full owned-apps list once on mount, independent of the
  // paginated AdminApps view. Failures are non-fatal: the dropdown
  // simply won't render, which is the same behaviour as a fresh tenant
  // with no owned apps (and matches our existing zero-app guard in
  // ChatAppSwitcher). Errors are logged so the operator can debug.
  useEffect(() => {
    if (!isAdmin) return;
    actionLoadOwnedApps().catch((e: unknown) => {
      console.warn('[Chat] Failed to load owned apps for switcher:', e);
    });
  }, [isAdmin]);

  // Hydrate ownerSession on mount when chatAppId was restored from
  // localStorage. We don't persist the session itself (it contains
  // short-lived JWTs); a fresh /owner-session call on mount is cheap and
  // gives us a long-lived token in one round-trip.
  useEffect(() => {
    if (!chatAppId) return;
    if (ownerSession?.appId === chatAppId) return; // already hydrated

    let cancelled = false;
    setSwitching(true);
    actionSwitchChatApp(chatAppId)
      .catch((e: unknown) => {
        if (cancelled) return;
        // Most likely cause: the admin lost ACL on this app (it was
        // deleted, or ownership was transferred). Drop the persisted
        // chatAppId and fall back to the base-app user so the page still
        // renders something useful. Surface the underlying server reason
        // (details.reason + xmppResponse) into the toast so the operator
        // can see e.g. "xmpp registration failed (HTTP 401): unauthorized"
        // without digging through dev tools.
        console.warn('[Chat] Failed to hydrate owner session, reverting to base app:', e);
        toast.error(
          'Could not restore Chats context. Reverting to your base app. ' + formatOwnerSessionError(e)
        );
        actionSwitchChatApp(null).catch(() => {});
      })
      .finally(() => {
        if (!cancelled) setSwitching(false);
      });
    return () => {
      cancelled = true;
    };
    // chatAppId is the only input that should re-trigger; ownerSession's
    // own app-id check above covers the "already hydrated" case.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatAppId]);

  // Resolve which app the chat-component should believe it's in. In
  // owner-session mode this comes from `apps[chatAppId]`; otherwise we use
  // the admin's own currentApp.
  const effectiveApp: ModelApp | null = useMemo(() => {
    if (ownerSession && chatAppId) {
      return apps.find((a) => a._id === chatAppId) || null;
    }
    return config;
  }, [apps, chatAppId, config, ownerSession]);

  const allowedDomains =
    import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(',') || [];
  const currentDomain = window.location.hostname;

  const handleSwitch = async (nextAppId: string | null) => {
    setSwitching(true);
    try {
      await actionSwitchChatApp(nextAppId);
    } catch (e: unknown) {
      // Surface every diagnostic we have - top-level error, details.reason,
      // and xmppResponse (status + body from ejabberd's HTTP API) - so the
      // operator can pinpoint the failure without dev tools or grepping
      // API logs.
      toast.error('Failed to switch app: ' + formatOwnerSessionError(e));
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-0 md:gap-4 h-full abc">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Chats
        </div>
        {/* App Switcher: only meaningful for admins with owned apps. End
            users on a multi-tenant signup have no apps[] entries so the
            switcher hides itself entirely. */}
        {isAdmin && (
          <ChatAppSwitcher
            apps={apps}
            currentApp={config}
            chatAppId={chatAppId}
            onSwitch={handleSwitch}
            switching={switching}
          />
        )}
        {/* Context-aware admin nudge. Three variants:
            (1) Base app, no owned apps yet  -> invite to create one.
            (2) Base app, has owned apps     -> point at the switcher above.
            (3) Own-app context, no default rooms yet -> deep link to the
                Chats tab in that app's Settings.
            Variants 1 and 2 only render on the hosted-demo domains
            (allowedDomains); variant 3 is universally useful so we show it
            in enterprise installs too. */}
        {isAdmin && (() => {
          if (chatAppId) {
            // Variant 3: in a child-app context with no chats configured.
            // Read defaultRooms straight off the ownedApps list (not via
            // effectiveApp, which is gated on ownerSession landing -
            // during the switch transition that would briefly point at
            // the base app and we'd misjudge the chat count).
            const targetApp = apps.find((a) => a._id === chatAppId);
            if (!targetApp) return null; // owned-apps list still loading
            if ((targetApp.defaultRooms?.length || 0) > 0) return null;
            return (
              <div className="bg-yellow-100 px-4 py-2 text-sm border max-w-[640px]">
                You are within your own App context, but it seems there are
                no chats available yet. Go to{' '}
                <NavLink
                  to={`/app/admin/apps/${chatAppId}/settings?tab=Chats`}
                  className="text-brand-500 underline"
                >
                  App Settings &rarr; Chats
                </NavLink>{' '}
                to create Pinned Chats, invite AI bots etc.
              </div>
            );
          }
          if (!allowedDomains.includes(currentDomain)) return null;
          if (apps.length === 0) {
            // Variant 1: hosted demo, no owned apps yet.
            return (
              <div className="bg-yellow-100 px-4 py-2 text-sm border max-w-[640px]">
                You are testing the public chats in our demo base app.
                Explore as an end user or{' '}
                <NavLink to="/app/admin/apps" className="text-brand-500 underline">
                  create your own App
                </NavLink>{' '}
                where you will set up your own chats.
              </div>
            );
          }
          // Variant 2: hosted demo, has owned apps - point at the switcher.
          return (
            <div className="bg-yellow-100 px-4 py-2 text-sm border max-w-[640px]">
              You are testing the public chats in our demo base app. Use the
              drop-down selector above to switch to your own Apps and chats.
            </div>
          );
        })()}
        <div />
      </div>
      <div
        className="row-start-2 min-h-0 md:m-0 rounded-none md:rounded-2xl bg-white px-0 overflow-hidden pt-0 md:pt-4"
        style={{ color: '#141414' }}
      >
        {/* Keyed remount: when chatAppId changes we want a fresh XMPP
            socket and fresh chat-component state. React's reconciliation
            of MemoizedChat alone wouldn't recreate the underlying XMPP
            connection because the chat-component manages it imperatively
            in its own provider. The key forces a clean re-mount.

            Gated on ownerSession matching chatAppId for child apps -
            actionSwitchChatApp sets chatAppId optimistically (so a
            refresh mid-flight lands on the right context) but the
            owner-session HTTP call lags by ~200-400ms. If we render
            MemoizedChat while chatAppId is set but ownerSession isn't
            matched yet, the chat-component opens its WebSocket with
            currentUser's base-app credentials and SASL-binds as the
            wrong JID. By the time ownerSession arrives the XMPP
            connection is already wedged. Rendering a placeholder
            until the credentials catch up keeps the chat-component
            from seeing inconsistent state. */}
        {chatAppId && ownerSession?.appId !== chatAppId ? (
          <div className="flex items-center justify-center min-h-[400px] text-sm text-gray-500 font-sans">
            Switching app context…
          </div>
        ) : (
          <MemoizedChat
            key={chatAppId || 'base'}
            config={effectiveApp}
            currentUser={currentUser}
            ownerSession={ownerSession}
          />
        )}
      </div>
    </div>
  );
}
