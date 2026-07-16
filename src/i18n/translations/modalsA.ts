import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Covers four admin-panel modals: AclModal, PreviewAppModal, ImportAppModal,
// InfoAppModal. Keys are namespaced per source file (aclModal.*,
// previewAppModal.*, importAppModal.*, infoAppModal.*) even though they all
// live in this one dictionary file - keeps call sites unambiguous about
// which modal a string belongs to.
export const modalsA = {
  en: {
    // AclModal.tsx
    'aclModal.title': 'ACL Editing',
    'aclModal.appLevelTitle': 'App level',
    'aclModal.appLevelDescription':
      "Here you can assign or remove User's access rights to certain objects within the current App.",
    'aclModal.colName': 'Name',
    'aclModal.colCreate': 'Create',
    'aclModal.colRead': 'Read',
    'aclModal.colUpdate': 'Update',
    'aclModal.colDelete': 'Delete',
    'aclModal.colAdmin': 'Admin',
    'aclModal.rowCreateApps': 'Create Apps',
    'aclModal.rowSettings': 'Settings',
    'aclModal.rowUsers': 'Users',
    'aclModal.rowTokens': 'Tokens',
    'aclModal.rowPushNotifications': 'Push Notifications',
    'aclModal.rowStatistics': 'Statistics',
    'aclModal.serverLevelTitle': 'Server level',
    'aclModal.serverLevelDescription':
      "Here you can assign or remove User's access to infrastructure level objects, above the context of any Apps. Available for Enterprise Plan.",
    'aclModal.cancel': 'Cancel',
    'aclModal.updateAcl': 'Update ACL',

    // PreviewAppModal.tsx
    'previewAppModal.toastCreatedSuccess': 'Application created successfully!',
    'previewAppModal.toastCreateError': 'Error creating application.',
    'previewAppModal.welcomeImageAlt': 'Welcome',
    'previewAppModal.welcomeTitle': 'Welcome to Ethora',
    'previewAppModal.welcomeIntroPart1':
      'Thank you for joining! This is your admin panel. Here you can ',
    'previewAppModal.welcomeIntroCreateApps': 'create Apps ',
    'previewAppModal.welcomeIntroPart2':
      'for your projects. Also, you can manage various features such as ',
    'previewAppModal.welcomeIntroChats': 'Chats',
    'previewAppModal.welcomeIntroAnd': ' and ',
    'previewAppModal.welcomeIntroAiBots': 'AI bots',
    'previewAppModal.welcomeIntroEnd': '.',
    'previewAppModal.letsStart': "Let's start",
    'previewAppModal.createFirstAppTitle': 'Create your first App!',
    'previewAppModal.createFirstAppDescription':
      'To handle project contexts, you can create multiple Apps. What would be the name for your first App?',
    'previewAppModal.appNamePlaceholder': 'App Name',
    'previewAppModal.appNameRequired': 'App name is required',
    'previewAppModal.appNameMinLength': 'App name must be at least 3 characters',
    'previewAppModal.continue': 'Continue',
    'previewAppModal.creationInProgressTitle': 'Application creation in progress!',
    'previewAppModal.deployingMessage':
      'Your app is being deployed. Please wait, this might take up to 10-15 seconds',

    // ImportAppModal.tsx
    'importAppModal.defaultTitle': 'Import App',
    'importAppModal.defaultHelperText':
      'Pick a JSON or ZIP file exported from another Ethora environment, or paste the JSON directly. The new app will be created under your tenant with a fresh ID.',
    'importAppModal.pickFileOrPaste': 'Please pick a file or paste the bundle JSON.',
    'importAppModal.pastedJsonInvalid': 'Pasted JSON is invalid: ',
    'importAppModal.parseFailed': 'parse failed',
    'importAppModal.importedSuccessfully': 'Imported successfully',
    'importAppModal.importFailed': 'Import failed: ',
    'importAppModal.unknownError': 'unknown error',
    'importAppModal.close': 'Close',
    'importAppModal.bundleFileLabel': 'Bundle file (.json or .zip)',
    'importAppModal.selectedPrefix': 'Selected:',
    'importAppModal.kb': 'KB',
    'importAppModal.orPasteBelow': 'or paste JSON below',
    'importAppModal.bundleJsonLabel': 'Bundle JSON',
    'importAppModal.domainNameLabel': 'Domain name (optional override)',
    'importAppModal.domainNamePlaceholder':
      'leave blank to keep the source domain (auto-suffix on collision)',
    'importAppModal.importResultLabel': 'Import result',
    'importAppModal.cancel': 'Cancel',
    'importAppModal.import': 'Import',
    'importAppModal.importing': 'Importing...',

    // InfoAppModal.tsx
    'infoAppModal.headerPrefix': 'Awesome - your “',
    'infoAppModal.headerSuffix':
      '” app is here! You will now see your Admin dashboard where you can:',
    'infoAppModal.step1Title': '1. Change appearance',
    'infoAppModal.step1OpenPrefix': 'Open ',
    'infoAppModal.appearanceLink': 'Appearance',
    'infoAppModal.step1Suffix':
      ' tab where you can add your logo, change colors etc for your App.',
    'infoAppModal.step2Title': '2. Manage chats',
    'infoAppModal.mainChatCreated':
      'A default “Main Chat” room has been pre-created and pinned for your Users.',
    'infoAppModal.manageChatsPrefix': 'Manage pinned chats in ',
    'infoAppModal.chatsLink': 'Chats',
    'infoAppModal.manageChatsSuffix':
      ' tab here. You and your users can also create and join chats via your App interface.',
    'infoAppModal.step3Title': '3. Test and on-board users',
    'infoAppModal.tempUrlPrefix': 'Your temporary web app URL is ',
    'infoAppModal.copy': 'Copy',
    'infoAppModal.tempUrlSuffix':
      '. You can send it to your beta testers or test it yourself in another browser.',
    'infoAppModal.copiedToClipboard': 'Copied to clipboard!',
    'infoAppModal.testAsEndUser':
      'You’re logged as App Owner within our Base App. To test your own app as your End User, open the above URL in another browser or incognito mode. A disposable e-mail via a service like Mailinator or another Google account may be handy for your test “End User” account.',
    'infoAppModal.moreFeatures':
      'There are many more things you can do such as AI bots and integrations, changing your app URL, building your iOS/Android app, setting up your own Ethora server, internal Coin and gamification, but we suggest you start with the basics first.',
    'infoAppModal.goodLuck': 'Good luck!',
    'infoAppModal.ok': 'OK',
  },
  fr: {
    // AclModal.tsx
    'aclModal.title': 'Édition des ACL',
    'aclModal.appLevelTitle': "Niveau application",
    'aclModal.appLevelDescription':
      "Ici, vous pouvez attribuer ou retirer les droits d'accès d'un utilisateur à certains objets au sein de l'application actuelle.",
    'aclModal.colName': 'Nom',
    'aclModal.colCreate': 'Créer',
    'aclModal.colRead': 'Lire',
    'aclModal.colUpdate': 'Modifier',
    'aclModal.colDelete': 'Supprimer',
    'aclModal.colAdmin': 'Admin',
    'aclModal.rowCreateApps': 'Créer des applications',
    'aclModal.rowSettings': 'Paramètres',
    'aclModal.rowUsers': 'Utilisateurs',
    'aclModal.rowTokens': 'Jetons',
    'aclModal.rowPushNotifications': 'Notifications push',
    'aclModal.rowStatistics': 'Statistiques',
    'aclModal.serverLevelTitle': 'Niveau serveur',
    'aclModal.serverLevelDescription':
      "Ici, vous pouvez attribuer ou retirer l'accès d'un utilisateur aux objets de niveau infrastructure, au-delà du contexte de toute application. Disponible pour le plan Entreprise.",
    'aclModal.cancel': 'Annuler',
    'aclModal.updateAcl': 'Mettre à jour les ACL',

    // PreviewAppModal.tsx
    'previewAppModal.toastCreatedSuccess': 'Application créée avec succès !',
    'previewAppModal.toastCreateError': "Erreur lors de la création de l'application.",
    'previewAppModal.welcomeImageAlt': 'Bienvenue',
    'previewAppModal.welcomeTitle': 'Bienvenue sur Ethora',
    'previewAppModal.welcomeIntroPart1':
      'Merci de nous avoir rejoints ! Voici votre panneau d’administration. Vous pouvez y ',
    'previewAppModal.welcomeIntroCreateApps': 'créer des applications ',
    'previewAppModal.welcomeIntroPart2':
      'pour vos projets. Vous pouvez également gérer diverses fonctionnalités telles que les ',
    'previewAppModal.welcomeIntroChats': 'discussions',
    'previewAppModal.welcomeIntroAnd': ' et les ',
    'previewAppModal.welcomeIntroAiBots': 'bots IA',
    'previewAppModal.welcomeIntroEnd': '.',
    'previewAppModal.letsStart': 'Commençons',
    'previewAppModal.createFirstAppTitle': 'Créez votre première application !',
    'previewAppModal.createFirstAppDescription':
      'Pour gérer les contextes de projet, vous pouvez créer plusieurs applications. Quel sera le nom de votre première application ?',
    'previewAppModal.appNamePlaceholder': "Nom de l'application",
    'previewAppModal.appNameRequired': "Le nom de l'application est requis",
    'previewAppModal.appNameMinLength':
      "Le nom de l'application doit comporter au moins 3 caractères",
    'previewAppModal.continue': 'Continuer',
    'previewAppModal.creationInProgressTitle': "Création de l'application en cours !",
    'previewAppModal.deployingMessage':
      'Votre application est en cours de déploiement. Veuillez patienter, cela peut prendre jusqu’à 10 à 15 secondes',

    // ImportAppModal.tsx
    'importAppModal.defaultTitle': 'Importer une application',
    'importAppModal.defaultHelperText':
      'Choisissez un fichier JSON ou ZIP exporté depuis un autre environnement Ethora, ou collez directement le JSON. La nouvelle application sera créée dans votre tenant avec un nouvel identifiant.',
    'importAppModal.pickFileOrPaste': 'Veuillez choisir un fichier ou coller le JSON du bundle.',
    'importAppModal.pastedJsonInvalid': 'Le JSON collé est invalide : ',
    'importAppModal.parseFailed': "échec de l'analyse",
    'importAppModal.importedSuccessfully': 'Importé avec succès',
    'importAppModal.importFailed': "Échec de l'importation : ",
    'importAppModal.unknownError': 'erreur inconnue',
    'importAppModal.close': 'Fermer',
    'importAppModal.bundleFileLabel': 'Fichier du bundle (.json ou .zip)',
    'importAppModal.selectedPrefix': 'Sélectionné :',
    'importAppModal.kb': 'Ko',
    'importAppModal.orPasteBelow': 'ou collez le JSON ci-dessous',
    'importAppModal.bundleJsonLabel': 'JSON du bundle',
    'importAppModal.domainNameLabel': 'Nom de domaine (remplacement facultatif)',
    'importAppModal.domainNamePlaceholder':
      'laissez vide pour conserver le domaine source (suffixe automatique en cas de collision)',
    'importAppModal.importResultLabel': "Résultat de l'importation",
    'importAppModal.cancel': 'Annuler',
    'importAppModal.import': 'Importer',
    'importAppModal.importing': 'Importation...',

    // InfoAppModal.tsx
    'infoAppModal.headerPrefix': 'Parfait, votre application « ',
    'infoAppModal.headerSuffix':
      ' » est prête ! Vous allez maintenant accéder à votre tableau de bord d’administration, où vous pourrez :',
    'infoAppModal.step1Title': "1. Modifier l’apparence",
    'infoAppModal.step1OpenPrefix': "Ouvrez l’onglet ",
    'infoAppModal.appearanceLink': 'Apparence',
    'infoAppModal.step1Suffix':
      ' pour ajouter votre logo, changer les couleurs, etc. pour votre application.',
    'infoAppModal.step2Title': '2. Gérer les discussions',
    'infoAppModal.mainChatCreated':
      'Un salon « Discussion principale » a été créé par défaut et épinglé pour vos utilisateurs.',
    'infoAppModal.manageChatsPrefix': "Gérez les discussions épinglées dans l’onglet ",
    'infoAppModal.chatsLink': 'Discussions',
    'infoAppModal.manageChatsSuffix':
      ' ici. Vous et vos utilisateurs pouvez également créer et rejoindre des discussions via l’interface de votre application.',
    'infoAppModal.step3Title': '3. Tester et intégrer des utilisateurs',
    'infoAppModal.tempUrlPrefix': 'Votre URL d’application web temporaire est ',
    'infoAppModal.copy': 'Copier',
    'infoAppModal.tempUrlSuffix':
      '. Vous pouvez l’envoyer à vos testeurs bêta ou la tester vous-même dans un autre navigateur.',
    'infoAppModal.copiedToClipboard': 'Copié dans le presse-papiers !',
    'infoAppModal.testAsEndUser':
      'Vous êtes connecté en tant que propriétaire de l’application sur notre application de base. Pour tester votre application en tant qu’utilisateur final, ouvrez l’URL ci-dessus dans un autre navigateur ou en mode navigation privée. Une adresse e-mail jetable via un service comme Mailinator, ou un autre compte Google, peut être utile pour votre compte de test « utilisateur final ».',
    'infoAppModal.moreFeatures':
      'Il y a bien d’autres choses que vous pouvez faire, comme les bots IA et les intégrations, changer l’URL de votre application, créer votre application iOS/Android, mettre en place votre propre serveur Ethora, la monnaie interne et la gamification, mais nous vous conseillons de commencer par les bases.',
    'infoAppModal.goodLuck': 'Bonne chance !',
    'infoAppModal.ok': 'OK',
  },
  es: {
    // AclModal.tsx
    'aclModal.title': 'Edición de ACL',
    'aclModal.appLevelTitle': 'Nivel de aplicación',
    'aclModal.appLevelDescription':
      'Aquí puede asignar o quitar los derechos de acceso de un usuario a determinados objetos dentro de la aplicación actual.',
    'aclModal.colName': 'Nombre',
    'aclModal.colCreate': 'Crear',
    'aclModal.colRead': 'Leer',
    'aclModal.colUpdate': 'Actualizar',
    'aclModal.colDelete': 'Eliminar',
    'aclModal.colAdmin': 'Admin',
    'aclModal.rowCreateApps': 'Crear aplicaciones',
    'aclModal.rowSettings': 'Configuración',
    'aclModal.rowUsers': 'Usuarios',
    'aclModal.rowTokens': 'Tokens',
    'aclModal.rowPushNotifications': 'Notificaciones push',
    'aclModal.rowStatistics': 'Estadísticas',
    'aclModal.serverLevelTitle': 'Nivel de servidor',
    'aclModal.serverLevelDescription':
      'Aquí puede asignar o quitar el acceso de un usuario a objetos de nivel de infraestructura, más allá del contexto de cualquier aplicación. Disponible para el plan Empresarial.',
    'aclModal.cancel': 'Cancelar',
    'aclModal.updateAcl': 'Actualizar ACL',

    // PreviewAppModal.tsx
    'previewAppModal.toastCreatedSuccess': '¡Aplicación creada correctamente!',
    'previewAppModal.toastCreateError': 'Error al crear la aplicación.',
    'previewAppModal.welcomeImageAlt': 'Bienvenida',
    'previewAppModal.welcomeTitle': 'Bienvenido a Ethora',
    'previewAppModal.welcomeIntroPart1':
      '¡Gracias por unirte! Este es tu panel de administración. Aquí puedes ',
    'previewAppModal.welcomeIntroCreateApps': 'crear aplicaciones ',
    'previewAppModal.welcomeIntroPart2':
      'para tus proyectos. También puedes gestionar diversas funciones como ',
    'previewAppModal.welcomeIntroChats': 'Chats',
    'previewAppModal.welcomeIntroAnd': ' y ',
    'previewAppModal.welcomeIntroAiBots': 'bots de IA',
    'previewAppModal.welcomeIntroEnd': '.',
    'previewAppModal.letsStart': 'Empecemos',
    'previewAppModal.createFirstAppTitle': '¡Crea tu primera aplicación!',
    'previewAppModal.createFirstAppDescription':
      'Para gestionar contextos de proyecto, puedes crear varias aplicaciones. ¿Cuál será el nombre de tu primera aplicación?',
    'previewAppModal.appNamePlaceholder': 'Nombre de la aplicación',
    'previewAppModal.appNameRequired': 'El nombre de la aplicación es obligatorio',
    'previewAppModal.appNameMinLength':
      'El nombre de la aplicación debe tener al menos 3 caracteres',
    'previewAppModal.continue': 'Continuar',
    'previewAppModal.creationInProgressTitle': '¡Creación de la aplicación en curso!',
    'previewAppModal.deployingMessage':
      'Tu aplicación se está implementando. Espera, esto puede tardar entre 10 y 15 segundos',

    // ImportAppModal.tsx
    'importAppModal.defaultTitle': 'Importar aplicación',
    'importAppModal.defaultHelperText':
      'Selecciona un archivo JSON o ZIP exportado desde otro entorno de Ethora, o pega el JSON directamente. La nueva aplicación se creará en tu tenant con un ID nuevo.',
    'importAppModal.pickFileOrPaste': 'Selecciona un archivo o pega el JSON del paquete.',
    'importAppModal.pastedJsonInvalid': 'El JSON pegado no es válido: ',
    'importAppModal.parseFailed': 'error al analizar',
    'importAppModal.importedSuccessfully': 'Importado correctamente',
    'importAppModal.importFailed': 'Error al importar: ',
    'importAppModal.unknownError': 'error desconocido',
    'importAppModal.close': 'Cerrar',
    'importAppModal.bundleFileLabel': 'Archivo del paquete (.json o .zip)',
    'importAppModal.selectedPrefix': 'Seleccionado:',
    'importAppModal.kb': 'KB',
    'importAppModal.orPasteBelow': 'o pega el JSON a continuación',
    'importAppModal.bundleJsonLabel': 'JSON del paquete',
    'importAppModal.domainNameLabel': 'Nombre de dominio (anulación opcional)',
    'importAppModal.domainNamePlaceholder':
      'déjalo en blanco para conservar el dominio de origen (sufijo automático si hay colisión)',
    'importAppModal.importResultLabel': 'Resultado de la importación',
    'importAppModal.cancel': 'Cancelar',
    'importAppModal.import': 'Importar',
    'importAppModal.importing': 'Importando...',

    // InfoAppModal.tsx
    'infoAppModal.headerPrefix': 'Genial, tu aplicación “',
    'infoAppModal.headerSuffix':
      '” ya está lista. Ahora verás tu panel de administración, donde podrás:',
    'infoAppModal.step1Title': '1. Cambiar la apariencia',
    'infoAppModal.step1OpenPrefix': 'Abre la pestaña ',
    'infoAppModal.appearanceLink': 'Apariencia',
    'infoAppModal.step1Suffix':
      ' donde puedes añadir tu logotipo, cambiar los colores, etc. para tu aplicación.',
    'infoAppModal.step2Title': '2. Gestionar chats',
    'infoAppModal.mainChatCreated':
      'Se ha creado y fijado por defecto una sala “Chat principal” para tus usuarios.',
    'infoAppModal.manageChatsPrefix': 'Gestiona los chats fijados en la pestaña ',
    'infoAppModal.chatsLink': 'Chats',
    'infoAppModal.manageChatsSuffix':
      '. Tú y tus usuarios también podéis crear y uniros a chats desde la interfaz de vuestra aplicación.',
    'infoAppModal.step3Title': '3. Probar e incorporar usuarios',
    'infoAppModal.tempUrlPrefix': 'Tu URL temporal de la aplicación web es ',
    'infoAppModal.copy': 'Copiar',
    'infoAppModal.tempUrlSuffix':
      '. Puedes enviarla a tus probadores beta o probarla tú mismo en otro navegador.',
    'infoAppModal.copiedToClipboard': '¡Copiado al portapapeles!',
    'infoAppModal.testAsEndUser':
      'Has iniciado sesión como propietario de la aplicación dentro de nuestra aplicación base. Para probar tu propia aplicación como usuario final, abre la URL anterior en otro navegador o en modo incógnito. Un correo electrónico desechable mediante un servicio como Mailinator, u otra cuenta de Google, puede resultar útil para tu cuenta de prueba de “usuario final”.',
    'infoAppModal.moreFeatures':
      'Hay muchas más cosas que puedes hacer, como bots de IA e integraciones, cambiar la URL de tu aplicación, crear tu aplicación para iOS/Android, configurar tu propio servidor Ethora, la moneda interna y la gamificación, pero te recomendamos empezar por lo básico.',
    'infoAppModal.goodLuck': '¡Buena suerte!',
    'infoAppModal.ok': 'OK',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
