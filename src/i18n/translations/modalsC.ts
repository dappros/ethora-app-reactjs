import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Static UI strings for a batch of small dialog/modal components under
// src/components/modal/ - DeleteAppModal, BookACallModal, and
// ReadyToCreateFirstAppModal. (DeleteProfileLinkModal, DeleteUserModal,
// CreateProfileLinkModal, QrModal, and SubmitModal are generic
// children-only wrapper shells with no static text of their own, so they
// have no namespace here.) Namespaced per component, e.g.
// 'deleteAppModal.cancel'.
//
// 'deleteAppModal.confirm' contains a `{appName}` placeholder that the
// component fills in with String.prototype.replace (no i18n library is in
// use, so this is a plain string substitution, not ICU MessageFormat).
export const modalsC = {
  en: {
    'deleteAppModal.confirm':
      'Are you sure? This irreversibly deletes {appName} and all of its contents',
    'deleteAppModal.cancel': 'Cancel',
    'deleteAppModal.delete': 'Delete',

    'bookACallModal.title': 'Book a call',
    'bookACallModal.closeLabel': 'Close',

    'readyToCreateFirstAppModal.title': 'Ready to Create Your First App?',
    'readyToCreateFirstAppModal.description':
      'Welcome to our platform! In just a few steps, you can launch your first app. Start building it now and take advantage of web3 technologies and integrated tools to grow your business or community.',
    'readyToCreateFirstAppModal.viewDemo': 'View Demo',
    'readyToCreateFirstAppModal.createApp': 'Create App',
  },
  fr: {
    'deleteAppModal.confirm':
      'Êtes-vous sûr ? Cela supprimera définitivement {appName} et tout son contenu',
    'deleteAppModal.cancel': 'Annuler',
    'deleteAppModal.delete': 'Supprimer',

    'bookACallModal.title': 'Réserver un appel',
    'bookACallModal.closeLabel': 'Fermer',

    'readyToCreateFirstAppModal.title':
      'Prêt à créer votre première application ?',
    'readyToCreateFirstAppModal.description':
      'Bienvenue sur notre plateforme ! En quelques étapes seulement, vous pouvez lancer votre première application. Commencez à la créer dès maintenant et profitez des technologies web3 et des outils intégrés pour développer votre entreprise ou votre communauté.',
    'readyToCreateFirstAppModal.viewDemo': 'Voir la démo',
    'readyToCreateFirstAppModal.createApp': 'Créer une application',
  },
  es: {
    'deleteAppModal.confirm':
      '¿Estás seguro? Esto eliminará de forma irreversible {appName} y todo su contenido',
    'deleteAppModal.cancel': 'Cancelar',
    'deleteAppModal.delete': 'Eliminar',

    'bookACallModal.title': 'Reservar una llamada',
    'bookACallModal.closeLabel': 'Cerrar',

    'readyToCreateFirstAppModal.title':
      '¿Listo para crear tu primera aplicación?',
    'readyToCreateFirstAppModal.description':
      '¡Bienvenido a nuestra plataforma! En solo unos pasos, puedes lanzar tu primera aplicación. Empieza a crearla ahora y aprovecha las tecnologías web3 y las herramientas integradas para hacer crecer tu negocio o comunidad.',
    'readyToCreateFirstAppModal.viewDemo': 'Ver demo',
    'readyToCreateFirstAppModal.createApp': 'Crear aplicación',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
