import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Sign-up IP blocks (docs/TRUST_AND_SAFETY.md section 15): the Blocked IPs
// tab of the T&S hub, its Overview tile and the IPs panel of the Suspended
// users tab. Plus the "Suspended" badge the web app shows next to other
// people's names (section 16). Placeholders ({ip}, {count}, ...) are filled
// with replace().

const en: Record<string, string> = {
  'tsHub.tab.ipBlocks': 'Blocked IPs',
  'tsHub.overview.count.ipBlocks': 'Blocked IPs',

  // ---- Blocked IPs tab ----
  'tsHub.ipBlocks.intro':
    'Addresses and ranges that cannot create new accounts. Existing accounts can still sign in from them.',
  'tsHub.ipBlocks.addButton': 'Block an IP',
  'tsHub.ipBlocks.searchPlaceholder': 'Search IP, note or email',
  'tsHub.ipBlocks.includeExpired': 'Include expired',
  'tsHub.ipBlocks.empty': 'No IP address is blocked from signing up.',
  'tsHub.ipBlocks.emptyFiltered': 'No block matches these filters.',
  'tsHub.ipBlocks.col.ip': 'IP or range',
  'tsHub.ipBlocks.col.scope': 'Applies to',
  'tsHub.ipBlocks.col.expires': 'Expires',
  'tsHub.ipBlocks.col.reason': 'Note',
  'tsHub.ipBlocks.col.source': 'Source account',
  'tsHub.ipBlocks.col.hits': 'Refused sign-ups',
  'tsHub.ipBlocks.col.lastHit': 'Last refused',
  'tsHub.ipBlocks.col.status': 'Status',
  'tsHub.ipBlocks.col.actions': 'Actions',
  'tsHub.ipBlocks.status.active': 'Active',
  'tsHub.ipBlocks.status.expired': 'Expired',
  'tsHub.ipBlocks.permanent': 'Permanent',
  'tsHub.ipBlocks.days': '{count} days',
  'tsHub.ipBlocks.remove': 'Remove',
  'tsHub.ipBlocks.removeTitle': 'Remove the block on {ip}?',
  'tsHub.ipBlocks.removeMessage':
    'New sign-ups from this address will be allowed again ({scope}).',
  'tsHub.ipBlocks.toast.added': 'Sign-ups from {ip} are blocked.',
  'tsHub.ipBlocks.toast.removed': 'The block on {ip} was removed.',
  'tsHub.ipBlocks.toast.removeFailed': 'Could not remove the block: {error}',

  // ---- Add dialog ----
  'tsHub.ipBlocks.addTitle': 'Block sign-ups from an IP',
  'tsHub.ipBlocks.addIntro':
    'New accounts cannot be created from this address or range. Blocking the same address again for the same scope updates the existing block.',
  'tsHub.ipBlocks.field.ip': 'IP address or range (CIDR)',
  'tsHub.ipBlocks.ipHelp':
    'A single address, or a range such as 203.0.113.0/24. Ranges wider than /16 (IPv4) or /48 (IPv6) are not allowed.',
  'tsHub.ipBlocks.ipProblem.required': 'Enter an IP address or a range.',
  'tsHub.ipBlocks.ipProblem.invalid':
    'This is not a valid IP address or range.',
  'tsHub.ipBlocks.ipProblem.tooWide':
    'This range is too wide. Use /16 or narrower for IPv4, /48 or narrower for IPv6.',
  'tsHub.ipBlocks.field.scope': 'Applies to',
  'tsHub.ipBlocks.scope.all': 'All apps',
  'tsHub.ipBlocks.scope.one': 'One app',
  'tsHub.ipBlocks.scope.pick': 'Choose an app...',
  'tsHub.ipBlocks.scope.required': 'Choose the app.',
  'tsHub.ipBlocks.scopeHelp': 'A block on an app also covers its child apps.',
  'tsHub.ipBlocks.field.duration': 'Duration',
  'tsHub.ipBlocks.field.reason': 'Note (internal)',
  'tsHub.ipBlocks.reasonPlaceholder':
    'Why this address is blocked. Only admins see this.',
  'tsHub.ipBlocks.add': 'Block',

  // ---- API error codes ----
  'tsHub.ipBlocks.error.INVALID_IP':
    'The server did not accept this IP address or range. Check it and try again.',
  'tsHub.ipBlocks.error.IP_RANGE_TOO_WIDE':
    'This range is too wide. Ranges wider than /16 (IPv4) or /48 (IPv6) are refused so that a whole provider is not blocked by mistake.',
  'tsHub.ipBlocks.error.IP_BLOCK_LIMIT':
    'The limit of active IP blocks has been reached. Remove blocks that are no longer needed, then try again.',

  // ---- Suspended users > IPs ----
  'tsHub.userIps.action': 'IPs',
  'tsHub.userIps.actionTitle':
    'Addresses this account was seen from, and other accounts on them',
  'tsHub.userIps.title': 'IP addresses of {name}',
  'tsHub.userIps.intro':
    'Where this account signed up or signed in from. Block sign-ups stops new accounts from an address in all apps for 30 days; existing accounts can still sign in.',
  'tsHub.userIps.manageLink': 'Manage blocked IPs',
  'tsHub.userIps.empty': 'No addresses were recorded for this account.',
  'tsHub.userIps.firstSeen': 'First seen: {date}',
  'tsHub.userIps.lastSeen': 'Last seen: {date}',
  'tsHub.userIps.count': 'Seen {count} times',
  'tsHub.userIps.source.registration': 'Sign-up',
  'tsHub.userIps.source.session': 'Sign-in',
  'tsHub.userIps.others': 'Other accounts on this address ({count})',
  'tsHub.userIps.noOthers': 'No other accounts were seen on this address.',
  'tsHub.userIps.block': 'Block sign-ups',
  'tsHub.userIps.blockTitle':
    'Block new accounts from this address in all apps for 30 days',
  'tsHub.userIps.blockedUntil': 'Blocked until {date}',
  'tsHub.userIps.blockedPermanent': 'Blocked permanently',
  'tsHub.userIps.blockedForApp': 'in {app}',
  'tsHub.userIps.blockFailed': 'Could not block sign-ups: {error}',
  'tsHub.userIps.reason': 'Ban evasion: {email}',

  // ---- Other people's suspended accounts (section 16) ----
  'peerSuspension.badge': 'Suspended',
  'peerSuspension.badgeTitle': 'This account is suspended',
};

const fr: Record<string, string> = {
  'tsHub.tab.ipBlocks': 'IP bloquées',
  'tsHub.overview.count.ipBlocks': 'IP bloquées',

  'tsHub.ipBlocks.intro':
    "Adresses et plages qui ne peuvent pas créer de nouveaux comptes. Les comptes existants peuvent toujours s'y connecter.",
  'tsHub.ipBlocks.addButton': 'Bloquer une IP',
  'tsHub.ipBlocks.searchPlaceholder':
    'Rechercher une IP, une note ou un e-mail',
  'tsHub.ipBlocks.includeExpired': 'Inclure les blocages expirés',
  'tsHub.ipBlocks.empty': "Aucune adresse IP n'est bloquée pour l'inscription.",
  'tsHub.ipBlocks.emptyFiltered': 'Aucun blocage ne correspond à ces filtres.',
  'tsHub.ipBlocks.col.ip': 'IP ou plage',
  'tsHub.ipBlocks.col.scope': "S'applique à",
  'tsHub.ipBlocks.col.expires': 'Expire',
  'tsHub.ipBlocks.col.reason': 'Note',
  'tsHub.ipBlocks.col.source': "Compte d'origine",
  'tsHub.ipBlocks.col.hits': 'Inscriptions refusées',
  'tsHub.ipBlocks.col.lastHit': 'Dernier refus',
  'tsHub.ipBlocks.col.status': 'État',
  'tsHub.ipBlocks.col.actions': 'Actions',
  'tsHub.ipBlocks.status.active': 'Actif',
  'tsHub.ipBlocks.status.expired': 'Expiré',
  'tsHub.ipBlocks.permanent': 'Permanent',
  'tsHub.ipBlocks.days': '{count} jours',
  'tsHub.ipBlocks.remove': 'Supprimer',
  'tsHub.ipBlocks.removeTitle': 'Supprimer le blocage de {ip} ?',
  'tsHub.ipBlocks.removeMessage':
    'Les nouvelles inscriptions depuis cette adresse seront de nouveau autorisées ({scope}).',
  'tsHub.ipBlocks.toast.added': 'Les inscriptions depuis {ip} sont bloquées.',
  'tsHub.ipBlocks.toast.removed': 'Le blocage de {ip} a été supprimé.',
  'tsHub.ipBlocks.toast.removeFailed':
    'Impossible de supprimer le blocage : {error}',

  'tsHub.ipBlocks.addTitle': 'Bloquer les inscriptions depuis une IP',
  'tsHub.ipBlocks.addIntro':
    'Aucun nouveau compte ne peut être créé depuis cette adresse ou cette plage. Bloquer à nouveau la même adresse pour la même portée met à jour le blocage existant.',
  'tsHub.ipBlocks.field.ip': 'Adresse IP ou plage (CIDR)',
  'tsHub.ipBlocks.ipHelp':
    'Une seule adresse, ou une plage comme 203.0.113.0/24. Les plages plus larges que /16 (IPv4) ou /48 (IPv6) ne sont pas autorisées.',
  'tsHub.ipBlocks.ipProblem.required': 'Saisissez une adresse IP ou une plage.',
  'tsHub.ipBlocks.ipProblem.invalid':
    "Ce n'est pas une adresse IP ou une plage valide.",
  'tsHub.ipBlocks.ipProblem.tooWide':
    'Cette plage est trop large. Utilisez /16 ou plus étroit en IPv4, /48 ou plus étroit en IPv6.',
  'tsHub.ipBlocks.field.scope': "S'applique à",
  'tsHub.ipBlocks.scope.all': 'Toutes les applications',
  'tsHub.ipBlocks.scope.one': 'Une application',
  'tsHub.ipBlocks.scope.pick': 'Choisir une application...',
  'tsHub.ipBlocks.scope.required': "Choisissez l'application.",
  'tsHub.ipBlocks.scopeHelp':
    'Un blocage sur une application couvre aussi ses applications enfants.',
  'tsHub.ipBlocks.field.duration': 'Durée',
  'tsHub.ipBlocks.field.reason': 'Note (interne)',
  'tsHub.ipBlocks.reasonPlaceholder':
    'Pourquoi cette adresse est bloquée. Visible uniquement par les administrateurs.',
  'tsHub.ipBlocks.add': 'Bloquer',

  'tsHub.ipBlocks.error.INVALID_IP':
    "Le serveur n'a pas accepté cette adresse IP ou cette plage. Vérifiez-la et réessayez.",
  'tsHub.ipBlocks.error.IP_RANGE_TOO_WIDE':
    'Cette plage est trop large. Les plages plus larges que /16 (IPv4) ou /48 (IPv6) sont refusées pour ne pas bloquer tout un fournisseur par erreur.',
  'tsHub.ipBlocks.error.IP_BLOCK_LIMIT':
    'La limite de blocages IP actifs est atteinte. Supprimez les blocages devenus inutiles, puis réessayez.',

  'tsHub.userIps.action': 'IP',
  'tsHub.userIps.actionTitle':
    'Adresses depuis lesquelles ce compte a été vu, et autres comptes sur ces adresses',
  'tsHub.userIps.title': 'Adresses IP de {name}',
  'tsHub.userIps.intro':
    "D'où ce compte s'est inscrit ou connecté. Bloquer les inscriptions empêche la création de nouveaux comptes depuis une adresse dans toutes les applications pendant 30 jours ; les comptes existants peuvent toujours se connecter.",
  'tsHub.userIps.manageLink': 'Gérer les IP bloquées',
  'tsHub.userIps.empty': "Aucune adresse n'a été enregistrée pour ce compte.",
  'tsHub.userIps.firstSeen': 'Vu pour la première fois : {date}',
  'tsHub.userIps.lastSeen': 'Vu pour la dernière fois : {date}',
  'tsHub.userIps.count': 'Vu {count} fois',
  'tsHub.userIps.source.registration': 'Inscription',
  'tsHub.userIps.source.session': 'Connexion',
  'tsHub.userIps.others': 'Autres comptes sur cette adresse ({count})',
  'tsHub.userIps.noOthers': "Aucun autre compte n'a été vu sur cette adresse.",
  'tsHub.userIps.block': 'Bloquer les inscriptions',
  'tsHub.userIps.blockTitle':
    'Bloquer les nouveaux comptes depuis cette adresse dans toutes les applications pendant 30 jours',
  'tsHub.userIps.blockedUntil': "Bloquée jusqu'au {date}",
  'tsHub.userIps.blockedPermanent': 'Bloquée définitivement',
  'tsHub.userIps.blockedForApp': 'dans {app}',
  'tsHub.userIps.blockFailed':
    'Impossible de bloquer les inscriptions : {error}',
  'tsHub.userIps.reason': 'Contournement de suspension : {email}',

  'peerSuspension.badge': 'Suspendu',
  'peerSuspension.badgeTitle': 'Ce compte est suspendu',
};

const es: Record<string, string> = {
  'tsHub.tab.ipBlocks': 'IP bloqueadas',
  'tsHub.overview.count.ipBlocks': 'IP bloqueadas',

  'tsHub.ipBlocks.intro':
    'Direcciones y rangos desde los que no se pueden crear cuentas nuevas. Las cuentas existentes pueden seguir iniciando sesión desde ellos.',
  'tsHub.ipBlocks.addButton': 'Bloquear una IP',
  'tsHub.ipBlocks.searchPlaceholder': 'Buscar IP, nota o correo',
  'tsHub.ipBlocks.includeExpired': 'Incluir caducados',
  'tsHub.ipBlocks.empty':
    'No hay ninguna dirección IP bloqueada para el registro.',
  'tsHub.ipBlocks.emptyFiltered': 'Ningún bloqueo coincide con estos filtros.',
  'tsHub.ipBlocks.col.ip': 'IP o rango',
  'tsHub.ipBlocks.col.scope': 'Se aplica a',
  'tsHub.ipBlocks.col.expires': 'Caduca',
  'tsHub.ipBlocks.col.reason': 'Nota',
  'tsHub.ipBlocks.col.source': 'Cuenta de origen',
  'tsHub.ipBlocks.col.hits': 'Registros rechazados',
  'tsHub.ipBlocks.col.lastHit': 'Último rechazo',
  'tsHub.ipBlocks.col.status': 'Estado',
  'tsHub.ipBlocks.col.actions': 'Acciones',
  'tsHub.ipBlocks.status.active': 'Activo',
  'tsHub.ipBlocks.status.expired': 'Caducado',
  'tsHub.ipBlocks.permanent': 'Permanente',
  'tsHub.ipBlocks.days': '{count} días',
  'tsHub.ipBlocks.remove': 'Quitar',
  'tsHub.ipBlocks.removeTitle': '¿Quitar el bloqueo de {ip}?',
  'tsHub.ipBlocks.removeMessage':
    'Se volverán a permitir los registros nuevos desde esta dirección ({scope}).',
  'tsHub.ipBlocks.toast.added': 'Los registros desde {ip} están bloqueados.',
  'tsHub.ipBlocks.toast.removed': 'Se quitó el bloqueo de {ip}.',
  'tsHub.ipBlocks.toast.removeFailed': 'No se pudo quitar el bloqueo: {error}',

  'tsHub.ipBlocks.addTitle': 'Bloquear registros desde una IP',
  'tsHub.ipBlocks.addIntro':
    'No se podrán crear cuentas nuevas desde esta dirección o rango. Bloquear de nuevo la misma dirección con el mismo alcance actualiza el bloqueo existente.',
  'tsHub.ipBlocks.field.ip': 'Dirección IP o rango (CIDR)',
  'tsHub.ipBlocks.ipHelp':
    'Una sola dirección, o un rango como 203.0.113.0/24. No se permiten rangos más amplios que /16 (IPv4) o /48 (IPv6).',
  'tsHub.ipBlocks.ipProblem.required': 'Introduce una dirección IP o un rango.',
  'tsHub.ipBlocks.ipProblem.invalid':
    'No es una dirección IP ni un rango válido.',
  'tsHub.ipBlocks.ipProblem.tooWide':
    'Este rango es demasiado amplio. Usa /16 o más estrecho en IPv4, /48 o más estrecho en IPv6.',
  'tsHub.ipBlocks.field.scope': 'Se aplica a',
  'tsHub.ipBlocks.scope.all': 'Todas las aplicaciones',
  'tsHub.ipBlocks.scope.one': 'Una aplicación',
  'tsHub.ipBlocks.scope.pick': 'Elige una aplicación...',
  'tsHub.ipBlocks.scope.required': 'Elige la aplicación.',
  'tsHub.ipBlocks.scopeHelp':
    'Un bloqueo en una aplicación también cubre sus aplicaciones hijas.',
  'tsHub.ipBlocks.field.duration': 'Duración',
  'tsHub.ipBlocks.field.reason': 'Nota (interna)',
  'tsHub.ipBlocks.reasonPlaceholder':
    'Por qué se bloquea esta dirección. Solo la ven los administradores.',
  'tsHub.ipBlocks.add': 'Bloquear',

  'tsHub.ipBlocks.error.INVALID_IP':
    'El servidor no aceptó esta dirección IP o rango. Revísalo y vuelve a intentarlo.',
  'tsHub.ipBlocks.error.IP_RANGE_TOO_WIDE':
    'Este rango es demasiado amplio. Se rechazan los rangos más amplios que /16 (IPv4) o /48 (IPv6) para no bloquear a todo un proveedor por error.',
  'tsHub.ipBlocks.error.IP_BLOCK_LIMIT':
    'Se ha alcanzado el límite de bloqueos de IP activos. Quita los bloqueos que ya no hagan falta y vuelve a intentarlo.',

  'tsHub.userIps.action': 'IP',
  'tsHub.userIps.actionTitle':
    'Direcciones desde las que se vio esta cuenta y otras cuentas en ellas',
  'tsHub.userIps.title': 'Direcciones IP de {name}',
  'tsHub.userIps.intro':
    'Desde dónde se registró o inició sesión esta cuenta. Bloquear registros impide crear cuentas nuevas desde una dirección en todas las aplicaciones durante 30 días; las cuentas existentes pueden seguir iniciando sesión.',
  'tsHub.userIps.manageLink': 'Gestionar las IP bloqueadas',
  'tsHub.userIps.empty': 'No se registró ninguna dirección para esta cuenta.',
  'tsHub.userIps.firstSeen': 'Vista por primera vez: {date}',
  'tsHub.userIps.lastSeen': 'Vista por última vez: {date}',
  'tsHub.userIps.count': 'Vista {count} veces',
  'tsHub.userIps.source.registration': 'Registro',
  'tsHub.userIps.source.session': 'Inicio de sesión',
  'tsHub.userIps.others': 'Otras cuentas en esta dirección ({count})',
  'tsHub.userIps.noOthers': 'No se vio ninguna otra cuenta en esta dirección.',
  'tsHub.userIps.block': 'Bloquear registros',
  'tsHub.userIps.blockTitle':
    'Bloquear cuentas nuevas desde esta dirección en todas las aplicaciones durante 30 días',
  'tsHub.userIps.blockedUntil': 'Bloqueada hasta el {date}',
  'tsHub.userIps.blockedPermanent': 'Bloqueada de forma permanente',
  'tsHub.userIps.blockedForApp': 'en {app}',
  'tsHub.userIps.blockFailed': 'No se pudieron bloquear los registros: {error}',
  'tsHub.userIps.reason': 'Evasión de suspensión: {email}',

  'peerSuspension.badge': 'Suspendida',
  'peerSuspension.badgeTitle': 'Esta cuenta está suspendida',
};

export const tsIpBlocks = {
  en,
  fr,
  es,
} satisfies Record<UiLanguageCode, Record<string, string>>;
