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
    'appSettingsApi.heading':
      'App credentials',
    'appSettingsApi.description':
      'Every app has an App ID and an App Secret. The App ID identifies your app to the Ethora API. The App Secret is the signing key your backend uses to mint the tokens that authenticate API calls. Keep the secret on a server you control: anything holding it can act as your app.',
    'appSettingsApi.rotateNote':
      'Rotating the secret replaces the pair. Anything still using the old secret stops working immediately, so update your deployed code first.',
    'appSettingsApi.keyColumn':
      'App ID',
    'appSettingsApi.secretColumn':
      'App Secret',
    'appSettingsApi.credHeading': 'Which credential do I need?',
    'appSettingsApi.credIntro':
      'Ethora accepts three kinds of credential. Pick by who is calling, not by what you are building.',
    'appSettingsApi.credColKind': 'Credential',
    'appSettingsApi.credColWhen': 'Use it when',
    'appSettingsApi.credColHow': 'How you get it',
    'appSettingsApi.credUserKind': 'User token',
    'appSettingsApi.credUserWhen':
      'A person is signed in and acting as themselves, in your app or in an assistant.',
    'appSettingsApi.credUserHow': 'Sign in, or use an API key.',
    'appSettingsApi.credAppKind': 'App token',
    'appSettingsApi.credAppWhen':
      'Your backend is doing something scoped to this one app: broadcasts, indexing sources, bot configuration.',
    'appSettingsApi.credAppHow':
      'Signed from the App Secret, or minted through the app-tokens API.',
    'appSettingsApi.credServerKind': 'Server (B2B) token',
    'appSettingsApi.credServerWhen':
      'Your backend is provisioning on behalf of the tenant: creating apps, batch user creation, managing app tokens.',
    'appSettingsApi.credServerHow': 'Signed from the App Secret.',
    'appSettingsApi.assistantHeading': 'Connect an AI assistant',
    'appSettingsApi.assistantIntro':
      'You do not need any of the above to use Ethora from Claude, ChatGPT, Cursor or Claude Code. Connect the hosted MCP server and sign in there instead:',
    'appSettingsApi.assistantNote':
      'For a client that cannot run a sign-in flow, take a personal connector URL from Account > AI Assistants instead. Either way the assistant acts as you, so it never needs the App Secret.',
    'appSettingsApi.stHeading': 'Server tokens (B2B)',
    'appSettingsApi.stIntro':
      'A server token lets your backend act as this app over the API without handling the App Secret. Send it as the x-custom-token header. Each token can be revoked here on its own.',
    'appSettingsApi.stCreatedHeading': 'Your new server token',
    'appSettingsApi.stCreatedWarning':
      'Shown once. Store it in your server configuration now; anyone holding it can act as this app until you revoke it.',
    'appSettingsApi.stCurlLabel': 'Try it',
    'appSettingsApi.stDoneButton': 'Done',
    'appSettingsApi.stNamePlaceholder': 'Name (e.g. crm-sync)',
    'appSettingsApi.stTtlLabel': 'Expires in',
    'appSettingsApi.stTtl30': '30 days',
    'appSettingsApi.stTtl90': '90 days',
    'appSettingsApi.stTtl365': '365 days',
    'appSettingsApi.stCreateButton': 'Create token',
    'appSettingsApi.stCreating': 'Creating...',
    'appSettingsApi.stNoTokens': 'No server tokens yet.',
    'appSettingsApi.stColName': 'Name',
    'appSettingsApi.stColCreated': 'Created',
    'appSettingsApi.stColExpires': 'Expires',
    'appSettingsApi.stRevokeButton': 'Revoke',
    'appSettingsApi.stRevokeTitle': 'Revoke server token?',
    'appSettingsApi.stRevokeMessage':
      'Integrations using this token stop working immediately.',
    'appSettingsApi.stRevokeConfirm': 'Revoke',
    'appSettingsApi.stToastCreated': 'Server token created',
    'appSettingsApi.stToastRevoked': 'Server token revoked',
    'appSettingsApi.stToastError': 'Something went wrong. Please try again.',

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
    'appSettingsApi.heading':
      "Identifiants de l'application",
    'appSettingsApi.description':
      "Chaque application possède un App ID et un App Secret. L'App ID identifie votre application auprès de l'API Ethora. L'App Secret est la clé de signature que votre backend utilise pour émettre les jetons qui authentifient les appels API. Gardez le secret sur un serveur que vous contrôlez : tout ce qui le détient peut agir au nom de votre application.",
    'appSettingsApi.rotateNote':
      "Régénérer le secret remplace la paire. Tout ce qui utilise encore l'ancien secret cesse de fonctionner immédiatement, mettez donc d'abord à jour votre code déployé.",
    'appSettingsApi.keyColumn':
      'App ID',
    'appSettingsApi.secretColumn':
      'App Secret',
    'appSettingsApi.credHeading': 'De quel identifiant ai-je besoin ?',
    'appSettingsApi.credIntro':
      "Ethora accepte trois types d'identifiants. Choisissez selon qui appelle, pas selon ce que vous construisez.",
    'appSettingsApi.credColKind': 'Identifiant',
    'appSettingsApi.credColWhen': 'À utiliser quand',
    'appSettingsApi.credColHow': "Comment l'obtenir",
    'appSettingsApi.credUserKind': 'Jeton utilisateur',
    'appSettingsApi.credUserWhen':
      'Une personne est connectée et agit en son propre nom, dans votre application ou dans un assistant.',
    'appSettingsApi.credUserHow': 'Connectez-vous, ou utilisez une clé API.',
    'appSettingsApi.credAppKind': "Jeton d'application",
    'appSettingsApi.credAppWhen':
      "Votre backend effectue une action limitée à cette application : diffusions, indexation de sources, configuration du bot.",
    'appSettingsApi.credAppHow':
      "Signé à partir de l'App Secret, ou émis via l'API des jetons d'application.",
    'appSettingsApi.credServerKind': 'Jeton serveur (B2B)',
    'appSettingsApi.credServerWhen':
      "Votre backend provisionne au nom du locataire : création d'applications, création d'utilisateurs en lot, gestion des jetons d'application.",
    'appSettingsApi.credServerHow': "Signé à partir de l'App Secret.",
    'appSettingsApi.assistantHeading': 'Connecter un assistant IA',
    'appSettingsApi.assistantIntro':
      "Vous n'avez besoin d'aucun des éléments ci-dessus pour utiliser Ethora depuis Claude, ChatGPT, Cursor ou Claude Code. Connectez plutôt le serveur MCP hébergé et connectez-vous là :",
    'appSettingsApi.assistantNote':
      "Pour un client qui ne peut pas exécuter de flux de connexion, prenez plutôt une URL de connecteur personnelle dans Compte > Assistants IA. Dans les deux cas l'assistant agit en votre nom et n'a jamais besoin de l'App Secret.",

    // appSettingsChats.* - Chats.tsx
    'appSettingsChats.deleteButton': 'Supprimer',
    'appSettingsApi.stHeading': 'Jetons serveur (B2B)',
    'appSettingsApi.stIntro':
      "Un jeton serveur permet à votre backend d'agir au nom de cette application via l'API sans manipuler l'App Secret. Envoyez-le dans l'en-tête x-custom-token. Chaque jeton peut être révoqué ici séparément.",
    'appSettingsApi.stCreatedHeading': 'Votre nouveau jeton serveur',
    'appSettingsApi.stCreatedWarning':
      "Affiché une seule fois. Enregistrez-le dès maintenant dans la configuration de votre serveur ; quiconque le détient peut agir au nom de cette application jusqu'à sa révocation.",
    'appSettingsApi.stCurlLabel': 'Essayer',
    'appSettingsApi.stDoneButton': 'Terminé',
    'appSettingsApi.stNamePlaceholder': 'Nom (ex. crm-sync)',
    'appSettingsApi.stTtlLabel': 'Expire dans',
    'appSettingsApi.stTtl30': '30 jours',
    'appSettingsApi.stTtl90': '90 jours',
    'appSettingsApi.stTtl365': '365 jours',
    'appSettingsApi.stCreateButton': 'Créer un jeton',
    'appSettingsApi.stCreating': 'Création...',
    'appSettingsApi.stNoTokens': 'Aucun jeton serveur pour le moment.',
    'appSettingsApi.stColName': 'Nom',
    'appSettingsApi.stColCreated': 'Créé le',
    'appSettingsApi.stColExpires': 'Expire le',
    'appSettingsApi.stRevokeButton': 'Révoquer',
    'appSettingsApi.stRevokeTitle': 'Révoquer le jeton serveur ?',
    'appSettingsApi.stRevokeMessage':
      'Les intégrations qui utilisent ce jeton cesseront de fonctionner immédiatement.',
    'appSettingsApi.stRevokeConfirm': 'Révoquer',
    'appSettingsApi.stToastCreated': 'Jeton serveur créé',
    'appSettingsApi.stToastRevoked': 'Jeton serveur révoqué',
    'appSettingsApi.stToastError': "Une erreur s'est produite. Veuillez réessayer.",
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
    'appSettingsApi.heading':
      'Credenciales de la aplicación',
    'appSettingsApi.description':
      'Cada aplicación tiene un App ID y un App Secret. El App ID identifica tu aplicación ante la API de Ethora. El App Secret es la clave de firma que tu backend usa para emitir los tokens que autentican las llamadas a la API. Guarda el secreto en un servidor que controles: cualquier cosa que lo tenga puede actuar como tu aplicación.',
    'appSettingsApi.rotateNote':
      'Rotar el secreto reemplaza el par. Todo lo que siga usando el secreto anterior deja de funcionar de inmediato, así que actualiza primero tu código desplegado.',
    'appSettingsApi.keyColumn':
      'App ID',
    'appSettingsApi.secretColumn':
      'App Secret',
    'appSettingsApi.credHeading': '¿Qué credencial necesito?',
    'appSettingsApi.credIntro':
      'Ethora acepta tres tipos de credencial. Elige según quién llama, no según lo que estás construyendo.',
    'appSettingsApi.credColKind': 'Credencial',
    'appSettingsApi.credColWhen': 'Úsala cuando',
    'appSettingsApi.credColHow': 'Cómo obtenerla',
    'appSettingsApi.credUserKind': 'Token de usuario',
    'appSettingsApi.credUserWhen':
      'Una persona ha iniciado sesión y actúa en su propio nombre, en tu aplicación o en un asistente.',
    'appSettingsApi.credUserHow': 'Inicia sesión o usa una clave API.',
    'appSettingsApi.credAppKind': 'Token de aplicación',
    'appSettingsApi.credAppWhen':
      'Tu backend hace algo limitado a esta aplicación: difusiones, indexación de fuentes, configuración del bot.',
    'appSettingsApi.credAppHow':
      'Firmado con el App Secret, o emitido mediante la API de tokens de aplicación.',
    'appSettingsApi.credServerKind': 'Token de servidor (B2B)',
    'appSettingsApi.credServerWhen':
      'Tu backend aprovisiona en nombre del inquilino: creación de aplicaciones, creación de usuarios por lotes, gestión de tokens de aplicación.',
    'appSettingsApi.credServerHow': 'Firmado con el App Secret.',
    'appSettingsApi.assistantHeading': 'Conectar un asistente de IA',
    'appSettingsApi.assistantIntro':
      'No necesitas nada de lo anterior para usar Ethora desde Claude, ChatGPT, Cursor o Claude Code. Conecta el servidor MCP alojado e inicia sesión allí:',
    'appSettingsApi.assistantNote':
      'Para un cliente que no puede ejecutar un flujo de inicio de sesión, usa una URL de conector personal desde Cuenta > Asistentes de IA. En ambos casos el asistente actúa como tú, así que nunca necesita el App Secret.',
    'appSettingsApi.stHeading': 'Tokens de servidor (B2B)',
    'appSettingsApi.stIntro':
      'Un token de servidor permite que tu backend actúe como esta aplicación a través de la API sin manejar el App Secret. Envíalo en la cabecera x-custom-token. Cada token puede revocarse aquí por separado.',
    'appSettingsApi.stCreatedHeading': 'Tu nuevo token de servidor',
    'appSettingsApi.stCreatedWarning':
      'Se muestra una sola vez. Guárdalo ahora en la configuración de tu servidor; cualquiera que lo tenga puede actuar como esta aplicación hasta que lo revoques.',
    'appSettingsApi.stCurlLabel': 'Probar',
    'appSettingsApi.stDoneButton': 'Listo',
    'appSettingsApi.stNamePlaceholder': 'Nombre (p. ej. crm-sync)',
    'appSettingsApi.stTtlLabel': 'Caduca en',
    'appSettingsApi.stTtl30': '30 días',
    'appSettingsApi.stTtl90': '90 días',
    'appSettingsApi.stTtl365': '365 días',
    'appSettingsApi.stCreateButton': 'Crear token',
    'appSettingsApi.stCreating': 'Creando...',
    'appSettingsApi.stNoTokens': 'Todavía no hay tokens de servidor.',
    'appSettingsApi.stColName': 'Nombre',
    'appSettingsApi.stColCreated': 'Creado',
    'appSettingsApi.stColExpires': 'Caduca',
    'appSettingsApi.stRevokeButton': 'Revocar',
    'appSettingsApi.stRevokeTitle': '¿Revocar el token de servidor?',
    'appSettingsApi.stRevokeMessage':
      'Las integraciones que usan este token dejarán de funcionar de inmediato.',
    'appSettingsApi.stRevokeConfirm': 'Revocar',
    'appSettingsApi.stToastCreated': 'Token de servidor creado',
    'appSettingsApi.stToastRevoked': 'Token de servidor revocado',
    'appSettingsApi.stToastError': 'Algo salió mal. Inténtalo de nuevo.',

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
