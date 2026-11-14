import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Account suspension: the "Account suspended" screen (login page and
// /account-suspended), the sign-up refusal for blocked emails, the Suspend /
// Unsuspend actions on the Users page and the two related App settings
// (support contact, blocked sign-up email domains). The end-user strings are
// translated; the admin-panel strings exist in English and the other locales
// fall back to them.
//
// Placeholders ({name}, {count}, {date}, ...) are filled with
// String.prototype.replace.
export const userSuspension = {
  en: {
    'userSuspension.reason.child_safety': 'Child safety',
    'userSuspension.reason.terms_violation': 'Violation of the Terms of Service',
    'userSuspension.reason.spam': 'Spam or abuse',
    'userSuspension.reason.security': 'Security reasons',
    'userSuspension.reason.other': 'Other',

    'userSuspension.screen.title': 'Account suspended',
    'userSuspension.screen.body':
      'This account has been suspended. You cannot sign in or use the app while the suspension is in place.',
    'userSuspension.screen.reasonLabel': 'Reason:',
    'userSuspension.screen.messageLabel': 'Message from the administrator:',
    'userSuspension.screen.until': 'Suspended until {date}.',
    'userSuspension.screen.contact': 'If you think this is a mistake, contact support:',
    'userSuspension.screen.back': 'Back to sign in',

    'userSuspension.signupBlocked': 'Sign-up with this email address is not allowed.',

    'userSuspension.tab': 'Suspended',
    'userSuspension.badge': 'Suspended',
    'userSuspension.badgeTooltip.reason': 'Reason: {reason}',
    'userSuspension.badgeTooltip.since': 'Since: {date}',
    'userSuspension.badgeTooltip.until': 'Until: {date}',
    'userSuspension.badgeTooltip.tenant': 'Also applied in child apps; sign-up blocked',
    'userSuspension.badgeTooltip.note': 'Internal note: {note}',
    'userSuspension.action.suspend': 'Suspend',
    'userSuspension.action.suspendTitle':
      'Block sign-in and API access; the account and its data are kept',
    'userSuspension.action.unsuspend': 'Unsuspend',
    'userSuspension.action.unsuspendTitle': 'Lift the suspension',

    'userSuspension.modal.titleOne': 'Suspend {name}?',
    'userSuspension.modal.titleMany': 'Suspend {count} users?',
    'userSuspension.modal.intro':
      'A suspended user cannot sign in and their open sessions are ended. The account and its data are kept and you can lift the suspension at any time. This is not the same as archiving.',
    'userSuspension.modal.reasonLabel': 'Reason',
    'userSuspension.modal.reasonPlaceholder': 'Choose a reason',
    'userSuspension.modal.messageLabel': 'Message shown to the user (optional)',
    'userSuspension.modal.messagePlaceholder': 'Shown on the "Account suspended" screen',
    'userSuspension.modal.noteLabel': 'Internal note, admins only (optional)',
    'userSuspension.modal.notePlaceholder': 'Never shown to the user',
    'userSuspension.modal.tooLong': 'At most {max} characters.',
    'userSuspension.modal.tenantLabel':
      'Also suspend this email in all child apps and block it from signing up again',
    'userSuspension.modal.tenantHelp':
      'Accounts with the same email address in the child apps of this app are suspended too, and the address can no longer sign up in this app or its child apps. Leave it off to suspend only the account in this app.',
    'userSuspension.modal.confirm': 'Suspend',
    'userSuspension.modal.cancel': 'Cancel',
    'userSuspension.modal.close': 'Close',
    'userSuspension.modal.working': 'Working...',

    'userSuspension.unsuspend.title': 'Unsuspend {name}?',
    'userSuspension.unsuspend.message': 'The user can sign in and use the app again.',
    'userSuspension.unsuspend.tenantLabel':
      'Also lift it in child apps and allow this email to sign up again',

    'userSuspension.toast.suspended': 'Suspended: {count}',
    'userSuspension.toast.alreadySuspended': 'Already suspended: {count}',
    'userSuspension.toast.childApps': 'Also suspended in child apps: {count}',
    'userSuspension.toast.failed': 'Not suspended: {count}. {details}',
    'userSuspension.toast.suspendFailedPrefix': 'Suspend failed:',
    'userSuspension.toast.unsuspended': 'Suspension lifted.',
    'userSuspension.toast.notSuspended': 'This user was not suspended.',
    'userSuspension.toast.unsuspendFailedPrefix': 'Unsuspend failed:',
    'userSuspension.error.CANNOT_SUSPEND_SELF': 'You cannot suspend your own account.',
    'userSuspension.error.CANNOT_SUSPEND_OWNER': 'The app owner cannot be suspended.',
    'userSuspension.error.USER_INVALID_STATE': 'Archived or deleted users cannot be suspended.',
    'userSuspension.error.USER_NOT_FOUND': 'User not found.',

    'userSuspension.settings.supportHeading': 'Support contact',
    'userSuspension.settings.supportDescription':
      "Shown to users of this app whose account is suspended. An email address or an https:// link. Leave it empty to use the parent app's contact or the server default.",
    'userSuspension.settings.supportPlaceholder': 'support@example.com or https://example.com/help',
    'userSuspension.settings.supportInvalid': 'Enter an email address or an https:// link.',
    'userSuspension.settings.blockedHeading': 'Blocked sign-up email domains',
    'userSuspension.settings.blockedDescription':
      'New sign-ups (email and first-time social sign-in) with an email address in one of these domains are refused. One pattern per line. A domain also matches its subdomains (example.org covers mail.example.org), and * matches exactly one part of the name. Applies to this app only, not to its child apps. Existing accounts are not affected.',
    'userSuspension.settings.blockedExamples': 'Examples: *.sch.uk, *.k12.*.us, example.org',
    'userSuspension.settings.blockedInvalid': 'Not a domain pattern: {lines}',
    'userSuspension.settings.invalidToast': 'Fix the Sign-on settings marked in red before saving.',
  },
  fr: {
    'userSuspension.reason.child_safety': 'Protection des mineurs',
    'userSuspension.reason.terms_violation': "Violation des conditions d'utilisation",
    'userSuspension.reason.spam': 'Spam ou abus',
    'userSuspension.reason.security': 'Raisons de sécurité',
    'userSuspension.reason.other': 'Autre',

    'userSuspension.screen.title': 'Compte suspendu',
    'userSuspension.screen.body':
      "Ce compte a été suspendu. Vous ne pouvez ni vous connecter ni utiliser l'application tant que la suspension est en vigueur.",
    'userSuspension.screen.reasonLabel': 'Motif :',
    'userSuspension.screen.messageLabel': "Message de l'administrateur :",
    'userSuspension.screen.until': "Suspendu jusqu'au {date}.",
    'userSuspension.screen.contact': "S'il s'agit d'une erreur, contactez le support :",
    'userSuspension.screen.back': 'Retour à la connexion',

    'userSuspension.signupBlocked': "L'inscription avec cette adresse e-mail n'est pas autorisée.",
  },
  es: {
    'userSuspension.reason.child_safety': 'Protección de menores',
    'userSuspension.reason.terms_violation': 'Incumplimiento de los Términos de servicio',
    'userSuspension.reason.spam': 'Spam o abuso',
    'userSuspension.reason.security': 'Motivos de seguridad',
    'userSuspension.reason.other': 'Otro',

    'userSuspension.screen.title': 'Cuenta suspendida',
    'userSuspension.screen.body':
      'Esta cuenta ha sido suspendida. No puedes iniciar sesión ni usar la aplicación mientras la suspensión esté vigente.',
    'userSuspension.screen.reasonLabel': 'Motivo:',
    'userSuspension.screen.messageLabel': 'Mensaje del administrador:',
    'userSuspension.screen.until': 'Suspendida hasta el {date}.',
    'userSuspension.screen.contact': 'Si crees que es un error, contacta con soporte:',
    'userSuspension.screen.back': 'Volver a iniciar sesión',

    'userSuspension.signupBlocked': 'No se permite el registro con esta dirección de correo electrónico.',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
