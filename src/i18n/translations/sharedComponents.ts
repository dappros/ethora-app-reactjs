import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Static UI strings for small/shared components that don't belong to one
// specific app area: the per-app actions menu + preview tile (admin apps
// list), the "getting started" banner, the build/version footer, and a
// handful of generic primitives (copy button, secret reveal, sort popover,
// profile avatar menu, CSV export button, copy-to-clipboard button,
// pagination). Namespaced per component/file, e.g. 'copyButton.copiedToast',
// 'pagination.next' - keeps this file grep-able back to its source component.
export const sharedComponents = {
  en: {
    // AppActionsMenu.tsx
    'appActionsMenu.moreActions': 'More actions',
    'appActionsMenu.purging': 'purging...',
    'appActionsMenu.export': 'Export',
    'appActionsMenu.restore': 'Restore',
    'appActionsMenu.archive': 'Archive',
    'appActionsMenu.hardDelete': 'Hard delete',
    'appActionsMenu.unknownError': 'unknown',
    'appActionsMenu.toast.exported': 'Exported {name}',
    'appActionsMenu.toast.exportFailed': 'Export failed: {error}',
    'appActionsMenu.toast.archived': 'Archived {name}',
    'appActionsMenu.toast.archiveFailed': 'Archive failed: {error}',
    'appActionsMenu.toast.restored': 'Restored {name}',
    'appActionsMenu.toast.restoreFailed': 'Restore failed: {error}',
    'appActionsMenu.toast.hardDeleteQueued':
      'Hard delete queued for {name} (job {jobId}). The cascade runs in the background.',
    'appActionsMenu.toast.hardDeleteStarted': 'Hard delete started for {name}.',
    'appActionsMenu.toast.hardDeleteFailed': 'Hard delete failed: {error}',
    'appActionsMenu.confirmArchive.title': 'Archive this app?',
    'appActionsMenu.confirmArchive.message':
      "\"{name}\" will be hidden and its users won't be able to log in, but all data is retained. You can restore it later.",
    'appActionsMenu.confirmArchive.confirmLabel': 'Archive',
    'appActionsMenu.confirmHardDelete.title': 'Permanently delete this app?',
    'appActionsMenu.confirmHardDelete.intro':
      'and all related data will be irreversibly purged.',
    'appActionsMenu.confirmHardDelete.purgeListTitle':
      'The following will be permanently purged:',
    'appActionsMenu.confirmHardDelete.users': 'users',
    'appActionsMenu.confirmHardDelete.chatRooms': 'chat rooms',
    'appActionsMenu.confirmHardDelete.chatMessages': 'chat messages',
    'appActionsMenu.confirmHardDelete.files': 'files',
    'appActionsMenu.confirmHardDelete.appearanceConfig':
      'Appearance configuration (logo, colours etc)',
    'appActionsMenu.confirmHardDelete.defaultChatRoomsSettings':
      'Default chat rooms settings',
    'appActionsMenu.confirmHardDelete.aiData': 'AI data (website and documents RAG)',
    'appActionsMenu.confirmHardDelete.botInstances':
      'Bot instances and in-app AI Widget configuration',
    'appActionsMenu.confirmHardDelete.cannotBeUndone': 'This cannot be undone.',
    'appActionsMenu.confirmHardDelete.confirmLabel': 'Yes, hard delete',

    // ApplicationPreview.tsx
    'applicationPreview.archivedBadge': 'Archived',
    'applicationPreview.createdPrefix': 'Created',
    'applicationPreview.logoAlt': 'Logo',
    'applicationPreview.stats.users': 'Users',
    'applicationPreview.stats.usersTooltip': 'Users registered (total vs 24h)',
    'applicationPreview.stats.sessions': 'Sessions',
    'applicationPreview.stats.sessionsTooltip': 'User sessions (total vs 24h)',
    'applicationPreview.stats.chats': 'Chats',
    'applicationPreview.stats.chatsTooltip': 'Chat messages (total vs 24h)',
    'applicationPreview.stats.api': 'API',
    'applicationPreview.stats.apiTooltip': 'API calls (total vs 24h)',
    'applicationPreview.stats.ai': 'AI',
    'applicationPreview.stats.files': 'Files',
    'applicationPreview.stats.filesTooltip': 'Files (total vs 24h)',
    'applicationPreview.stats.web3': 'Web3',
    'applicationPreview.stats.web3Tooltip': 'Blockchain transactions (total vs 24h)',
    'applicationPreview.archived': 'Archived',
    'applicationPreview.details': 'Details',

    // ApplicationStarterInf.tsx
    'applicationStarterInf.intro':
      'Here you can Create, Manage and View applications depending on your permissions.',
    'applicationStarterInf.createBullet': 'Create: use the "Create App" button.',
    'applicationStarterInf.manageBullet':
      'Manage / View: click one of the available apps in the list.',

    // BuildVersionFooter.tsx
    'buildVersionFooter.tooltip':
      'Frontend & backend build versions (build date in yy.mm.dd · branch · commit)',

    // CopyButton.tsx
    'copyButton.copiedToast': 'Copied',

    // ProfilePageUserIcon.tsx
    'profilePageUserIcon.makePhoto': 'Make photo',
    'profilePageUserIcon.choosePhoto': 'Choose photo',
    'profilePageUserIcon.delete': 'Delete',

    // Secret.tsx
    'secret.clickToReveal': 'Click to reveal',
    'secret.hide': 'Hide',

    // Sorting.tsx
    'sorting.sortBy': 'Sort by',
    'sorting.az': '(A-Z)',
    'sorting.za': '(Z-A)',
    'sorting.order': 'Order',
    'sorting.sort': 'Sort',
    'sorting.ariaLabel': 'Server size',

    // UI/Buttons/CSVButton.tsx
    'csvButton.exportCsv': 'Export CSV',

    // UI/Buttons/CopyButtonText.tsx
    'copyButtonText.copied': 'Copied!',
    'copyButtonText.copy': 'Copy',
    'copyButtonText.ariaLabel': 'copy',

    // UI/Pagination/Pagination.tsx
    'pagination.next': 'Next →',
    'pagination.previous': '← Prev',
  },
  fr: {
    // AppActionsMenu.tsx
    'appActionsMenu.moreActions': "Plus d'actions",
    'appActionsMenu.purging': 'purge en cours...',
    'appActionsMenu.export': 'Exporter',
    'appActionsMenu.restore': 'Restaurer',
    'appActionsMenu.archive': 'Archiver',
    'appActionsMenu.hardDelete': 'Suppression définitive',
    'appActionsMenu.unknownError': 'inconnue',
    'appActionsMenu.toast.exported': '{name} exportée',
    'appActionsMenu.toast.exportFailed': "Échec de l'exportation : {error}",
    'appActionsMenu.toast.archived': '{name} archivée',
    'appActionsMenu.toast.archiveFailed': "Échec de l'archivage : {error}",
    'appActionsMenu.toast.restored': '{name} restaurée',
    'appActionsMenu.toast.restoreFailed': 'Échec de la restauration : {error}',
    'appActionsMenu.toast.hardDeleteQueued':
      "Suppression définitive mise en file d'attente pour {name} (tâche {jobId}). Le traitement s'exécute en arrière-plan.",
    'appActionsMenu.toast.hardDeleteStarted':
      'Suppression définitive démarrée pour {name}.',
    'appActionsMenu.toast.hardDeleteFailed':
      'Échec de la suppression définitive : {error}',
    'appActionsMenu.confirmArchive.title': 'Archiver cette application ?',
    'appActionsMenu.confirmArchive.message':
      '« {name} » sera masquée et ses utilisateurs ne pourront plus se connecter, mais toutes les données seront conservées. Vous pourrez la restaurer plus tard.',
    'appActionsMenu.confirmArchive.confirmLabel': 'Archiver',
    'appActionsMenu.confirmHardDelete.title':
      'Supprimer définitivement cette application ?',
    'appActionsMenu.confirmHardDelete.intro':
      'et toutes les données associées seront purgées de manière irréversible.',
    'appActionsMenu.confirmHardDelete.purgeListTitle':
      'Les éléments suivants seront définitivement purgés :',
    'appActionsMenu.confirmHardDelete.users': 'utilisateurs',
    'appActionsMenu.confirmHardDelete.chatRooms': 'salons de discussion',
    'appActionsMenu.confirmHardDelete.chatMessages': 'messages de discussion',
    'appActionsMenu.confirmHardDelete.files': 'fichiers',
    'appActionsMenu.confirmHardDelete.appearanceConfig':
      "Configuration de l'apparence (logo, couleurs, etc.)",
    'appActionsMenu.confirmHardDelete.defaultChatRoomsSettings':
      'Paramètres par défaut des salons de discussion',
    'appActionsMenu.confirmHardDelete.aiData': 'Données IA (site web et documents RAG)',
    'appActionsMenu.confirmHardDelete.botInstances':
      "Instances de bots et configuration du widget IA intégré à l'application",
    'appActionsMenu.confirmHardDelete.cannotBeUndone': 'Cette action est irréversible.',
    'appActionsMenu.confirmHardDelete.confirmLabel': 'Oui, supprimer définitivement',

    // ApplicationPreview.tsx
    'applicationPreview.archivedBadge': 'Archivée',
    'applicationPreview.createdPrefix': 'Créée le',
    'applicationPreview.logoAlt': 'Logo',
    'applicationPreview.stats.users': 'Utilisateurs',
    'applicationPreview.stats.usersTooltip': 'Utilisateurs inscrits (total vs 24h)',
    'applicationPreview.stats.sessions': 'Sessions',
    'applicationPreview.stats.sessionsTooltip': 'Sessions utilisateur (total vs 24h)',
    'applicationPreview.stats.chats': 'Discussions',
    'applicationPreview.stats.chatsTooltip': 'Messages de discussion (total vs 24h)',
    'applicationPreview.stats.api': 'API',
    'applicationPreview.stats.apiTooltip': 'Appels API (total vs 24h)',
    'applicationPreview.stats.ai': 'IA',
    'applicationPreview.stats.files': 'Fichiers',
    'applicationPreview.stats.filesTooltip': 'Fichiers (total vs 24h)',
    'applicationPreview.stats.web3': 'Web3',
    'applicationPreview.stats.web3Tooltip': 'Transactions blockchain (total vs 24h)',
    'applicationPreview.archived': 'Archivée',
    'applicationPreview.details': 'Détails',

    // ApplicationStarterInf.tsx
    'applicationStarterInf.intro':
      'Ici, vous pouvez créer, gérer et consulter des applications selon vos autorisations.',
    'applicationStarterInf.createBullet':
      'Créer : utilisez le bouton « Create App ».',
    'applicationStarterInf.manageBullet':
      "Gérer / Consulter : cliquez sur l'une des applications disponibles dans la liste.",

    // BuildVersionFooter.tsx
    'buildVersionFooter.tooltip':
      'Versions de build frontend et backend (date de build au format aa.mm.jj · branche · commit)',

    // CopyButton.tsx
    'copyButton.copiedToast': 'Copié',

    // ProfilePageUserIcon.tsx
    'profilePageUserIcon.makePhoto': 'Prendre une photo',
    'profilePageUserIcon.choosePhoto': 'Choisir une photo',
    'profilePageUserIcon.delete': 'Supprimer',

    // Secret.tsx
    'secret.clickToReveal': 'Cliquer pour révéler',
    'secret.hide': 'Masquer',

    // Sorting.tsx
    'sorting.sortBy': 'Trier par',
    'sorting.az': '(A-Z)',
    'sorting.za': '(Z-A)',
    'sorting.order': 'Ordre',
    'sorting.sort': 'Tri',
    'sorting.ariaLabel': 'Taille du serveur',

    // UI/Buttons/CSVButton.tsx
    'csvButton.exportCsv': 'Exporter en CSV',

    // UI/Buttons/CopyButtonText.tsx
    'copyButtonText.copied': 'Copié !',
    'copyButtonText.copy': 'Copier',
    'copyButtonText.ariaLabel': 'copier',

    // UI/Pagination/Pagination.tsx
    'pagination.next': 'Suivant →',
    'pagination.previous': '← Préc.',
  },
  es: {
    // AppActionsMenu.tsx
    'appActionsMenu.moreActions': 'Más acciones',
    'appActionsMenu.purging': 'purgando...',
    'appActionsMenu.export': 'Exportar',
    'appActionsMenu.restore': 'Restaurar',
    'appActionsMenu.archive': 'Archivar',
    'appActionsMenu.hardDelete': 'Eliminación definitiva',
    'appActionsMenu.unknownError': 'desconocido',
    'appActionsMenu.toast.exported': '{name} exportada',
    'appActionsMenu.toast.exportFailed': 'Error al exportar: {error}',
    'appActionsMenu.toast.archived': '{name} archivada',
    'appActionsMenu.toast.archiveFailed': 'Error al archivar: {error}',
    'appActionsMenu.toast.restored': '{name} restaurada',
    'appActionsMenu.toast.restoreFailed': 'Error al restaurar: {error}',
    'appActionsMenu.toast.hardDeleteQueued':
      'Eliminación definitiva en cola para {name} (tarea {jobId}). El proceso se ejecuta en segundo plano.',
    'appActionsMenu.toast.hardDeleteStarted':
      'Eliminación definitiva iniciada para {name}.',
    'appActionsMenu.toast.hardDeleteFailed':
      'Error al eliminar definitivamente: {error}',
    'appActionsMenu.confirmArchive.title': '¿Archivar esta aplicación?',
    'appActionsMenu.confirmArchive.message':
      '«{name}» quedará oculta y sus usuarios no podrán iniciar sesión, pero todos los datos se conservarán. Podrás restaurarla más tarde.',
    'appActionsMenu.confirmArchive.confirmLabel': 'Archivar',
    'appActionsMenu.confirmHardDelete.title':
      '¿Eliminar esta aplicación de forma permanente?',
    'appActionsMenu.confirmHardDelete.intro':
      'y todos los datos relacionados se purgarán de forma irreversible.',
    'appActionsMenu.confirmHardDelete.purgeListTitle':
      'Se purgará permanentemente lo siguiente:',
    'appActionsMenu.confirmHardDelete.users': 'usuarios',
    'appActionsMenu.confirmHardDelete.chatRooms': 'salas de chat',
    'appActionsMenu.confirmHardDelete.chatMessages': 'mensajes de chat',
    'appActionsMenu.confirmHardDelete.files': 'archivos',
    'appActionsMenu.confirmHardDelete.appearanceConfig':
      'Configuración de apariencia (logotipo, colores, etc.)',
    'appActionsMenu.confirmHardDelete.defaultChatRoomsSettings':
      'Configuración predeterminada de las salas de chat',
    'appActionsMenu.confirmHardDelete.aiData': 'Datos de IA (sitio web y documentos RAG)',
    'appActionsMenu.confirmHardDelete.botInstances':
      'Instancias de bots y configuración del widget de IA integrado',
    'appActionsMenu.confirmHardDelete.cannotBeUndone':
      'Esta acción no se puede deshacer.',
    'appActionsMenu.confirmHardDelete.confirmLabel': 'Sí, eliminar definitivamente',

    // ApplicationPreview.tsx
    'applicationPreview.archivedBadge': 'Archivada',
    'applicationPreview.createdPrefix': 'Creada el',
    'applicationPreview.logoAlt': 'Logo',
    'applicationPreview.stats.users': 'Usuarios',
    'applicationPreview.stats.usersTooltip': 'Usuarios registrados (total vs 24h)',
    'applicationPreview.stats.sessions': 'Sesiones',
    'applicationPreview.stats.sessionsTooltip': 'Sesiones de usuario (total vs 24h)',
    'applicationPreview.stats.chats': 'Chats',
    'applicationPreview.stats.chatsTooltip': 'Mensajes de chat (total vs 24h)',
    'applicationPreview.stats.api': 'API',
    'applicationPreview.stats.apiTooltip': 'Llamadas a la API (total vs 24h)',
    'applicationPreview.stats.ai': 'IA',
    'applicationPreview.stats.files': 'Archivos',
    'applicationPreview.stats.filesTooltip': 'Archivos (total vs 24h)',
    'applicationPreview.stats.web3': 'Web3',
    'applicationPreview.stats.web3Tooltip': 'Transacciones blockchain (total vs 24h)',
    'applicationPreview.archived': 'Archivada',
    'applicationPreview.details': 'Detalles',

    // ApplicationStarterInf.tsx
    'applicationStarterInf.intro':
      'Aquí puedes crear, gestionar y ver aplicaciones según tus permisos.',
    'applicationStarterInf.createBullet': 'Crear: usa el botón «Create App».',
    'applicationStarterInf.manageBullet':
      'Gestionar / Ver: haz clic en una de las aplicaciones disponibles en la lista.',

    // BuildVersionFooter.tsx
    'buildVersionFooter.tooltip':
      'Versiones de build de frontend y backend (fecha de build en formato aa.mm.dd · rama · commit)',

    // CopyButton.tsx
    'copyButton.copiedToast': 'Copiado',

    // ProfilePageUserIcon.tsx
    'profilePageUserIcon.makePhoto': 'Tomar foto',
    'profilePageUserIcon.choosePhoto': 'Elegir foto',
    'profilePageUserIcon.delete': 'Eliminar',

    // Secret.tsx
    'secret.clickToReveal': 'Haz clic para revelar',
    'secret.hide': 'Ocultar',

    // Sorting.tsx
    'sorting.sortBy': 'Ordenar por',
    'sorting.az': '(A-Z)',
    'sorting.za': '(Z-A)',
    'sorting.order': 'Orden',
    'sorting.sort': 'Ordenar',
    'sorting.ariaLabel': 'Tamaño del servidor',

    // UI/Buttons/CSVButton.tsx
    'csvButton.exportCsv': 'Exportar CSV',

    // UI/Buttons/CopyButtonText.tsx
    'copyButtonText.copied': '¡Copiado!',
    'copyButtonText.copy': 'Copiar',
    'copyButtonText.ariaLabel': 'copiar',

    // UI/Pagination/Pagination.tsx
    'pagination.next': 'Siguiente →',
    'pagination.previous': '← Ant.',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
