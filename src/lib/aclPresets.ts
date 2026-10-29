import { set } from 'lodash';
import { ModelUserACL } from '../models';

export type Flag = 'create' | 'read' | 'update' | 'delete' | 'admin';
export type Area = 'appSettings' | 'appUsers' | 'appTokens' | 'appPush' | 'appStats';

// The flags each area has on the backend (validation/user/acl/updateAclSchema.js).
// appTokens is kept for presets and preset matching but is not shown: the
// only thing it gates is ERC-20 token creation, which installs no longer use.
export const AREAS: Array<{ area: Area; flags: Flag[] }> = [
  { area: 'appSettings', flags: ['read', 'update', 'admin'] },
  { area: 'appUsers', flags: ['create', 'read', 'update', 'delete', 'admin'] },
  { area: 'appTokens', flags: ['create', 'read', 'update', 'admin'] },
  { area: 'appPush', flags: ['create', 'read', 'update', 'admin'] },
  { area: 'appStats', flags: ['read', 'admin'] },
];

// What the panel actually lets a person do, expressed over those flags.
// Each capability owns a set of flags: on = all of them true, off = all
// false. The "see" capability is what puts the app in the user's list and
// follows any other grant (the backend forces it too).
export type CapabilityId = 'see' | 'settings' | 'viewUsers' | 'manageUsers' | 'removeUsers' | 'permissions' | 'push' | 'stats';
export const CAPABILITIES: Array<{ id: CapabilityId; flags: Array<[Area, Flag]> }> = [
  { id: 'see', flags: [['appSettings', 'read']] },
  { id: 'settings', flags: [['appSettings', 'update'], ['appSettings', 'admin']] },
  // appUsers.read gates the users list, tags, CSV export and message search;
  // create/update are the editing half.
  { id: 'viewUsers', flags: [['appUsers', 'read']] },
  { id: 'manageUsers', flags: [['appUsers', 'create'], ['appUsers', 'update']] },
  { id: 'removeUsers', flags: [['appUsers', 'delete']] },
  { id: 'permissions', flags: [['appUsers', 'admin']] },
  { id: 'push', flags: [['appPush', 'create'], ['appPush', 'read'], ['appPush', 'update'], ['appPush', 'admin']] },
  { id: 'stats', flags: [['appStats', 'read'], ['appStats', 'admin']] },
];

export type PresetId = 'member' | 'analyst' | 'userManager' | 'admin' | 'custom';
export const PRESETS: Array<{ id: Exclude<PresetId, 'custom'>; on: CapabilityId[]; tokens?: boolean }> = [
  { id: 'member', on: [] },
  { id: 'analyst', on: ['see', 'viewUsers', 'stats'] },
  { id: 'userManager', on: ['see', 'viewUsers', 'manageUsers', 'removeUsers', 'permissions'] },
  { id: 'admin', on: ['see', 'settings', 'viewUsers', 'manageUsers', 'removeUsers', 'permissions', 'push', 'stats'], tokens: true },
];

export function flagOf(acl: ModelUserACL, area: Area, flag: Flag): boolean {
  const row = (acl.application as unknown as Record<Area, Partial<Record<Flag, boolean>>>)[area];
  return Boolean(row?.[flag]);
}

export function capabilityOn(acl: ModelUserACL, id: CapabilityId): boolean {
  const cap = CAPABILITIES.find((c) => c.id === id);
  return Boolean(cap && cap.flags.every(([a, f]) => flagOf(acl, a, f)));
}

export function managesAnything(acl: ModelUserACL): boolean {
  return AREAS.some(({ area, flags }) => flags.some((f) => !(area === 'appSettings' && f === 'read') && flagOf(acl, area, f)));
}

export function matchesPreset(acl: ModelUserACL, preset: (typeof PRESETS)[number]): boolean {
  const capsMatch = CAPABILITIES.every((c) => capabilityOn(acl, c.id) === preset.on.includes(c.id));
  const tokensMatch = AREAS.find((a) => a.area === 'appTokens')!.flags.every((f) => flagOf(acl, 'appTokens', f) === Boolean(preset.tokens));
  return capsMatch && tokensMatch;
}

// Editing or removing users without being able to list them makes no
// sense, so those pull "view users" along.
export function setCapability(next: ModelUserACL, id: CapabilityId, on: boolean) {
  CAPABILITIES.find((c) => c.id === id)!.flags.forEach(([a, f]) => set(next, `application.${a}.${f}`, on));
  if (on && (id === 'manageUsers' || id === 'removeUsers' || id === 'permissions')) set(next, 'application.appUsers.read', true);
}

export function withPreset(acl: ModelUserACL, presetId: Exclude<PresetId, 'custom'>): ModelUserACL {
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const next: ModelUserACL = JSON.parse(JSON.stringify(acl));
  CAPABILITIES.forEach((c) => setCapability(next, c.id, preset.on.includes(c.id)));
  AREAS.find((a) => a.area === 'appTokens')!.flags.forEach((f) => set(next, `application.appTokens.${f}`, Boolean(preset.tokens)));
  if (managesAnything(next)) set(next, 'application.appSettings.read', true);
  return next;
}
