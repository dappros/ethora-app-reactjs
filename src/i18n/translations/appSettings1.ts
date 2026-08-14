import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Per-App "Settings" area (src/pages/AppSettings/*). Split across several
// components (tabs), so keys are namespaced per source file:
// appSettings.* (AppSettings.tsx - shell, tab labels, toasts),
// appSettingsAppearance.* (Appearance.tsx),
// appSettingsApi.* (Api.tsx),
// appSettingsChats.* (Chats.tsx),
// appSettingsCryptoRewards.* (CryptoRewards.tsx),
// appSettingsDelete.* (DeleteSetting.tsx).
//
// Some values contain a `{placeholder}` token (e.g. `{name}`, `{count}`,
// `{error}`) because `t()` is a plain key -> string lookup with no
// interpolation support - callers do `t(key).replace('{token}', value)`.
export const appSettings1 = {
  en: {
    // appSettings.* - AppSettings.tsx
    'appSettings.heading': 'Settings',
    'appSettings.infoAriaLabel': 'Info',
    'appSettings.saveButton': 'Save',
    'appSettings.tab.aiWidget': 'AI Widget',
    'appSettings.tab.webApp': 'Web App',
    'appSettings.tab.mobileApp': 'Mobile App',
    'appSettings.tab.appearance': 'Appearance',
    'appSettings.tab.signOnOptions': 'Sign-on options',
    'appSettings.tab.homeScreen': 'Home screen',
    'appSettings.tab.menu': 'Menu',
    'appSettings.tab.chats': 'Chats',
    'appSettings.tab.visibilityPrivacy': 'Visibility & Privacy',
    'appSettings.tab.api': 'API',
    'appSettings.tab.deleteOrArchive': 'Delete or Archive',
    'appSettings.section.publish': 'Publish',
    'appSettings.section.ui': 'UI',
    'appSettings.section.system': 'System',
    'appSettings.toast.botNameTooShort':
      'The AI bot name must be at least 3 characters long',
    'appSettings.toast.settingsApplied': 'Settings applied successfully!',
    'appSettings.toast.appDeleted':
      'You have successfully deleted your application',

    // appSettingsAppearance.* - Appearance.tsx
    'appSettingsAppearance.displayNameLabel': 'Display Name',
    'appSettingsAppearance.displayNamePlaceholder': "Enter App's Name",
    'appSettingsAppearance.taglineLabel': 'Tagline',
    'appSettingsAppearance.taglinePlaceholder': 'Enter Tagline of Your App',
    'appSettingsAppearance.colorLabel': 'Color',
    'appSettingsAppearance.logoLabel': 'Logo',
    'appSettingsAppearance.logoRecommendedSize':
      '(Recommended size: 500px x 500px)',
    'appSettingsAppearance.addLogoButton': 'Add logo',

    // appSettingsApi.* - Api.tsx
    'appSettingsApi.heading': 'App Access Key',
    'appSettingsApi.description':
      'For accessing Ethora API and infrastructure, your App uses a Key and Secret pair. With this key pair, your applications can generate JWT tokens etc for authentication and signing API requests.',
    'appSettingsApi.rotateNote':
      "Note: “Rotate” will replace your key pair with a new one. This will invalidate access for your application code until it's updated with new credentials.",
    'appSettingsApi.keyColumn': 'Key',
    'appSettingsApi.secretColumn': 'Secret',

    // appSettingsChats.* - Chats.tsx
    'appSettingsChats.deleteButton': 'Delete',
    'appSettingsChats.newChatsHeading': 'New Chats',
    'appSettingsChats.allowUsersCreateLabel':
      'Allow Users to create new Chats',
    'appSettingsChats.allowUsersCreateHelp':
      'When enabled, your Users can create new Chats and invite other Users there. When disabled, only pre-existing Chats or Chats created by your business can be used.',
    'appSettingsChats.pinnedChatsHeading': 'Pinned Chats',
    'appSettingsChats.pinnedChatsHelp':
      'Pinned or “starred” Chats are permanent chat rooms that your Users will automatically see and join.',
    'appSettingsChats.listOfChatsLabel': 'List of chats',
    'appSettingsChats.addNewChatButton': 'Add New Chat',
    'appSettingsChats.noChatsEmptyState':
      "There are no chats yet, or you can add them by clicking the 'Add New Chat' button",
    'appSettingsChats.chatNameColumn': 'Chat Name',
    'appSettingsChats.createdByColumn': 'Created By',
    'appSettingsChats.botsColumn': 'Bots',
    'appSettingsChats.defaultBroadcastSenderHeading':
      'Default Broadcast Sender',
    'appSettingsChats.defaultBroadcastSenderHelp':
      'Identity stamped on broadcast announcements when no per-broadcast override is set. Leave blank to use the App display name as the sender.',
    'appSettingsChats.senderNameLabel': 'Sender name',
    'appSettingsChats.senderNamePlaceholder': 'e.g. Acme Health',
    'appSettingsChats.avatarUrlOptionalLabel': 'Avatar URL (optional)',
    'appSettingsChats.broadcastMessageHeading': 'Broadcast Message',
    'appSettingsChats.broadcastMessageHelp':
      'Send an announcement to your chats. You can broadcast to all chats, or choose a subset from your pinned rooms list.',
    'appSettingsChats.allChatsRadioLabel': 'All chats (recommended)',
    'appSettingsChats.selectedPinnedChatsRadioLabel': 'Selected pinned chats',
    'appSettingsChats.noPinnedRoomsFound':
      'No pinned rooms found. Add pinned chats above or switch to “All chats”.',
    'appSettingsChats.overrideSenderLabel':
      'Override sender for this broadcast',
    'appSettingsChats.overrideSenderNamePlaceholder':
      'Sender name (e.g. CEO Update)',
    'appSettingsChats.systemAnnouncementLabel':
      'Render as system announcement (banner)',
    'appSettingsChats.broadcastTextPlaceholder':
      'Type your broadcast message…',
    'appSettingsChats.clearButton': 'Clear',
    'appSettingsChats.sendBroadcastButton': 'Send Broadcast',
    'appSettingsChats.sendingButton': 'Sending…',
    'appSettingsChats.broadcastJobHeading': 'Broadcast job',
    'appSettingsChats.jobIdLabel': 'Job ID:',
    'appSettingsChats.stateLabel': 'State:',
    'appSettingsChats.loadingEllipsis': 'loading…',
    'appSettingsChats.progressLabel': 'Progress: {processed}/{total}',
    'appSettingsChats.completedSentLabel': 'Completed. Sent: {sent}/{total}',
    'appSettingsChats.detailsFirst20': 'Details (first 20)',
    'appSettingsChats.roomColumn': 'Room',
    'appSettingsChats.statusColumn': 'Status',
    'appSettingsChats.errorColumn': 'Error',
    'appSettingsChats.failedLabel': 'Failed: {error}',
    'appSettingsChats.unknownError': 'unknown error',
    'appSettingsChats.createChatDialogTitle':
      'Create New Chat for your App Users',
    'appSettingsChats.chatTitlePlaceholder': 'Chat Title',
    'appSettingsChats.cancelButton': 'Cancel',
    'appSettingsChats.continueButton': 'Continue',
    'appSettingsChats.deleteRoomDialogTitle': 'Delete App Room',
    'appSettingsChats.deleteConfirmSingular':
      'Are you sure you want to delete {count} room?',
    'appSettingsChats.deleteConfirmPlural':
      'Are you sure you want to delete {count} rooms?',
    'appSettingsChats.submitButton': 'Submit',
    'appSettingsChats.aiBotFallbackLabel': 'AI Bot',
    'appSettingsChats.botInstanceLabel': 'Bot instance',
    'appSettingsChats.inviteAgentTitle': 'Invite an AI agent into this chat',
    'appSettingsChats.addBotButton': '+ Add Bot',
    'appSettingsChats.removeAriaLabel': 'Remove {label} from chat',
    'appSettingsChats.removeConfirm':
      'Remove "{label}" from this chat? The bot stays running and can be re-invited later.',
    'appSettingsChats.cannotRemoveToast':
      'Cannot remove: agent metadata missing',
    'appSettingsChats.removedToast': '{label} removed from chat',
    'appSettingsChats.removeFailedToast': 'Remove failed: {error}',
    'appSettingsChats.chatCreatedToast': 'Chat created successfully',
    'appSettingsChats.createChatFailedToast': 'Failed to create chat',
    'appSettingsChats.broadcastEnqueuedToast': 'Broadcast enqueued',
    'appSettingsChats.broadcastStartFailedToast':
      'Failed to start broadcast',
    'appSettingsChats.broadcastCompletedToast':
      'Broadcast completed: sent {sent}/{total}',
    'appSettingsChats.broadcastFailedToast': 'Broadcast failed: {error}',

    // appSettingsCryptoRewards.* - CryptoRewards.tsx
    'appSettingsCryptoRewards.coinNameLabel': 'Coin Name',
    'appSettingsCryptoRewards.coinNameTooltip':
      'The name of the in-app currency or token used for transactions and rewards.',
    'appSettingsCryptoRewards.coinNamePlaceholder': 'Enter Coin Name',

    // appSettingsDelete.* - DeleteSetting.tsx
    'appSettingsDelete.heading': 'Delete or Archive',
    'appSettingsDelete.restoreHeading': 'Restore (un-archive)',
    'appSettingsDelete.archiveHeading': 'Archive (soft delete)',
    'appSettingsDelete.archivedDescriptionSuffix':
      'is currently archived. Restoring re-enables login for its users and brings the app back into the active list. All data is intact.',
    'appSettingsDelete.notArchivedDescriptionSuffix':
      'will be hidden and its users will be blocked from logging in. All data (users, chats, files, sources, bot instances) is retained and the app can be restored later from the Archived list.',
    'appSettingsDelete.restoreWord': 'Restore',
    'appSettingsDelete.archiveWord': 'Archive',
    'appSettingsDelete.hardDeleteHeading': 'Hard delete (irreversible)',
    'appSettingsDelete.hardDeleteDescription':
      'Permanently deletes the app and every entity tied to it. There is no restore after this point.',
    'appSettingsDelete.purgeListIntro':
      'The following will be permanently purged:',
    'appSettingsDelete.usersSuffix': 'users',
    'appSettingsDelete.chatRoomsSuffix': 'chat rooms',
    'appSettingsDelete.chatMessagesSuffix': 'chat messages',
    'appSettingsDelete.filesSuffix': 'files',
    'appSettingsDelete.appearanceConfigItem':
      'Appearance configuration (logo, colours etc)',
    'appSettingsDelete.defaultChatRoomsSettingsItem':
      'Default chat rooms settings',
    'appSettingsDelete.aiDataItem': 'AI data (website and documents RAG)',
    'appSettingsDelete.botInstancesItem':
      'Bot instances and in-app AI Widget configuration',
    'appSettingsDelete.auditLogNote':
      'Audit log rows are retained so the action remains traceable after the app is gone.',
    'appSettingsDelete.hardDeleteWord': 'Hard delete',
    'appSettingsDelete.archiveModalTitle': 'Archive this app?',
    'appSettingsDelete.archiveModalMessageSuffix':
      "will be hidden and its users won't be able to log in, but all data is retained. You can restore it later.",
    'appSettingsDelete.hardDeleteModalTitle':
      'Permanently delete this app?',
    'appSettingsDelete.hardDeleteModalIntroSuffix':
      'and all related data will be irreversibly purged.',
    'appSettingsDelete.cannotBeUndone': 'This cannot be undone.',
    'appSettingsDelete.hardDeleteConfirmLabel': 'Yes, hard delete',
    'appSettingsDelete.archivedToast': 'Archived {name}',
    'appSettingsDelete.archiveFailedToast': 'Archive failed: {error}',
    'appSettingsDelete.restoredToast': 'Restored {name}',
    'appSettingsDelete.restoreFailedToast': 'Restore failed: {error}',
    'appSettingsDelete.hardDeleteQueuedToast':
      'Hard delete queued for {name} (job {jobId}). The cascade runs in the background.',
    'appSettingsDelete.hardDeleteStartedToast':
      'Hard delete started for {name}.',
    'appSettingsDelete.hardDeleteFailedToast':
      'Hard delete failed: {error}',
    'appSettingsDelete.unknownErrorFallback': 'unknown',
  },
  fr: {
    // appSettings.* - AppSettings.tsx
    'appSettings.heading': 'Paramètres',
    'appSettings.infoAriaLabel': 'Informations',
    'appSettings.saveButton': 'Enregistrer',
    'appSettings.tab.aiWidget': 'Widget IA',
    'appSettings.tab.webApp': 'Application Web',
    'appSettings.tab.mobileApp': 'Application mobile',
    'appSettings.tab.appearance': 'Apparence',
    'appSettings.tab.signOnOptions': 'Options de connexion',
    'appSettings.tab.homeScreen': "Écran d'accueil",
    'appSettings.tab.menu': 'Menu',
    'appSettings.tab.chats': 'Discussions',
    'appSettings.tab.visibilityPrivacy': 'Visibilité et confidentialité',
    'appSettings.tab.api': 'API',
    'appSettings.tab.deleteOrArchive': 'Supprimer ou archiver',
    'appSettings.section.publish': 'Publication',
    'appSettings.section.ui': 'Interface',
    'appSettings.section.system': 'Système',
    'appSettings.toast.botNameTooShort':
      'Le nom du bot IA doit comporter au moins 3 caractères',
    'appSettings.toast.settingsApplied':
      'Paramètres appliqués avec succès !',
    'appSettings.toast.appDeleted':
      'Votre application a été supprimée avec succès',

    // appSettingsAppearance.* - Appearance.tsx
    'appSettingsAppearance.displayNameLabel': 'Nom affiché',
    'appSettingsAppearance.displayNamePlaceholder':
      "Saisissez le nom de l'application",
    'appSettingsAppearance.taglineLabel': 'Slogan',
    'appSettingsAppearance.taglinePlaceholder':
      'Saisissez le slogan de votre application',
    'appSettingsAppearance.colorLabel': 'Couleur',
    'appSettingsAppearance.logoLabel': 'Logo',
    'appSettingsAppearance.logoRecommendedSize':
      '(Taille recommandée : 500 x 500 px)',
    'appSettingsAppearance.addLogoButton': 'Ajouter un logo',

    // appSettingsApi.* - Api.tsx
    'appSettingsApi.heading': "Clé d'accès de l'application",
    'appSettingsApi.description':
      "Pour accéder à l'API et à l'infrastructure d'Ethora, votre application utilise une paire clé/secret. Avec cette paire de clés, vos applications peuvent générer des jetons JWT, entre autres, pour l'authentification et la signature des requêtes API.",
    'appSettingsApi.rotateNote':
      "Remarque : « Régénérer » remplacera votre paire de clés par une nouvelle. Cela invalidera l'accès pour le code de votre application jusqu'à ce qu'il soit mis à jour avec les nouveaux identifiants.",
    'appSettingsApi.keyColumn': 'Clé',
    'appSettingsApi.secretColumn': 'Secret',

    // appSettingsChats.* - Chats.tsx
    'appSettingsChats.deleteButton': 'Supprimer',
    'appSettingsChats.newChatsHeading': 'Nouvelles discussions',
    'appSettingsChats.allowUsersCreateLabel':
      'Autoriser les utilisateurs à créer de nouvelles discussions',
    'appSettingsChats.allowUsersCreateHelp':
      "Lorsque cette option est activée, vos utilisateurs peuvent créer de nouvelles discussions et y inviter d'autres utilisateurs. Lorsqu'elle est désactivée, seules les discussions déjà existantes ou créées par votre entreprise peuvent être utilisées.",
    'appSettingsChats.pinnedChatsHeading': 'Discussions épinglées',
    'appSettingsChats.pinnedChatsHelp':
      "Les discussions épinglées (ou « favorites ») sont des salons permanents que vos utilisateurs verront et rejoindront automatiquement.",
    'appSettingsChats.listOfChatsLabel': 'Liste des discussions',
    'appSettingsChats.addNewChatButton': 'Ajouter une discussion',
    'appSettingsChats.noChatsEmptyState':
      "Il n'y a pas encore de discussion. Vous pouvez en ajouter en cliquant sur le bouton « Ajouter une discussion »",
    'appSettingsChats.chatNameColumn': 'Nom de la discussion',
    'appSettingsChats.createdByColumn': 'Créé par',
    'appSettingsChats.botsColumn': 'Bots',
    'appSettingsChats.defaultBroadcastSenderHeading':
      'Expéditeur de diffusion par défaut',
    'appSettingsChats.defaultBroadcastSenderHelp':
      "Identité affichée sur les annonces diffusées lorsqu'aucune substitution n'est définie pour une diffusion donnée. Laissez vide pour utiliser le nom affiché de l'application comme expéditeur.",
    'appSettingsChats.senderNameLabel': "Nom de l'expéditeur",
    'appSettingsChats.senderNamePlaceholder': 'ex. Acme Santé',
    'appSettingsChats.avatarUrlOptionalLabel':
      "URL de l'avatar (facultatif)",
    'appSettingsChats.broadcastMessageHeading': 'Message diffusé',
    'appSettingsChats.broadcastMessageHelp':
      'Envoyez une annonce à vos discussions. Vous pouvez diffuser à toutes les discussions ou choisir un sous-ensemble parmi vos discussions épinglées.',
    'appSettingsChats.allChatsRadioLabel':
      'Toutes les discussions (recommandé)',
    'appSettingsChats.selectedPinnedChatsRadioLabel':
      'Discussions épinglées sélectionnées',
    'appSettingsChats.noPinnedRoomsFound':
      "Aucun salon épinglé trouvé. Ajoutez des discussions épinglées ci-dessus ou passez à « Toutes les discussions ».",
    'appSettingsChats.overrideSenderLabel':
      "Remplacer l'expéditeur pour cette diffusion",
    'appSettingsChats.overrideSenderNamePlaceholder':
      "Nom de l'expéditeur (ex. Message du PDG)",
    'appSettingsChats.systemAnnouncementLabel':
      'Afficher comme annonce système (bandeau)',
    'appSettingsChats.broadcastTextPlaceholder':
      'Rédigez votre message de diffusion…',
    'appSettingsChats.clearButton': 'Effacer',
    'appSettingsChats.sendBroadcastButton': 'Envoyer la diffusion',
    'appSettingsChats.sendingButton': 'Envoi en cours…',
    'appSettingsChats.broadcastJobHeading': 'Tâche de diffusion',
    'appSettingsChats.jobIdLabel': 'ID de la tâche :',
    'appSettingsChats.stateLabel': 'État :',
    'appSettingsChats.loadingEllipsis': 'chargement…',
    'appSettingsChats.progressLabel': 'Progression : {processed}/{total}',
    'appSettingsChats.completedSentLabel':
      'Terminé. Envoyés : {sent}/{total}',
    'appSettingsChats.detailsFirst20': 'Détails (20 premiers)',
    'appSettingsChats.roomColumn': 'Salon',
    'appSettingsChats.statusColumn': 'Statut',
    'appSettingsChats.errorColumn': 'Erreur',
    'appSettingsChats.failedLabel': 'Échec : {error}',
    'appSettingsChats.unknownError': 'erreur inconnue',
    'appSettingsChats.createChatDialogTitle':
      'Créer une nouvelle discussion pour les utilisateurs de votre application',
    'appSettingsChats.chatTitlePlaceholder': 'Titre de la discussion',
    'appSettingsChats.cancelButton': 'Annuler',
    'appSettingsChats.continueButton': 'Continuer',
    'appSettingsChats.deleteRoomDialogTitle':
      "Supprimer le salon de l'application",
    'appSettingsChats.deleteConfirmSingular':
      'Êtes-vous sûr de vouloir supprimer {count} salon ?',
    'appSettingsChats.deleteConfirmPlural':
      'Êtes-vous sûr de vouloir supprimer {count} salons ?',
    'appSettingsChats.submitButton': 'Valider',
    'appSettingsChats.aiBotFallbackLabel': 'Bot IA',
    'appSettingsChats.botInstanceLabel': 'Instance de bot',
    'appSettingsChats.inviteAgentTitle':
      'Inviter un agent IA dans cette discussion',
    'appSettingsChats.addBotButton': '+ Ajouter un bot',
    'appSettingsChats.removeAriaLabel':
      'Retirer {label} de la discussion',
    'appSettingsChats.removeConfirm':
      'Retirer « {label} » de cette discussion ? Le bot continue de fonctionner et pourra être réinvité plus tard.',
    'appSettingsChats.cannotRemoveToast':
      "Impossible de retirer le bot : métadonnées de l'agent manquantes",
    'appSettingsChats.removedToast':
      '{label} a été retiré de la discussion',
    'appSettingsChats.removeFailedToast': 'Échec du retrait : {error}',
    'appSettingsChats.chatCreatedToast': 'Discussion créée avec succès',
    'appSettingsChats.createChatFailedToast':
      'Échec de la création de la discussion',
    'appSettingsChats.broadcastEnqueuedToast':
      "Diffusion mise en file d'attente",
    'appSettingsChats.broadcastStartFailedToast':
      'Échec du démarrage de la diffusion',
    'appSettingsChats.broadcastCompletedToast':
      'Diffusion terminée : {sent}/{total} envoyés',
    'appSettingsChats.broadcastFailedToast':
      'Échec de la diffusion : {error}',

    // appSettingsCryptoRewards.* - CryptoRewards.tsx
    'appSettingsCryptoRewards.coinNameLabel': 'Nom de la monnaie',
    'appSettingsCryptoRewards.coinNameTooltip':
      "Le nom de la monnaie ou du jeton utilisé dans l'application pour les transactions et les récompenses.",
    'appSettingsCryptoRewards.coinNamePlaceholder':
      'Saisissez le nom de la monnaie',

    // appSettingsDelete.* - DeleteSetting.tsx
    'appSettingsDelete.heading': 'Supprimer ou archiver',
    'appSettingsDelete.restoreHeading': 'Restaurer (désarchiver)',
    'appSettingsDelete.archiveHeading':
      'Archiver (suppression réversible)',
    'appSettingsDelete.archivedDescriptionSuffix':
      'est actuellement archivée. La restaurer réactive la connexion pour ses utilisateurs et la ramène dans la liste active. Toutes les données sont intactes.',
    'appSettingsDelete.notArchivedDescriptionSuffix':
      "sera masquée et ses utilisateurs ne pourront plus se connecter. Toutes les données (utilisateurs, discussions, fichiers, sources, instances de bot) sont conservées et l'application pourra être restaurée plus tard depuis la liste des applications archivées.",
    'appSettingsDelete.restoreWord': 'Restaurer',
    'appSettingsDelete.archiveWord': 'Archiver',
    'appSettingsDelete.hardDeleteHeading':
      'Suppression définitive (irréversible)',
    'appSettingsDelete.hardDeleteDescription':
      "Supprime définitivement l'application et toutes les entités qui lui sont liées. Aucune restauration n'est possible après cette action.",
    'appSettingsDelete.purgeListIntro':
      'Les éléments suivants seront définitivement supprimés :',
    'appSettingsDelete.usersSuffix': 'utilisateurs',
    'appSettingsDelete.chatRoomsSuffix': 'salons de discussion',
    'appSettingsDelete.chatMessagesSuffix': 'messages de discussion',
    'appSettingsDelete.filesSuffix': 'fichiers',
    'appSettingsDelete.appearanceConfigItem':
      "Configuration de l'apparence (logo, couleurs, etc.)",
    'appSettingsDelete.defaultChatRoomsSettingsItem':
      'Paramètres des discussions par défaut',
    'appSettingsDelete.aiDataItem':
      'Données IA (site web et documents RAG)',
    'appSettingsDelete.botInstancesItem':
      'Instances de bot et configuration du widget IA intégré',
    'appSettingsDelete.auditLogNote':
      "Les entrées du journal d'audit sont conservées afin que l'action reste traçable après la suppression de l'application.",
    'appSettingsDelete.hardDeleteWord': 'Suppression définitive',
    'appSettingsDelete.archiveModalTitle': 'Archiver cette application ?',
    'appSettingsDelete.archiveModalMessageSuffix':
      'sera masquée et ses utilisateurs ne pourront plus se connecter, mais toutes les données seront conservées. Vous pourrez la restaurer plus tard.',
    'appSettingsDelete.hardDeleteModalTitle':
      'Supprimer définitivement cette application ?',
    'appSettingsDelete.hardDeleteModalIntroSuffix':
      'ainsi que toutes les données associées seront définitivement supprimées.',
    'appSettingsDelete.cannotBeUndone': 'Cette action est irréversible.',
    'appSettingsDelete.hardDeleteConfirmLabel':
      'Oui, supprimer définitivement',
    'appSettingsDelete.archivedToast': '{name} a été archivée',
    'appSettingsDelete.archiveFailedToast':
      "Échec de l'archivage : {error}",
    'appSettingsDelete.restoredToast': '{name} a été restaurée',
    'appSettingsDelete.restoreFailedToast':
      'Échec de la restauration : {error}',
    'appSettingsDelete.hardDeleteQueuedToast':
      "Suppression définitive mise en file d'attente pour {name} (tâche {jobId}). Le traitement en cascade s'exécute en arrière-plan.",
    'appSettingsDelete.hardDeleteStartedToast':
      'Suppression définitive lancée pour {name}.',
    'appSettingsDelete.hardDeleteFailedToast':
      'Échec de la suppression définitive : {error}',
    'appSettingsDelete.unknownErrorFallback': 'inconnue',
  },
  es: {
    // appSettings.* - AppSettings.tsx
    'appSettings.heading': 'Configuración',
    'appSettings.infoAriaLabel': 'Información',
    'appSettings.saveButton': 'Guardar',
    'appSettings.tab.aiWidget': 'Widget de IA',
    'appSettings.tab.webApp': 'Aplicación web',
    'appSettings.tab.mobileApp': 'Aplicación móvil',
    'appSettings.tab.appearance': 'Apariencia',
    'appSettings.tab.signOnOptions': 'Opciones de acceso',
    'appSettings.tab.homeScreen': 'Pantalla de inicio',
    'appSettings.tab.menu': 'Menú',
    'appSettings.tab.chats': 'Chats',
    'appSettings.tab.visibilityPrivacy': 'Visibilidad y privacidad',
    'appSettings.tab.api': 'API',
    'appSettings.tab.deleteOrArchive': 'Eliminar o archivar',
    'appSettings.section.publish': 'Publicación',
    'appSettings.section.ui': 'Interfaz',
    'appSettings.section.system': 'Sistema',
    'appSettings.toast.botNameTooShort':
      'El nombre del bot de IA debe tener al menos 3 caracteres',
    'appSettings.toast.settingsApplied':
      '¡Configuración aplicada correctamente!',
    'appSettings.toast.appDeleted':
      'Has eliminado tu aplicación correctamente',

    // appSettingsAppearance.* - Appearance.tsx
    'appSettingsAppearance.displayNameLabel': 'Nombre visible',
    'appSettingsAppearance.displayNamePlaceholder':
      'Introduce el nombre de tu aplicación',
    'appSettingsAppearance.taglineLabel': 'Eslogan',
    'appSettingsAppearance.taglinePlaceholder':
      'Introduce el eslogan de tu aplicación',
    'appSettingsAppearance.colorLabel': 'Color',
    'appSettingsAppearance.logoLabel': 'Logotipo',
    'appSettingsAppearance.logoRecommendedSize':
      '(Tamaño recomendado: 500 x 500 px)',
    'appSettingsAppearance.addLogoButton': 'Añadir logotipo',

    // appSettingsApi.* - Api.tsx
    'appSettingsApi.heading': 'Clave de acceso de la aplicación',
    'appSettingsApi.description':
      'Para acceder a la API y a la infraestructura de Ethora, tu aplicación utiliza un par de clave y secreto. Con este par de claves, tus aplicaciones pueden generar tokens JWT, entre otros usos, para la autenticación y la firma de solicitudes a la API.',
    'appSettingsApi.rotateNote':
      'Nota: "Rotar" reemplazará tu par de claves por uno nuevo. Esto invalidará el acceso de tu aplicación hasta que se actualice con las nuevas credenciales.',
    'appSettingsApi.keyColumn': 'Clave',
    'appSettingsApi.secretColumn': 'Secreto',

    // appSettingsChats.* - Chats.tsx
    'appSettingsChats.deleteButton': 'Eliminar',
    'appSettingsChats.newChatsHeading': 'Chats nuevos',
    'appSettingsChats.allowUsersCreateLabel':
      'Permitir que los usuarios creen chats nuevos',
    'appSettingsChats.allowUsersCreateHelp':
      'Cuando está activado, tus usuarios pueden crear chats nuevos e invitar a otros usuarios a ellos. Cuando está desactivado, solo se pueden usar los chats ya existentes o los creados por tu empresa.',
    'appSettingsChats.pinnedChatsHeading': 'Chats fijados',
    'appSettingsChats.pinnedChatsHelp':
      'Los chats fijados (o "destacados") son salas permanentes a las que tus usuarios se unirán y verán automáticamente.',
    'appSettingsChats.listOfChatsLabel': 'Lista de chats',
    'appSettingsChats.addNewChatButton': 'Añadir chat nuevo',
    'appSettingsChats.noChatsEmptyState':
      "Todavía no hay chats. Puedes añadirlos haciendo clic en el botón 'Añadir chat nuevo'",
    'appSettingsChats.chatNameColumn': 'Nombre del chat',
    'appSettingsChats.createdByColumn': 'Creado por',
    'appSettingsChats.botsColumn': 'Bots',
    'appSettingsChats.defaultBroadcastSenderHeading':
      'Remitente predeterminado de difusiones',
    'appSettingsChats.defaultBroadcastSenderHelp':
      'Identidad que se muestra en los anuncios difundidos cuando no se define una anulación específica para esa difusión. Déjalo en blanco para usar el nombre visible de la aplicación como remitente.',
    'appSettingsChats.senderNameLabel': 'Nombre del remitente',
    'appSettingsChats.senderNamePlaceholder': 'p. ej. Acme Salud',
    'appSettingsChats.avatarUrlOptionalLabel': 'URL del avatar (opcional)',
    'appSettingsChats.broadcastMessageHeading': 'Mensaje de difusión',
    'appSettingsChats.broadcastMessageHelp':
      'Envía un anuncio a tus chats. Puedes difundirlo a todos los chats o elegir un subconjunto de tu lista de salas fijadas.',
    'appSettingsChats.allChatsRadioLabel': 'Todos los chats (recomendado)',
    'appSettingsChats.selectedPinnedChatsRadioLabel':
      'Chats fijados seleccionados',
    'appSettingsChats.noPinnedRoomsFound':
      'No se encontraron salas fijadas. Añade chats fijados arriba o cambia a "Todos los chats".',
    'appSettingsChats.overrideSenderLabel':
      'Anular el remitente para esta difusión',
    'appSettingsChats.overrideSenderNamePlaceholder':
      'Nombre del remitente (p. ej. Comunicado del CEO)',
    'appSettingsChats.systemAnnouncementLabel':
      'Mostrar como anuncio del sistema (banner)',
    'appSettingsChats.broadcastTextPlaceholder':
      'Escribe tu mensaje de difusión…',
    'appSettingsChats.clearButton': 'Borrar',
    'appSettingsChats.sendBroadcastButton': 'Enviar difusión',
    'appSettingsChats.sendingButton': 'Enviando…',
    'appSettingsChats.broadcastJobHeading': 'Tarea de difusión',
    'appSettingsChats.jobIdLabel': 'ID de la tarea:',
    'appSettingsChats.stateLabel': 'Estado:',
    'appSettingsChats.loadingEllipsis': 'cargando…',
    'appSettingsChats.progressLabel': 'Progreso: {processed}/{total}',
    'appSettingsChats.completedSentLabel':
      'Completado. Enviados: {sent}/{total}',
    'appSettingsChats.detailsFirst20': 'Detalles (primeros 20)',
    'appSettingsChats.roomColumn': 'Sala',
    'appSettingsChats.statusColumn': 'Estado',
    'appSettingsChats.errorColumn': 'Error',
    'appSettingsChats.failedLabel': 'Error: {error}',
    'appSettingsChats.unknownError': 'error desconocido',
    'appSettingsChats.createChatDialogTitle':
      'Crear un chat nuevo para los usuarios de tu aplicación',
    'appSettingsChats.chatTitlePlaceholder': 'Título del chat',
    'appSettingsChats.cancelButton': 'Cancelar',
    'appSettingsChats.continueButton': 'Continuar',
    'appSettingsChats.deleteRoomDialogTitle':
      'Eliminar sala de la aplicación',
    'appSettingsChats.deleteConfirmSingular':
      '¿Seguro que quieres eliminar {count} sala?',
    'appSettingsChats.deleteConfirmPlural':
      '¿Seguro que quieres eliminar {count} salas?',
    'appSettingsChats.submitButton': 'Enviar',
    'appSettingsChats.aiBotFallbackLabel': 'Bot de IA',
    'appSettingsChats.botInstanceLabel': 'Instancia de bot',
    'appSettingsChats.inviteAgentTitle':
      'Invitar a un agente de IA a este chat',
    'appSettingsChats.addBotButton': '+ Añadir bot',
    'appSettingsChats.removeAriaLabel': 'Quitar a {label} del chat',
    'appSettingsChats.removeConfirm':
      '¿Quitar a "{label}" de este chat? El bot seguirá activo y podrá volver a invitarse más adelante.',
    'appSettingsChats.cannotRemoveToast':
      'No se puede quitar: faltan los metadatos del agente',
    'appSettingsChats.removedToast': '{label} se quitó del chat',
    'appSettingsChats.removeFailedToast': 'Error al quitar: {error}',
    'appSettingsChats.chatCreatedToast': 'Chat creado correctamente',
    'appSettingsChats.createChatFailedToast': 'No se pudo crear el chat',
    'appSettingsChats.broadcastEnqueuedToast': 'Difusión encolada',
    'appSettingsChats.broadcastStartFailedToast':
      'No se pudo iniciar la difusión',
    'appSettingsChats.broadcastCompletedToast':
      'Difusión completada: {sent}/{total} enviados',
    'appSettingsChats.broadcastFailedToast':
      'Error en la difusión: {error}',

    // appSettingsCryptoRewards.* - CryptoRewards.tsx
    'appSettingsCryptoRewards.coinNameLabel': 'Nombre de la moneda',
    'appSettingsCryptoRewards.coinNameTooltip':
      'El nombre de la moneda o token interno utilizado para las transacciones y recompensas.',
    'appSettingsCryptoRewards.coinNamePlaceholder':
      'Introduce el nombre de la moneda',

    // appSettingsDelete.* - DeleteSetting.tsx
    'appSettingsDelete.heading': 'Eliminar o archivar',
    'appSettingsDelete.restoreHeading': 'Restaurar (desarchivar)',
    'appSettingsDelete.archiveHeading':
      'Archivar (eliminación reversible)',
    'appSettingsDelete.archivedDescriptionSuffix':
      'está archivada actualmente. Restaurarla vuelve a habilitar el inicio de sesión de sus usuarios y la devuelve a la lista activa. Todos los datos permanecen intactos.',
    'appSettingsDelete.notArchivedDescriptionSuffix':
      'se ocultará y se impedirá que sus usuarios inicien sesión. Todos los datos (usuarios, chats, archivos, fuentes, instancias de bot) se conservan y la aplicación podrá restaurarse más adelante desde la lista de archivadas.',
    'appSettingsDelete.restoreWord': 'Restaurar',
    'appSettingsDelete.archiveWord': 'Archivar',
    'appSettingsDelete.hardDeleteHeading':
      'Eliminación definitiva (irreversible)',
    'appSettingsDelete.hardDeleteDescription':
      'Elimina de forma permanente la aplicación y todas las entidades vinculadas a ella. No hay forma de restaurarla después de este punto.',
    'appSettingsDelete.purgeListIntro':
      'Se eliminará de forma permanente lo siguiente:',
    'appSettingsDelete.usersSuffix': 'usuarios',
    'appSettingsDelete.chatRoomsSuffix': 'salas de chat',
    'appSettingsDelete.chatMessagesSuffix': 'mensajes de chat',
    'appSettingsDelete.filesSuffix': 'archivos',
    'appSettingsDelete.appearanceConfigItem':
      'Configuración de apariencia (logotipo, colores, etc.)',
    'appSettingsDelete.defaultChatRoomsSettingsItem':
      'Configuración de chats predeterminados',
    'appSettingsDelete.aiDataItem':
      'Datos de IA (sitio web y documentos RAG)',
    'appSettingsDelete.botInstancesItem':
      'Instancias de bot y configuración del widget de IA integrado',
    'appSettingsDelete.auditLogNote':
      'Los registros de auditoría se conservan para que la acción siga siendo trazable después de eliminar la aplicación.',
    'appSettingsDelete.hardDeleteWord': 'Eliminación definitiva',
    'appSettingsDelete.archiveModalTitle': '¿Archivar esta aplicación?',
    'appSettingsDelete.archiveModalMessageSuffix':
      'se ocultará y sus usuarios no podrán iniciar sesión, pero todos los datos se conservarán. Podrás restaurarla más adelante.',
    'appSettingsDelete.hardDeleteModalTitle':
      '¿Eliminar esta aplicación de forma permanente?',
    'appSettingsDelete.hardDeleteModalIntroSuffix':
      'y todos los datos relacionados se eliminarán de forma irreversible.',
    'appSettingsDelete.cannotBeUndone': 'Esta acción no se puede deshacer.',
    'appSettingsDelete.hardDeleteConfirmLabel':
      'Sí, eliminar definitivamente',
    'appSettingsDelete.archivedToast': 'Se archivó {name}',
    'appSettingsDelete.archiveFailedToast': 'Error al archivar: {error}',
    'appSettingsDelete.restoredToast': 'Se restauró {name}',
    'appSettingsDelete.restoreFailedToast':
      'Error al restaurar: {error}',
    'appSettingsDelete.hardDeleteQueuedToast':
      'Eliminación definitiva en cola para {name} (tarea {jobId}). El proceso en cascada se ejecuta en segundo plano.',
    'appSettingsDelete.hardDeleteStartedToast':
      'Eliminación definitiva iniciada para {name}.',
    'appSettingsDelete.hardDeleteFailedToast':
      'Error al eliminar definitivamente: {error}',
    'appSettingsDelete.unknownErrorFallback': 'desconocido',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
