import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Trust & Safety (docs/TRUST_AND_SAFETY.md): the Server settings tab (TS_*
// keys, presets, moderation service), the App's stricter-only overrides, the
// Account > Age section, the content options of the Suspend dialog, the
// Moderation queue and the age column of the Users page. English only for
// now; the other locales fall back to it.
//
// The Server settings page looks its labels up generically
// (serverSettings.key.<KEY>, serverSettings.desc.<KEY>,
// serverSettings.option.<KEY>.<value>), so those keys live here under that
// namespace. Placeholders ({name}, {value}, ...) are filled with
// String.prototype.replace.

const textActionOptions = (key: string) => ({
  [`serverSettings.option.${key}.allow`]: 'Allow',
  [`serverSettings.option.${key}.flag`]: 'Flag for review',
  [`serverSettings.option.${key}.blur`]: 'Blur (tap to view)',
  [`serverSettings.option.${key}.hide`]: 'Hide',
});

const en: Record<string, string> = {
  // ---- Server settings ----
  'serverSettings.tab.safety': 'Trust & Safety',
  'serverSettings.group.trustSafety': 'Trust & Safety',
  'serverSettings.module.moderation': 'Moderation service',
  'serverSettings.module.moderation.desc':
    'Detects nudity, offensive text, personal data and health information on this server. No message or image leaves the install.',

  'serverSettings.key.TS_ENABLED': 'Automatic moderation',
  'serverSettings.desc.TS_ENABLED':
    'Checks chat images, videos and messages with the moderation service. Off: nothing is checked.',
  'serverSettings.key.TS_PROFILE': 'Profile',
  'serverSettings.desc.TS_PROFILE': 'The preset applied last. Changing a value by hand makes it Custom.',
  'serverSettings.option.TS_PROFILE.custom': 'Custom',
  'serverSettings.option.TS_PROFILE.business': 'Business',
  'serverSettings.option.TS_PROFILE.education': 'Education',
  'serverSettings.option.TS_PROFILE.community': 'Community',
  'serverSettings.option.TS_PROFILE.adult': 'Adult',
  'serverSettings.key.TS_IMAGE_NUDITY_ACTION': 'Images and videos with nudity',
  'serverSettings.desc.TS_IMAGE_NUDITY_ACTION':
    'Blur: shown blurred, opens on tap. Hold: only the sender and moderators see it until a moderator approves it. Block: the upload is refused.',
  'serverSettings.option.TS_IMAGE_NUDITY_ACTION.allow': 'Allow',
  'serverSettings.option.TS_IMAGE_NUDITY_ACTION.blur': 'Blur (tap to view)',
  'serverSettings.option.TS_IMAGE_NUDITY_ACTION.hold': 'Hold for review',
  'serverSettings.option.TS_IMAGE_NUDITY_ACTION.block': 'Block the upload',
  'serverSettings.key.TS_IMAGE_NUDITY_THRESHOLD': 'Nudity threshold',
  'serverSettings.desc.TS_IMAGE_NUDITY_THRESHOLD':
    'Detection score (percent) from which the action applies. Lower catches more, with more false positives.',
  'serverSettings.key.TS_AGE_GATE': 'Age gate',
  'serverSettings.desc.TS_AGE_GATE':
    'Blurred media opens only for users who declared they are 18 or older. The sender always sees their own file.',
  'serverSettings.key.TS_TEXT_TOXICITY_ACTION': 'Offensive messages',
  'serverSettings.desc.TS_TEXT_TOXICITY_ACTION': 'Insults, obscene and toxic language.',
  ...textActionOptions('TS_TEXT_TOXICITY_ACTION'),
  'serverSettings.key.TS_TEXT_TOXICITY_THRESHOLD': 'Offensive threshold',
  'serverSettings.desc.TS_TEXT_TOXICITY_THRESHOLD':
    'Percent. The highest of the toxicity, obscenity and insult scores is compared with it.',
  'serverSettings.key.TS_TEXT_SEVERE_ACTION': 'Severe messages',
  'serverSettings.desc.TS_TEXT_SEVERE_ACTION':
    'Threats, attacks on identity, severe toxicity and sexually explicit text.',
  ...textActionOptions('TS_TEXT_SEVERE_ACTION'),
  'serverSettings.key.TS_TEXT_SEVERE_THRESHOLD': 'Severe threshold',
  'serverSettings.desc.TS_TEXT_SEVERE_THRESHOLD': 'Percent. Lower catches more.',
  'serverSettings.key.TS_PII_ACTION': 'Personal data in messages',
  'serverSettings.desc.TS_PII_ACTION': 'Card numbers, bank accounts, ID numbers and the other types listed below.',
  ...textActionOptions('TS_PII_ACTION'),
  'serverSettings.key.TS_PII_TYPES': 'Personal data types',
  'serverSettings.desc.TS_PII_TYPES':
    'Comma-separated. For example CREDIT_CARD, US_SSN, IBAN_CODE, PHONE_NUMBER, EMAIL_ADDRESS, IP_ADDRESS, LOCATION.',
  'serverSettings.key.TS_PHI_ACTION': 'Health information',
  'serverSettings.desc.TS_PHI_ACTION': 'A person named or identified next to a health term.',
  ...textActionOptions('TS_PHI_ACTION'),
  'serverSettings.key.TS_PHI_THRESHOLD': 'Health information threshold',
  'serverSettings.desc.TS_PHI_THRESHOLD': 'Percent. Lower catches more.',
  'serverSettings.key.TS_EVIDENCE_RETENTION_DAYS': 'Keep evidence for (days)',
  'serverSettings.desc.TS_EVIDENCE_RETENTION_DAYS':
    'Quarantined content and the originals of hidden messages are deleted after this many days.',

  'trustSafety.percent': '%',
  'trustSafety.presets.title': 'Start from a preset',
  'trustSafety.presets.intro': 'A preset fills in the values below. Review them, then save.',
  'trustSafety.presets.current': 'Current',
  'trustSafety.presets.applied': '{preset} values filled in. Save to apply them.',
  'trustSafety.preset.business': 'Business',
  'trustSafety.preset.business.desc':
    'Workplace chat: nudity blocked, offensive text blurred, contact details and health information blurred.',
  'trustSafety.preset.education': 'Education',
  'trustSafety.preset.education.desc':
    'Schools and young users: the strictest filters, with offensive text and personal data hidden.',
  'trustSafety.preset.community': 'Community',
  'trustSafety.preset.community.desc':
    'Public communities: nudity and offensive text blurred, severe text hidden, personal data flagged.',
  'trustSafety.preset.adult': 'Adult',
  'trustSafety.preset.adult.desc':
    'Adult platforms: nudity allowed behind the age gate, offensive text only flagged.',
  'trustSafety.presets.adultNote':
    'The Adult preset is meant for self-hosted adult platforms whose users are verified adults.',
  'trustSafety.service.note':
    'Detection needs the moderation service, enabled in deploy.yml (services.moderation) or with the "ts" profile of the compose bundle. Until it runs, uploads and messages are not checked.',

  'trustSafety.action.allow': 'Allow',
  'trustSafety.action.flag': 'Flag for review',
  'trustSafety.action.blur': 'Blur',
  'trustSafety.action.hold': 'Hold for review',
  'trustSafety.action.hide': 'Hide',
  'trustSafety.action.block': 'Block',

  // ---- App settings ----
  'trustSafetyApp.tab': 'Trust & Safety',
  'trustSafetyApp.heading': 'Trust & Safety',
  'trustSafetyApp.description':
    'Make the server policy stricter for this app. Nothing here can make it looser than the server setting; options that would are disabled.',
  'trustSafetyApp.disabledNote':
    'Automatic moderation is off on this server. Values saved here apply once a server admin turns it on.',
  'trustSafetyApp.loadFailed': 'Could not load the server policy: {error}',
  'trustSafetyApp.noInstall':
    'The server values are not available, so looser options are not marked here. The server still refuses them.',
  'trustSafetyApp.row.nudity': 'Images and videos with nudity',
  'trustSafetyApp.row.nudity.desc': 'Uploads to the chats of this app.',
  'trustSafetyApp.row.toxicity': 'Offensive messages',
  'trustSafetyApp.row.toxicity.desc': 'Insults, obscene and toxic language.',
  'trustSafetyApp.row.severe': 'Severe messages',
  'trustSafetyApp.row.severe.desc': 'Threats, attacks on identity, severe toxicity and sexually explicit text.',
  'trustSafetyApp.row.pii': 'Personal data in messages',
  'trustSafetyApp.row.pii.desc': 'The personal data types chosen in the server settings.',
  'trustSafetyApp.row.phi': 'Health information',
  'trustSafetyApp.row.phi.desc': 'A person named or identified next to a health term.',
  'trustSafetyApp.actionLabel': 'Action',
  'trustSafetyApp.thresholdLabel': 'Threshold (%)',
  'trustSafetyApp.followServer': 'Same as server ({value})',
  'trustSafetyApp.followServerUnknown': 'Same as server',
  'trustSafetyApp.serverValue': 'Server: {value}',
  'trustSafetyApp.thresholdHelp': 'Lower is stricter. Leave empty to use the server value ({value}).',
  'trustSafetyApp.thresholdTooHigh': 'At most {max}, the server value.',
  'trustSafetyApp.thresholdInvalid': 'A whole number from 1 to 100.',
  'trustSafetyApp.looser': 'Looser than the server setting',
  'trustSafetyApp.inEffect': 'In effect: {value}',
  'trustSafetyApp.invalidToast': 'Fix the Trust & Safety values marked in red before saving.',

  // ---- Account > Age ----
  'trustSafetyAge.heading': 'Age',
  'trustSafetyAge.intro':
    'Media marked as sensitive opens only for people who declared they are 18 or older.',
  'trustSafetyAge.privacy': 'Only your birth year is kept, not your full date of birth.',
  'trustSafetyAge.notDeclared': 'You have not declared your age.',
  'trustSafetyAge.adult': '18 or older',
  'trustSafetyAge.minor': 'Under 18',
  'trustSafetyAge.birthYear': 'Birth year {year}',
  'trustSafetyAge.declaredAt': 'Declared on {date}',
  'trustSafetyAge.dobLabel': 'Date of birth',
  'trustSafetyAge.save': 'Save',
  'trustSafetyAge.change': 'Change',
  'trustSafetyAge.cancel': 'Cancel',
  'trustSafetyAge.saving': 'Saving...',
  'trustSafetyAge.saved': 'Age saved.',
  'trustSafetyAge.failed': 'Could not save your age: {error}',
  'trustSafetyAge.loadFailed': 'Could not load your age: {error}',
  'trustSafetyAge.invalidDate': 'Enter a valid date of birth in the past.',
  'trustSafetyAge.locked':
    'You declared that you are under 18, so you cannot change this yourself. If this is wrong, contact support.',
  'trustSafetyAge.contact': 'Contact support',

  // ---- Suspend dialog ----
  'trustSafetySuspend.contentHeading': 'Content of this account',
  'trustSafetySuspend.messagesLabel': 'Messages',
  'trustSafetySuspend.messagesHelp': 'Messages this account sent in the chats of the app.',
  'trustSafetySuspend.mediaLabel': 'Media',
  'trustSafetySuspend.mediaHelp': 'Images, videos and files this account uploaded to chats.',
  'trustSafetySuspend.nameLabel': 'Name',
  'trustSafetySuspend.nameHelp':
    'Others see "Suspended account" with no avatar instead of the name, until the suspension is lifted.',
  'trustSafetySuspend.mode.keep': 'Keep as is',
  'trustSafetySuspend.mode.hide': 'Hide (restored when unsuspended)',
  'trustSafetySuspend.mode.quarantine': 'Quarantine (hidden, kept as evidence, deleted after the retention period)',
  'trustSafetySuspend.mode.delete': 'Delete',
  'trustSafetySuspend.name.keep': 'Keep',
  'trustSafetySuspend.name.suspended': 'Show as "Suspended account"',
  'trustSafetySuspend.deleteWarning':
    'Deleting cannot be undone. The content stays deleted even if the suspension is lifted.',

  // ---- Moderation queue ----
  'trustSafetyModeration.tab': 'Moderation',
  'trustSafetyModeration.title': 'Moderation',
  'trustSafetyModeration.intro':
    'Messages and media flagged by the automatic checks or by moderators. Flagged text is shown to moderators only.',
  'trustSafetyModeration.filter.status': 'Status',
  'trustSafetyModeration.filter.kind': 'Kind',
  'trustSafetyModeration.filter.category': 'Category',
  'trustSafetyModeration.status.open': 'Open',
  'trustSafetyModeration.status.resolved': 'Resolved',
  'trustSafetyModeration.kind.all': 'All kinds',
  'trustSafetyModeration.kind.message': 'Message',
  'trustSafetyModeration.kind.media': 'Media',
  'trustSafetyModeration.category.all': 'All categories',
  'trustSafetyModeration.category.nudity': 'Nudity',
  'trustSafetyModeration.category.toxicity': 'Offensive',
  'trustSafetyModeration.category.severe': 'Severe',
  'trustSafetyModeration.category.pii': 'Personal data',
  'trustSafetyModeration.category.phi': 'Health information',
  'trustSafetyModeration.category.suspension': 'Suspension',
  'trustSafetyModeration.col.sender': 'Sender',
  'trustSafetyModeration.col.room': 'Room',
  'trustSafetyModeration.col.time': 'Time',
  'trustSafetyModeration.col.autoAction': 'Applied',
  'trustSafetyModeration.applied.flag': 'Flagged',
  'trustSafetyModeration.applied.blur': 'Blurred',
  'trustSafetyModeration.applied.hold': 'Held',
  'trustSafetyModeration.applied.hide': 'Hidden',
  'trustSafetyModeration.applied.hidden': 'Hidden',
  'trustSafetyModeration.applied.block': 'Blocked',
  'trustSafetyModeration.applied.delete': 'Deleted',
  'trustSafetyModeration.applied.deleted': 'Deleted',
  'trustSafetyModeration.source.auto': 'automatic',
  'trustSafetyModeration.source.moderator': 'by a moderator',
  'trustSafetyModeration.source.report': 'reported',
  'trustSafetyModeration.itemStatus.open': 'Open',
  'trustSafetyModeration.itemStatus.approved': 'Approved',
  'trustSafetyModeration.itemStatus.removed': 'Removed',
  'trustSafetyModeration.itemStatus.dismissed': 'Dismissed',
  'trustSafetyModeration.action.approve': 'Approve',
  'trustSafetyModeration.action.approveTitle': 'Release the held file to the chat',
  'trustSafetyModeration.action.dismiss': 'Dismiss',
  'trustSafetyModeration.action.dismissTitle': 'Close the item and leave the content as it is',
  'trustSafetyModeration.action.blur': 'Blur',
  'trustSafetyModeration.action.blurTitle': 'Show it collapsed; readers tap to view',
  'trustSafetyModeration.action.hide': 'Hide',
  'trustSafetyModeration.action.hideTitle': 'Hide it from everyone; the original is kept as evidence',
  'trustSafetyModeration.action.delete': 'Delete',
  'trustSafetyModeration.action.deleteTitle': 'Delete it for everyone; cannot be undone',
  'trustSafetyModeration.action.restore': 'Restore',
  'trustSafetyModeration.action.restoreTitle': 'Show the original content again',
  'trustSafetyModeration.suspendSender': 'Suspend sender',
  'trustSafetyModeration.deleteConfirmTitle': 'Delete this content?',
  'trustSafetyModeration.deleteConfirmMessage':
    'The message or file is removed for everyone. This cannot be undone.',
  'trustSafetyModeration.actionDone': 'Done: {action}.',
  'trustSafetyModeration.actionFailed': 'Action failed: {error}',
  'trustSafetyModeration.empty': 'Nothing to review.',
  'trustSafetyModeration.emptyResolved': 'No resolved items yet.',
  'trustSafetyModeration.loadFailed': 'Could not load the queue: {error}',
  'trustSafetyModeration.unavailable': 'The moderation queue is not available on this server yet.',
  'trustSafetyModeration.loading': 'Loading...',
  'trustSafetyModeration.refresh': 'Refresh',
  'trustSafetyModeration.previous': 'Previous',
  'trustSafetyModeration.next': 'Next',
  'trustSafetyModeration.range': '{from} to {to} of {total}',
  'trustSafetyModeration.rangeOpen': '{from} to {to}',
  'trustSafetyModeration.noText': 'No text kept',
  'trustSafetyModeration.noPreview': 'No preview',
  'trustSafetyModeration.showPreview': 'Show',
  'trustSafetyModeration.hidePreview': 'Blur',
  'trustSafetyModeration.unknownSender': 'Unknown sender',
  'trustSafetyModeration.resolvedAt': 'Resolved {date}',
  'trustSafetyModeration.piiTypes': 'Types: {types}',
  'trustSafetyModeration.serviceOff':
    'Automatic moderation is off on this server, so only items added by moderators or earlier checks appear here.',

  // ---- Users page ----
  'trustSafetyUsers.col': 'Age',
  'trustSafetyUsers.adult': '18+',
  'trustSafetyUsers.minor': 'Under 18',
  'trustSafetyUsers.unknown': 'Unknown',
  'trustSafetyUsers.tooltip': 'Birth year {year}. Declared {date}.',
  'trustSafetyUsers.tooltipAdmin': 'Set by an admin.',
  'trustSafetyUsers.reset': 'Reset age',
  'trustSafetyUsers.resetTitle': 'Clear the declared age so the user declares it again',
  'trustSafetyUsers.resetConfirmTitle': 'Reset the age of {name}?',
  'trustSafetyUsers.resetConfirmMessage':
    'The declared age is cleared. The user is asked again the next time age matters, and can then declare 18 or older.',
  'trustSafetyUsers.resetDone': 'Age reset.',
  'trustSafetyUsers.resetFailedPrefix': 'Age reset failed:',
};

export const trustSafety = {
  en,
  fr: {},
  es: {},
} satisfies Record<UiLanguageCode, Record<string, string>>;
