#!/usr/bin/env node
// Multi-agent room probe.
//
// Logs in as a human test user over XMPP, joins a MUC room that has one or more
// AI agents as members, posts one message, then transcribes everything that
// happens in the room for a while. Use it to check that agents keep a
// conversation going (or stop when they should) without a browser.
//
//   QA_API=https://api.chat-qa.ethora.com \
//   XMPP_SERVICE=wss://xmpp.chat-qa.ethora.com/ws XMPP_HOST=xmpp.chat-qa.ethora.com \
//   APP_ID=<appId> TEST_EMAIL=<email> TEST_PASSWORD=<password> \
//   ROOM=<roomName> MESSAGE="hello agents" WATCH_SEC=240 \
//   node ./agent-room-probe.mjs
//
// The @xmpp/client dependency is resolved from the ai-service package so this
// script has no install step of its own.

import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const aiServiceDir = path.resolve(here, '../../../ethora-backend/services/ai/ai-service')
const require = createRequire(path.join(aiServiceDir, 'package.json'))
const { client, xml } = require('@xmpp/client')

const env = (k, d) => process.env[k] ?? d
const API = env('QA_API', 'https://api.chat-qa.ethora.com')
const XMPP_SERVICE = env('XMPP_SERVICE', 'wss://xmpp.chat-qa.ethora.com/ws')
const XMPP_HOST = env('XMPP_HOST', 'xmpp.chat-qa.ethora.com')
const APP_ID = env('APP_ID')
const EMAIL = env('TEST_EMAIL')
const PASSWORD = env('TEST_PASSWORD')
const ROOM = env('ROOM')
const MESSAGE = env('MESSAGE', 'Hello everyone, what would you like to talk about today?')
const WATCH_SEC = Number.parseInt(env('WATCH_SEC', '240'), 10)

if (!APP_ID || !EMAIL || !PASSWORD || !ROOM) {
    console.error('APP_ID, TEST_EMAIL, TEST_PASSWORD and ROOM are required')
    process.exit(2)
}

const t0 = Date.now()
const stamp = () => `+${((Date.now() - t0) / 1000).toFixed(1)}s`

const login = await fetch(`${API}/v2/users/login-with-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId: APP_ID, email: EMAIL, password: PASSWORD }),
}).then((r) => r.json())
if (!login?.user?.xmppUsername) {
    console.error('[fatal] login failed', JSON.stringify(login).slice(0, 300))
    process.exit(1)
}
const me = login.user
const fullName = `${me.firstName || ''} ${me.lastName || ''}`.trim() || me.xmppUsername
const roomJid = `${ROOM}@conference.${XMPP_HOST}`
console.log(`[probe] logged in as ${me.xmppUsername} (${fullName}); room ${roomJid}`)

const xmpp = client({
    service: XMPP_SERVICE,
    domain: XMPP_HOST,
    username: me.xmppUsername,
    password: me.xmppPassword,
    resource: 'agent-room-probe',
})

const counts = { human: 0, bot: 0, system: 0 }
const senders = new Map()

xmpp.on('error', (e) => console.error(`[xmpp] error ${stamp()}`, e?.message || e))
xmpp.on('stanza', (stanza) => {
    if (stanza.is('presence') && stanza.attrs.from?.startsWith(roomJid)) {
        const err = stanza.getChild('error')
        if (err) console.error(`[presence-error] ${stamp()} ${err.toString()}`)
        return
    }
    if (!stanza.is('message') || stanza.attrs.type !== 'groupchat') return
    const body = stanza.getChild('body')?.getText()
    if (!body) return
    // Skip MAM history replay (delayed delivery) so we only transcribe live traffic.
    if (stanza.getChild('delay', 'urn:xmpp:delay')) return
    const nick = (stanza.attrs.from || '').split('/')[1] || '?'
    const data = stanza.getChild('data')
    const name = data?.attrs?.fullName || nick.slice(-12)
    const isBot = !!stanza.getChild('x', 'urn:ethora:bot')
    const isSystem = data?.attrs?.isSystemMessage === 'true'
    const kind = isSystem ? 'system' : isBot ? 'bot' : 'human'
    counts[kind] += 1
    senders.set(name, (senders.get(name) || 0) + 1)
    console.log(`[${kind}] ${stamp()} ${name}: ${body.replace(/\s+/g, ' ').slice(0, 160)}`)
})

xmpp.on('online', async () => {
    console.log(`[probe] online ${stamp()}, joining room`)
    await xmpp.send(xml('presence'))
    await xmpp.send(xml('presence', { to: `${roomJid}/${me.xmppUsername}` },
        xml('x', { xmlns: 'http://jabber.org/protocol/muc' }, xml('history', { maxstanzas: '0' }))))
    await new Promise((r) => setTimeout(r, 1500))
    console.log(`[probe] sending: ${MESSAGE}`)
    await xmpp.send(xml('message', { to: roomJid, type: 'groupchat', id: `probe-${Date.now()}` },
        xml('body', {}, MESSAGE),
        xml('data', {
            fullName,
            senderFirstName: me.firstName || 'Probe',
            senderLastName: me.lastName || '',
            senderJID: `${me.xmppUsername}@${XMPP_HOST}`,
            photo: me.profileImage || '',
            isSystemMessage: 'false',
        })))
})

await xmpp.start().catch((e) => {
    console.error('[fatal] xmpp start failed', e?.message || e)
    process.exit(1)
})

setTimeout(async () => {
    console.log(`[verdict] ${stamp()} human=${counts.human} bot=${counts.bot} system=${counts.system}; by sender: ${JSON.stringify(Object.fromEntries(senders))}`)
    try { await xmpp.stop() } catch (_) { /* noop */ }
    process.exit(0)
}, WATCH_SEC * 1000)
