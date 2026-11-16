import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Account suspension: the "Account suspended" screen (login page and
// /account-suspended), the sign-up refusal for blocked emails, the Suspend /
// Unsuspend actions on the Users page and the two related App settings
// (support contact, blocked sign-up email domains). All strings, end-user
// and admin-panel, are translated into every locale.
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
    'userSuspension.error.CANNOT_SUSPEND_PRIVILEGED': 'You can only suspend users with a lower access level than yours.',
    'userSuspension.error.CANNOT_UNSUSPEND_PRIVILEGED': 'This suspension was set by a higher access level and can only be lifted from there.',
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

    'userSuspension.tab': 'Suspendus',
    'userSuspension.badge': 'Suspendu',
    'userSuspension.badgeTooltip.reason': 'Motif : {reason}',
    'userSuspension.badgeTooltip.since': 'Depuis le {date}',
    'userSuspension.badgeTooltip.until': 'Jusqu’au {date}',
    'userSuspension.badgeTooltip.tenant': 'S’applique aussi aux applications enfants; inscription bloquée',
    'userSuspension.badgeTooltip.note': 'Note interne : {note}',
    'userSuspension.action.suspend': 'Suspendre',
    'userSuspension.action.suspendTitle':
      'Bloque la connexion et l’accès à l’API; le compte et ses données sont conservés',
    'userSuspension.action.unsuspend': 'Lever la suspension',
    'userSuspension.action.unsuspendTitle': 'Lever la suspension',

    'userSuspension.modal.titleOne': 'Suspendre {name} ?',
    'userSuspension.modal.titleMany': 'Suspendre {count} utilisateurs ?',
    'userSuspension.modal.intro':
      'Un utilisateur suspendu ne peut pas se connecter et ses sessions ouvertes sont fermées. Le compte et ses données sont conservés et vous pouvez lever la suspension à tout moment. Ce n’est pas la même chose que l’archivage.',
    'userSuspension.modal.reasonLabel': 'Motif',
    'userSuspension.modal.reasonPlaceholder': 'Choisissez un motif',
    'userSuspension.modal.messageLabel': 'Message affiché à l’utilisateur (facultatif)',
    'userSuspension.modal.messagePlaceholder': 'Affiché sur l’écran « Compte suspendu »',
    'userSuspension.modal.noteLabel': 'Note interne, réservée aux administrateurs (facultatif)',
    'userSuspension.modal.notePlaceholder': 'Jamais affichée à l’utilisateur',
    'userSuspension.modal.tooLong': '{max} caractères au maximum.',
    'userSuspension.modal.tenantLabel':
      'Suspendre aussi cette adresse e-mail dans toutes les applications enfants et l’empêcher de s’inscrire à nouveau',
    'userSuspension.modal.tenantHelp':
      'Les comptes ayant la même adresse e-mail dans les applications enfants de cette application sont aussi suspendus, et cette adresse ne peut plus servir à s’inscrire dans cette application ni dans ses applications enfants. Laissez cette option désactivée pour suspendre uniquement le compte dans cette application.',
    'userSuspension.modal.confirm': 'Suspendre',
    'userSuspension.modal.cancel': 'Annuler',
    'userSuspension.modal.close': 'Fermer',
    'userSuspension.modal.working': 'Traitement en cours...',

    'userSuspension.unsuspend.title': 'Lever la suspension de {name} ?',
    'userSuspension.unsuspend.message': 'L’utilisateur pourra de nouveau se connecter et utiliser l’application.',
    'userSuspension.unsuspend.tenantLabel':
      'La lever aussi dans les applications enfants et autoriser de nouveau cette adresse e-mail à s’inscrire',

    'userSuspension.toast.suspended': 'Suspendus : {count}',
    'userSuspension.toast.alreadySuspended': 'Déjà suspendus : {count}',
    'userSuspension.toast.childApps': 'Aussi suspendus dans les applications enfants : {count}',
    'userSuspension.toast.failed': 'Non suspendus : {count}. {details}',
    'userSuspension.toast.suspendFailedPrefix': 'Échec de la suspension :',
    'userSuspension.toast.unsuspended': 'Suspension levée.',
    'userSuspension.toast.notSuspended': 'Cet utilisateur n’était pas suspendu.',
    'userSuspension.toast.unsuspendFailedPrefix': 'Échec de la levée de la suspension :',
    'userSuspension.error.CANNOT_SUSPEND_SELF': 'Vous ne pouvez pas suspendre votre propre compte.',
    'userSuspension.error.CANNOT_SUSPEND_OWNER': 'Le propriétaire de l’application ne peut pas être suspendu.',
    'userSuspension.error.CANNOT_SUSPEND_PRIVILEGED': 'Vous pouvez suspendre uniquement les utilisateurs dont le niveau d’accès est inférieur au vôtre.',
    'userSuspension.error.CANNOT_UNSUSPEND_PRIVILEGED': 'Cette suspension a été imposée à partir d’un niveau d’accès supérieur et ne peut être levée qu’à ce niveau.',
    'userSuspension.error.USER_INVALID_STATE': 'Les utilisateurs archivés ou supprimés ne peuvent pas être suspendus.',
    'userSuspension.error.USER_NOT_FOUND': 'Utilisateur introuvable.',

    'userSuspension.settings.supportHeading': 'Contact du support',
    'userSuspension.settings.supportDescription':
      'Affiché aux utilisateurs de cette application dont le compte est suspendu. Une adresse e-mail ou un lien https://. Laissez vide pour utiliser le contact de l’application parente ou celui du serveur par défaut.',
    'userSuspension.settings.supportPlaceholder': 'support@example.com ou https://example.com/help',
    'userSuspension.settings.supportInvalid': 'Saisissez une adresse e-mail ou un lien https://.',
    'userSuspension.settings.blockedHeading': 'Domaines e-mail bloqués à l’inscription',
    'userSuspension.settings.blockedDescription':
      'Les nouvelles inscriptions (par e-mail et première connexion par réseau social) avec une adresse e-mail de l’un de ces domaines sont refusées. Un motif par ligne. Un domaine couvre aussi ses sous-domaines (example.org couvre mail.example.org), et * correspond à exactement une partie du nom. S’applique uniquement à cette application, pas à ses applications enfants. Les comptes existants ne sont pas touchés.',
    'userSuspension.settings.blockedExamples': 'Exemples : *.sch.uk, *.k12.*.us, example.org',
    'userSuspension.settings.blockedInvalid': 'Motif de domaine non valide : {lines}',
    'userSuspension.settings.invalidToast': 'Corrigez les champs en rouge dans Options de connexion avant d’enregistrer.',
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
    'userSuspension.screen.contact': 'Si crees que es un error, comunícate con soporte:',
    'userSuspension.screen.back': 'Volver a iniciar sesión',

    'userSuspension.signupBlocked': 'No se permite el registro con esta dirección de correo electrónico.',

    'userSuspension.tab': 'Suspendidos',
    'userSuspension.badge': 'Suspendido',
    'userSuspension.badgeTooltip.reason': 'Motivo: {reason}',
    'userSuspension.badgeTooltip.since': 'Desde: {date}',
    'userSuspension.badgeTooltip.until': 'Hasta: {date}',
    'userSuspension.badgeTooltip.tenant': 'También se aplica en las aplicaciones hijas; registro bloqueado',
    'userSuspension.badgeTooltip.note': 'Nota interna: {note}',
    'userSuspension.action.suspend': 'Suspender',
    'userSuspension.action.suspendTitle':
      'Bloquea el inicio de sesión y el acceso a la API; la cuenta y sus datos se conservan',
    'userSuspension.action.unsuspend': 'Levantar suspensión',
    'userSuspension.action.unsuspendTitle': 'Levantar la suspensión',

    'userSuspension.modal.titleOne': '¿Suspender a {name}?',
    'userSuspension.modal.titleMany': '¿Suspender a {count} usuarios?',
    'userSuspension.modal.intro':
      'Un usuario suspendido no puede iniciar sesión y sus sesiones abiertas se cierran. La cuenta y sus datos se conservan y puedes levantar la suspensión en cualquier momento. No es lo mismo que archivar.',
    'userSuspension.modal.reasonLabel': 'Motivo',
    'userSuspension.modal.reasonPlaceholder': 'Elige un motivo',
    'userSuspension.modal.messageLabel': 'Mensaje que se muestra al usuario (opcional)',
    'userSuspension.modal.messagePlaceholder': 'Se muestra en la pantalla "Cuenta suspendida"',
    'userSuspension.modal.noteLabel': 'Nota interna, solo para administradores (opcional)',
    'userSuspension.modal.notePlaceholder': 'Nunca se muestra al usuario',
    'userSuspension.modal.tooLong': 'Máximo {max} caracteres.',
    'userSuspension.modal.tenantLabel':
      'Suspender también este correo electrónico en todas las aplicaciones hijas e impedir que vuelva a registrarse',
    'userSuspension.modal.tenantHelp':
      'Las cuentas con la misma dirección de correo electrónico en las aplicaciones hijas de esta aplicación también se suspenden, y la dirección ya no puede registrarse en esta aplicación ni en sus aplicaciones hijas. Déjalo desactivado para suspender solo la cuenta en esta aplicación.',
    'userSuspension.modal.confirm': 'Suspender',
    'userSuspension.modal.cancel': 'Cancelar',
    'userSuspension.modal.close': 'Cerrar',
    'userSuspension.modal.working': 'Procesando...',

    'userSuspension.unsuspend.title': '¿Levantar la suspensión de {name}?',
    'userSuspension.unsuspend.message': 'El usuario podrá volver a iniciar sesión y usar la aplicación.',
    'userSuspension.unsuspend.tenantLabel':
      'Levantarla también en las aplicaciones hijas y permitir que este correo electrónico vuelva a registrarse',

    'userSuspension.toast.suspended': 'Suspendidos: {count}',
    'userSuspension.toast.alreadySuspended': 'Ya estaban suspendidos: {count}',
    'userSuspension.toast.childApps': 'También suspendidos en aplicaciones hijas: {count}',
    'userSuspension.toast.failed': 'No suspendidos: {count}. {details}',
    'userSuspension.toast.suspendFailedPrefix': 'Error al suspender:',
    'userSuspension.toast.unsuspended': 'Suspensión levantada.',
    'userSuspension.toast.notSuspended': 'Este usuario no estaba suspendido.',
    'userSuspension.toast.unsuspendFailedPrefix': 'Error al levantar la suspensión:',
    'userSuspension.error.CANNOT_SUSPEND_SELF': 'No puedes suspender tu propia cuenta.',
    'userSuspension.error.CANNOT_SUSPEND_OWNER': 'No se puede suspender al propietario de la aplicación.',
    'userSuspension.error.CANNOT_SUSPEND_PRIVILEGED': 'Solo puedes suspender a usuarios con un nivel de acceso inferior al tuyo.',
    'userSuspension.error.CANNOT_UNSUSPEND_PRIVILEGED': 'Esta suspensión se impuso desde un nivel de acceso superior y solo se puede levantar desde ese nivel.',
    'userSuspension.error.USER_INVALID_STATE': 'No se puede suspender a usuarios archivados o eliminados.',
    'userSuspension.error.USER_NOT_FOUND': 'Usuario no encontrado.',

    'userSuspension.settings.supportHeading': 'Contacto de soporte',
    'userSuspension.settings.supportDescription':
      'Se muestra a los usuarios de esta aplicación cuya cuenta está suspendida. Una dirección de correo electrónico o un enlace https://. Déjalo vacío para usar el contacto de la aplicación principal o el predeterminado del servidor.',
    'userSuspension.settings.supportPlaceholder': 'support@example.com o https://example.com/help',
    'userSuspension.settings.supportInvalid': 'Introduce una dirección de correo electrónico o un enlace https://.',
    'userSuspension.settings.blockedHeading': 'Dominios de correo bloqueados para el registro',
    'userSuspension.settings.blockedDescription':
      'Se rechazan los nuevos registros (por correo electrónico y primer inicio de sesión con redes sociales) con una dirección de correo de uno de estos dominios. Un patrón por línea. Un dominio también abarca sus subdominios (example.org abarca mail.example.org), y * coincide con exactamente una parte del nombre. Se aplica solo a esta aplicación, no a sus aplicaciones hijas. Las cuentas existentes no se ven afectadas.',
    'userSuspension.settings.blockedExamples': 'Ejemplos: *.sch.uk, *.k12.*.us, example.org',
    'userSuspension.settings.blockedInvalid': 'No es un patrón de dominio: {lines}',
    'userSuspension.settings.invalidToast': 'Corrige los campos marcados en rojo en Opciones de acceso antes de guardar.',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
