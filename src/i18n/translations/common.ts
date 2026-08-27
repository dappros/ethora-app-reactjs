import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Shared/high-traffic surfaces: main nav (desktop sidebar + mobile burger
// menu) and the language picker itself. Other app areas live in their own
// sibling file under src/i18n/translations/ (see index.ts for the full
// list) - keeps concurrent edits to different areas from touching the same
// file.
export const common = {
  en: {
    'nav.apps': 'Apps',
    'nav.chats': 'Chats',
    'nav.agents': 'Agents',
    'nav.billing': 'Billing',
    'nav.help': 'Help',
    'nav.profile': 'Profile',
    'nav.account': 'Account',

    'profile.about': 'About',
    'profile.documents': 'Documents',
    'profile.addDocument': 'Add Document',
    'profile.onlineOffline': 'Online / Offline',
    'profile.logout': 'Logout',
    'profile.language': 'App language',
    'profile.deleteDocument.title': 'Delete Document',
    'profile.deleteDocument.confirm':
      'Are you sure you want to delete document?',
    'profile.deleteDocument.cancel': 'Cancel',
    'profile.deleteDocument.delete': 'Delete',
    'profile.deleteDocument.success': 'Document deleted successfully',
    'profile.deleteDocument.error': 'Failed to delete document',

    'language.select': 'App language',
    'language.savedToast': 'Language preference saved',
    'language.saveFailedToast':
      "Language changed on this device, but couldn't be saved to your profile",
  },
  fr: {
    'nav.apps': 'Applications',
    'nav.chats': 'Discussions',
    'nav.agents': 'Agents',
    'nav.billing': 'Facturation',
    'nav.help': 'Aide',
    'nav.profile': 'Profil',
    'nav.account': 'Compte',

    'profile.about': 'À propos',
    'profile.documents': 'Documents',
    'profile.addDocument': 'Ajouter un document',
    'profile.onlineOffline': 'En ligne / Hors ligne',
    'profile.logout': 'Déconnexion',
    'profile.language': "Langue de l'application",
    'profile.deleteDocument.title': 'Supprimer le document',
    'profile.deleteDocument.confirm':
      'Êtes-vous sûr de vouloir supprimer ce document ?',
    'profile.deleteDocument.cancel': 'Annuler',
    'profile.deleteDocument.delete': 'Supprimer',
    'profile.deleteDocument.success': 'Document supprimé avec succès',
    'profile.deleteDocument.error': 'Échec de la suppression du document',

    'language.select': "Langue de l'application",
    'language.savedToast': 'Préférence de langue enregistrée',
    'language.saveFailedToast':
      "Langue modifiée sur cet appareil, mais impossible de l'enregistrer dans votre profil",
  },
  es: {
    'nav.apps': 'Aplicaciones',
    'nav.chats': 'Chats',
    'nav.agents': 'Agentes',
    'nav.billing': 'Facturación',
    'nav.help': 'Ayuda',
    'nav.profile': 'Perfil',
    'nav.account': 'Cuenta',

    'profile.about': 'Acerca de',
    'profile.documents': 'Documentos',
    'profile.addDocument': 'Añadir documento',
    'profile.onlineOffline': 'En línea / Desconectado',
    'profile.logout': 'Cerrar sesión',
    'profile.language': 'Idioma de la aplicación',
    'profile.deleteDocument.title': 'Eliminar documento',
    'profile.deleteDocument.confirm':
      '¿Estás seguro de que quieres eliminar este documento?',
    'profile.deleteDocument.cancel': 'Cancelar',
    'profile.deleteDocument.delete': 'Eliminar',
    'profile.deleteDocument.success': 'Documento eliminado correctamente',
    'profile.deleteDocument.error': 'No se pudo eliminar el documento',

    'language.select': 'Idioma de la aplicación',
    'language.savedToast': 'Preferencia de idioma guardada',
    'language.saveFailedToast':
      'Idioma cambiado en este dispositivo, pero no se pudo guardar en tu perfil',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
