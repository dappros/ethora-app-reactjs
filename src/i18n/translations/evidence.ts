import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Trust & Safety quarantine review (docs/TRUST_AND_SAFETY.md section 11):
// the Quarantine tab of the superadmin T&S hub (was the "Evidence" page), its
// case view, media viewer and the case actions. Keys keep the evidence.*
// prefix of the API (/v2/admin/evidence); the visible wording is Quarantine.
// English only for now; the other locales fall back to it.
// Placeholders ({days}, {count}, ...) are filled with String.prototype.replace.

const en: Record<string, string> = {
  // ---- Access ----
  'evidence.logged': 'Access to quarantined content is logged.',
  'evidence.notAllowed.title': 'Not allowed',
  'evidence.notAllowed.body': 'Trust & Safety is open to server superadmins with write access only.',
  'evidence.unavailable': 'The quarantine is not available on this server yet.',

  // ---- Case list ----
  'evidence.title': 'Quarantine',
  'evidence.intro':
    'Content kept from deleted messages, moderator and automatic actions, and suspensions. Each case is kept until its retention ends, unless it is extended or put on legal hold.',
  'evidence.filter.reason': 'Reason',
  'evidence.filter.mode': 'Mode',
  'evidence.filter.status': 'Status',
  'evidence.filter.app': 'App',
  'evidence.filter.search': 'Search',
  'evidence.searchPlaceholder': 'Search user, email, room or case id',
  'evidence.reason.all': 'All reasons',
  'evidence.reason.deleted': 'Deleted by user',
  'evidence.reason.auto': 'Automatic check',
  'evidence.reason.moderator': 'Moderator',
  'evidence.reason.suspension': 'Suspension',
  'evidence.mode.all': 'All modes',
  'evidence.mode.hide': 'Hidden',
  'evidence.mode.quarantine': 'Quarantined',
  'evidence.status.all': 'Any status',
  'evidence.status.active': 'Active',
  'evidence.status.held': 'On hold',
  'evidence.status.expiring': 'Expiring soon',
  'evidence.app.all': 'All apps',
  'evidence.userFilter': 'User: {name}',
  'evidence.clearUser': 'Clear the user filter',
  'evidence.clearFilters': 'Clear filters',
  'evidence.filterByUser': 'Show only this user',
  'evidence.filterByApp': 'Show only this App',
  'evidence.col.user': 'User',
  'evidence.col.app': 'App',
  'evidence.col.room': 'Room',
  'evidence.col.created': 'Created',
  'evidence.counts.messages': '{count} messages',
  'evidence.counts.messagesOne': '1 message',
  'evidence.counts.media': '{count} media files',
  'evidence.counts.mediaOne': '1 media file',
  'evidence.reported': 'Reported',
  'evidence.reportedTitle': 'Recorded as reported: {targets}',
  'evidence.unknownUser': 'Unknown user',
  'evidence.openCase': 'Open case',
  'evidence.empty': 'No quarantine case matches these filters.',
  'evidence.loadFailed': 'Could not load the quarantine: {error}',
  'evidence.loading': 'Loading...',
  'evidence.refresh': 'Refresh',
  'evidence.previous': 'Previous',
  'evidence.next': 'Next',
  'evidence.range': '{from} to {to} of {total}',
  'evidence.rangeOpen': '{from} to {to}',

  // ---- Retention badge ----
  'evidence.retention.purged': 'Purged',
  'evidence.retention.hold': 'On hold',
  'evidence.retention.none': 'No expiry',
  'evidence.retention.expired': 'Expired, purge pending',
  'evidence.retention.expires': 'Expires in {days} days',
  'evidence.retention.expiresOne': 'Expires in 1 day',

  // ---- Case view ----
  'evidence.case.back': 'Back to quarantine',
  'evidence.case.title': 'Quarantine case',
  'evidence.case.id': 'Case id',
  'evidence.case.reason': 'Reason',
  'evidence.case.mode': 'Mode',
  'evidence.case.user': 'User',
  'evidence.case.app': 'App',
  'evidence.case.room': 'Room',
  'evidence.case.created': 'Created',
  'evidence.case.expires': 'Expires',
  'evidence.case.holdSet': 'On hold since {date}',
  'evidence.case.holdSetBy': 'On hold since {date}, set by {name}',
  'evidence.case.purgedNote':
    'Purged {date}. The content is gone; the hashes, the reports and the audit trail are kept.',
  'evidence.case.loadFailed': 'Could not load the case: {error}',
  'evidence.case.notFound': 'This case was not found. It may have expired and been purged.',

  'evidence.transcript.title': 'Transcript',
  'evidence.transcript.time': 'Time',
  'evidence.transcript.sender': 'Sender',
  'evidence.transcript.text': 'Text',
  'evidence.transcript.empty': 'No messages in this case.',
  'evidence.transcript.noText': 'No text',

  'evidence.media.title': 'Media',
  'evidence.media.empty': 'No media in this case.',
  'evidence.media.showAll': 'Show all media',
  'evidence.media.confirmTitle': 'Show this file?',
  'evidence.media.confirmAllTitle': 'Show all media of this case?',
  'evidence.media.confirmMessage': 'May contain harmful content. Viewing is logged.',
  'evidence.media.confirm': 'Show',
  'evidence.media.loading': 'Loading...',
  'evidence.media.loadFailed': 'Could not load the file.',
  'evidence.media.retry': 'Retry',
  'evidence.media.openOriginal': 'Open original',
  'evidence.media.download': 'Download',
  'evidence.media.noInline': 'This type cannot be shown here. Download it to inspect it.',
  'evidence.media.close': 'Close',
  'evidence.viewedBy.title': 'Viewed by',
  'evidence.viewedBy.empty': 'No views recorded yet.',
  'evidence.viewedBy.case': 'Opened the case',
  'evidence.viewedBy.media': 'Opened media',
  'evidence.viewedBy.unknown': 'Unknown reviewer',
  'evidence.media.purgedFiles': 'The files were purged. What the automatic checks recorded:',

  'evidence.hashes.title': 'Hashes',
  'evidence.hashes.sha256': 'SHA-256',
  'evidence.hashes.md5': 'MD5',
  'evidence.hashes.missing': 'Not computed yet. The first export computes it.',
  'evidence.hashes.copy': 'Copy {name}',

  'evidence.reports.title': 'Reports',
  'evidence.reports.empty': 'No report recorded.',
  'evidence.reports.by': 'by {name}',
  'evidence.reports.reference': 'Reference: {reference}',

  'evidence.target.ncmec': 'NCMEC',
  'evidence.target.law_enforcement': 'Law enforcement',
  'evidence.target.hr': 'HR',
  'evidence.target.internal': 'Internal',
  'evidence.target.other': 'Other',

  // ---- Actions ----
  'evidence.actions.title': 'Actions',
  'evidence.action.extend30': 'Extend +30 days',
  'evidence.action.extend90': 'Extend +90 days',
  'evidence.action.extendCustom': 'Extend by...',
  'evidence.action.extendTitle': 'Keep this case longer: adds days to its expiry',
  'evidence.action.hold': 'Legal hold',
  'evidence.action.holdTitle': 'Keep everything in this case until the hold is released; nothing is purged',
  'evidence.action.releaseHold': 'Release hold',
  'evidence.action.report': 'Record a report',
  'evidence.action.export': 'Export',
  'evidence.action.purge': 'Purge now',
  'evidence.purgedActions': 'This case is purged. Only the export of what is kept remains available.',

  'evidence.toast.extended': 'Retention extended by {days} days.',
  'evidence.toast.held': 'Legal hold set.',
  'evidence.toast.released': 'Hold released.',
  'evidence.toast.reported': 'Report recorded.',
  'evidence.toast.purged': 'Case purged.',
  'evidence.toast.exported': 'Export downloaded.',
  'evidence.toast.failed': 'Action failed: {error}',
  'evidence.toast.exportFailed': 'Export failed: {error}',

  'evidence.dialog.cancel': 'Cancel',
  'evidence.dialog.close': 'Close',
  'evidence.dialog.working': 'Working...',
  'evidence.daysInvalid': 'Enter a whole number from 1 to 3650.',

  'evidence.extend.title': 'Extend retention',
  'evidence.extend.body':
    'Adds days to the expiry of every row and quarantined file of this case. An expiry that has already passed counts from now.',
  'evidence.extend.days': 'Days (1 to 3650)',
  'evidence.extend.submit': 'Extend',

  'evidence.release.title': 'Release legal hold',
  'evidence.release.body': 'The case gets an expiry again and is purged when it passes.',
  'evidence.release.days': 'Keep for (days from now)',
  'evidence.release.default': 'The retention setting is {days} days.',
  'evidence.release.defaultUnknown': 'Leave it empty to use the retention setting of the server.',
  'evidence.release.submit': 'Release hold',

  'evidence.report.title': 'Record a report',
  'evidence.report.helper':
    'Recording a report here does not send anything. File the report with the recipient yourself and attach the export of this case to it.',
  'evidence.report.target': 'Reported to',
  'evidence.report.reference': 'Reference (optional)',
  'evidence.report.referencePlaceholder': 'Report, case or ticket number',
  'evidence.report.note': 'Note (optional)',
  'evidence.report.submit': 'Record report',

  'evidence.export.title': 'Export case',
  'evidence.export.body':
    'A zip with the manifest, the transcript, the original messages and the hashes, for attaching to an external report. The download is logged.',
  'evidence.export.withoutMedia': 'Without media',
  'evidence.export.withMedia': 'With media files',
  'evidence.export.withMediaHelp': 'Adds the kept files. They may contain harmful content.',
  'evidence.export.submit': 'Download zip',
  'evidence.export.busy': 'Preparing the export...',

  'evidence.purge.title': 'Purge this case now?',
  'evidence.purge.body':
    'The quarantined files, their file records and the kept messages are deleted now and cannot be recovered. The hashes, the reports and the audit trail are kept.',
  'evidence.purge.type': 'Type {reason} or DELETE to confirm',
  'evidence.purge.typeDelete': 'Type DELETE to confirm',
  'evidence.purge.submit': 'Purge now',
};

export const evidence = {
  en,
  fr: {},
  es: {},
} satisfies Record<UiLanguageCode, Record<string, string>>;
