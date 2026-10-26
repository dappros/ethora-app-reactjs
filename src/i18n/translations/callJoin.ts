import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// The /call/:slug screens (src/pages/CallJoin.tsx): the join link of a
// scheduled call, which resolves the call and then opens its chat with the
// pre-join panel. Only the states that replace the chat are here; the panel
// itself is the chat component's.
export const callJoin = {
  en: {
    'callJoin.loading': 'Opening your call...',
    'callJoin.notFound.title': 'Call not found',
    'callJoin.notFound.description':
      'This call link is not valid. It may have been mistyped or the call was removed.',
    'callJoin.notMember.title': 'You are not a member of this chat',
    'callJoin.notMember.description':
      'This call belongs to a chat you are not part of. Ask the person who scheduled it to add you.',
    'callJoin.cancelled.title': 'This call was cancelled',
    'callJoin.cancelled.description':
      'The person who scheduled this call has cancelled it.',
    'callJoin.error.title': 'Could not open the call',
    'callJoin.error.description':
      'Something went wrong while loading this call. Check your connection and try again.',
    'callJoin.retry': 'Try again',
    'callJoin.goToChats': 'Go to chats',
  },
  fr: {
    'callJoin.loading': 'Ouverture de votre appel...',
    'callJoin.notFound.title': 'Appel introuvable',
    'callJoin.notFound.description':
      "Ce lien d'appel n'est pas valide. Il a peut-être été mal saisi ou l'appel a été supprimé.",
    'callJoin.notMember.title': "Vous n'êtes pas membre de ce chat",
    'callJoin.notMember.description':
      "Cet appel appartient à un chat dont vous ne faites pas partie. Demandez à la personne qui l'a planifié de vous ajouter.",
    'callJoin.cancelled.title': 'Cet appel a été annulé',
    'callJoin.cancelled.description':
      "La personne qui avait planifié cet appel l'a annulé.",
    'callJoin.error.title': "Impossible d'ouvrir l'appel",
    'callJoin.error.description':
      'Une erreur est survenue lors du chargement de cet appel. Vérifiez votre connexion et réessayez.',
    'callJoin.retry': 'Réessayer',
    'callJoin.goToChats': 'Aller aux chats',
  },
  es: {
    'callJoin.loading': 'Abriendo tu llamada...',
    'callJoin.notFound.title': 'Llamada no encontrada',
    'callJoin.notFound.description':
      'Este enlace de llamada no es válido. Puede que esté mal escrito o que la llamada se haya eliminado.',
    'callJoin.notMember.title': 'No eres miembro de este chat',
    'callJoin.notMember.description':
      'Esta llamada pertenece a un chat del que no formas parte. Pide a quien la programó que te añada.',
    'callJoin.cancelled.title': 'Esta llamada fue cancelada',
    'callJoin.cancelled.description':
      'La persona que programó esta llamada la ha cancelado.',
    'callJoin.error.title': 'No se pudo abrir la llamada',
    'callJoin.error.description':
      'Algo salió mal al cargar esta llamada. Revisa tu conexión e inténtalo de nuevo.',
    'callJoin.retry': 'Reintentar',
    'callJoin.goToChats': 'Ir a los chats',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
