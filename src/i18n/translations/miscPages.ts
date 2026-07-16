import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Static UI text for a handful of standalone pages that don't share traffic
// with the main app shell: the 403/404/429 error pages, Help & Support,
// What's New, the Cloudflare Turnstile bridge page, the WordPress-embed
// setup wizard, and the Chat page's own chrome (heading, app-switcher,
// yellow context banners). Namespaced per page/area, e.g. 'error404.title',
// 'wpSetup.heading', 'chat.switcherLabel'. Keys ending in a punctuation
// character (e.g. 'chat.toastRestoreFailed', 'chat.toastSwitchFailed')
// are string prefixes meant to be concatenated with a dynamic suffix at the
// call site - see Chat.tsx. 'help.whatsNew.titleWithVersion' contains a
// literal `{version}` placeholder that the call site replaces manually
// (this dictionary has no ICU/interpolation engine).
export const miscPages = {
  en: {
    // --- Error403Page.tsx ---
    'error403.status': '403 error',
    'error403.title': 'Access Forbidden',
    'error403.description':
      "Sorry, you don't have the permissions to access this page.",

    // --- Error404Page.tsx ---
    'error404.status': '404 error',
    'error404.title': 'We can’t find that page',
    'error404.description':
      'Sorry, the page you are looking for doesn’t exist or has been moved.',

    // --- Error429Page.tsx ---
    'error429.status': '429 error',
    'error429.title': 'Too Many Requests',
    'error429.description':
      "You've sent too many requests in a short period. Please wait a moment before trying again.",

    // --- Help.tsx ---
    'help.title': 'Help & Support',
    'help.subtitle':
      'Resources to help you get started and get the most out of Ethora.',
    'help.whatsNew.title': "What's new",
    'help.whatsNew.titleWithVersion': "What's new in {version}",
    'help.whatsNew.description':
      'See what we shipped recently - features, improvements, and quick links to try each one.',
    'help.whatsNew.cta': "See what's new",
    'help.sdk.title': 'SDK',
    'help.sdk.description':
      'Integrating Ethora into your existing apps or building a new web/mobile app? Check out our SDK monorepo on GitHub - it contains the chat component, backend integration helpers, and ready-to-run examples.',
    'help.sdk.cta': 'Open SDK on GitHub',
    'help.mcp.title': 'MCP',
    'help.mcp.description':
      'Use our MCP server with your AI IDE - it has knowledge of all Ethora features, tools, and APIs. Just tell your AI IDE what you want to build and it will use the Ethora MCP to set up your project.',
    'help.mcp.cta': 'Open MCP on GitHub',
    'help.forum.title': 'Forum',
    'help.forum.description':
      'Have technical or product questions? Create a topic in our community forum - the team and other developers reply there.',
    'help.forum.cta': 'Visit the forum',
    'help.bookACall.title': 'Book a call',
    'help.bookACall.description':
      'Get on a call with our product team. We will point you in the right direction so you can leverage Ethora quickly and efficiently.',
    'help.bookACall.cta': 'Book a call',
    'help.status.title': 'Status',
    'help.status.description':
      'Live infrastructure health and uptime for this environment - API, XMPP, push, AI and more. Check here first if something looks off.',
    'help.status.cta': 'Open status page',

    // --- TurnstileBridge.tsx ---
    'turnstileBridge.heading': 'Confirm that you are not a robot',
    'turnstileBridge.subtext': 'Complete the verification to continue',

    // --- WhatsNew.tsx ---
    'whatsNew.title': "What's new",
    'whatsNew.backToHelp': 'Back to Help & Support',
    'whatsNew.subtitle':
      'See what shipped in the latest releases. Each item links into the app or to the deeper story.',
    'whatsNew.cardOpen': 'Open',
    'whatsNew.cardBookACall': 'Book a call',
    'whatsNew.cardLearnMore': 'Learn more',
    'whatsNew.releaseNotesLink': 'Full release notes on GitHub',
    'whatsNew.blogLink': 'Read more on the blog',

    // --- WpSetup/index.tsx ---
    'wpSetup.errorTurnstile': 'Please complete the verification challenge below.',
    'wpSetup.errorPasswordLength': 'Password must be at least 6 characters.',
    'wpSetup.errorSignupFailed':
      'Sign-up failed. Please check your details and try again.',
    'wpSetup.errorSetupFailed': 'Setup failed. Please try again.',
    'wpSetup.heading': 'Set up your AI assistant',
    'wpSetup.stepAccount.subtitle':
      'Create an Ethora account to host your AI assistant.',
    'wpSetup.stepConfigure.subtitle':
      'Confirm what your assistant should know about your site.',
    'wpSetup.stepProvisioning.subtitle':
      'Setting things up. This usually takes under a minute.',
    'wpSetup.stepDone.subtitle': 'Your assistant is ready.',
    'wpSetup.stepError.subtitle': 'Something went wrong during setup.',
    'wpSetup.firstNameLabel': 'First name',
    'wpSetup.lastNameLabel': 'Last name',
    'wpSetup.emailLabel': 'Email',
    'wpSetup.passwordLabel': 'Password',
    'wpSetup.passwordHelper': 'At least 6 characters.',
    'wpSetup.continueButton': 'Continue',
    'wpSetup.appNameLabel': 'App name',
    'wpSetup.siteUrlLabel': 'Site URL to index',
    'wpSetup.siteUrlHelper':
      'We will index up to 100 pages so your assistant can answer questions about your site.',
    'wpSetup.systemPromptLabel': 'System prompt',
    'wpSetup.setupButton': 'Set up my AI',
    'wpSetup.provisioningText':
      'Indexing your site - usually under a minute, up to 100 pages.',
    'wpSetup.doneAlertTitle': 'Your AI assistant is ready.',
    'wpSetup.crawlIncompleteText':
      'Indexing is still finishing in the background. Your chat works now; answers will improve as more pages get indexed.',
    'wpSetup.returnOriginText':
      'You can close this window. Your WordPress plugin has been updated automatically.',
    'wpSetup.copyAppIdText':
      'Copy this App ID into your WordPress plugin settings:',
    'wpSetup.startOverButton': 'Start over',

    // --- Chat.tsx ---
    'chat.heading': 'Chats',
    'chat.switcherLabel': 'Testing chats in',
    'chat.baseApp': 'Base app',
    'chat.baseAppSuffix': '(base app)',
    'chat.switching': 'Switching…',
    'chat.switchingContext': 'Switching app context…',
    'chat.noChatsBanner.prefix':
      'You are within your own App context, but it seems there are no chats available yet. Go to ',
    'chat.noChatsBanner.linkText': 'App Settings → Chats',
    'chat.noChatsBanner.suffix': ' to create Pinned Chats, invite AI bots etc.',
    'chat.demoNoAppsBanner.prefix':
      'You are testing the public chats in our demo base app. Explore as an end user or ',
    'chat.demoNoAppsBanner.linkText': 'create your own App',
    'chat.demoNoAppsBanner.suffix': ' where you will set up your own chats.',
    'chat.demoHasAppsBanner':
      'You are testing the public chats in our demo base app. Use the drop-down selector above to switch to your own Apps and chats.',
    'chat.toastRestoreFailed':
      'Could not restore Chats context. Reverting to your base app. ',
    'chat.toastSwitchFailed': 'Failed to switch app: ',
  },
  fr: {
    // --- Error403Page.tsx ---
    'error403.status': 'Erreur 403',
    'error403.title': 'Accès interdit',
    'error403.description':
      "Désolé, vous n'avez pas les autorisations nécessaires pour accéder à cette page.",

    // --- Error404Page.tsx ---
    'error404.status': 'Erreur 404',
    'error404.title': 'Page introuvable',
    'error404.description':
      "Désolé, la page que vous recherchez n'existe pas ou a été déplacée.",

    // --- Error429Page.tsx ---
    'error429.status': 'Erreur 429',
    'error429.title': 'Trop de requêtes',
    'error429.description':
      'Vous avez envoyé trop de requêtes en peu de temps. Veuillez patienter un instant avant de réessayer.',

    // --- Help.tsx ---
    'help.title': 'Aide et assistance',
    'help.subtitle':
      "Des ressources pour bien démarrer et tirer le meilleur parti d'Ethora.",
    'help.whatsNew.title': 'Nouveautés',
    'help.whatsNew.titleWithVersion': 'Nouveautés de la version {version}',
    'help.whatsNew.description':
      'Découvrez ce que nous avons publié récemment : fonctionnalités, améliorations et liens rapides pour les essayer.',
    'help.whatsNew.cta': 'Voir les nouveautés',
    'help.sdk.title': 'SDK',
    'help.sdk.description':
      "Vous intégrez Ethora à vos applications existantes ou créez une nouvelle application web/mobile ? Consultez notre monorepo SDK sur GitHub : il contient le composant de chat, des aides à l'intégration back-end et des exemples prêts à l'emploi.",
    'help.sdk.cta': 'Ouvrir le SDK sur GitHub',
    'help.mcp.title': 'MCP',
    'help.mcp.description':
      "Utilisez notre serveur MCP avec votre IDE IA : il connaît toutes les fonctionnalités, tous les outils et toutes les API d'Ethora. Indiquez simplement à votre IDE IA ce que vous voulez construire, il utilisera le MCP Ethora pour configurer votre projet.",
    'help.mcp.cta': 'Ouvrir le MCP sur GitHub',
    'help.forum.title': 'Forum',
    'help.forum.description':
      "Des questions techniques ou produit ? Créez un sujet sur notre forum communautaire : l'équipe et d'autres développeurs y répondent.",
    'help.forum.cta': 'Visiter le forum',
    'help.bookACall.title': 'Réserver un appel',
    'help.bookACall.description':
      "Échangez avec notre équipe produit lors d'un appel. Nous vous orienterons pour que vous puissiez tirer parti d'Ethora rapidement et efficacement.",
    'help.bookACall.cta': 'Réserver un appel',
    'help.status.title': 'Statut',
    'help.status.description':
      "État de l'infrastructure et disponibilité en temps réel pour cet environnement : API, XMPP, notifications push, IA et plus encore. À consulter en premier en cas de problème.",
    'help.status.cta': 'Ouvrir la page de statut',

    // --- TurnstileBridge.tsx ---
    'turnstileBridge.heading': "Confirmez que vous n'êtes pas un robot",
    'turnstileBridge.subtext': 'Terminez la vérification pour continuer',

    // --- WhatsNew.tsx ---
    'whatsNew.title': 'Nouveautés',
    'whatsNew.backToHelp': 'Retour à Aide et assistance',
    'whatsNew.subtitle':
      "Découvrez le contenu des dernières versions. Chaque élément renvoie vers l'application ou vers plus de détails.",
    'whatsNew.cardOpen': 'Ouvrir',
    'whatsNew.cardBookACall': 'Réserver un appel',
    'whatsNew.cardLearnMore': 'En savoir plus',
    'whatsNew.releaseNotesLink': 'Notes de version complètes sur GitHub',
    'whatsNew.blogLink': 'Lire la suite sur le blog',

    // --- WpSetup/index.tsx ---
    'wpSetup.errorTurnstile':
      'Veuillez compléter le test de vérification ci-dessous.',
    'wpSetup.errorPasswordLength':
      'Le mot de passe doit comporter au moins 6 caractères.',
    'wpSetup.errorSignupFailed':
      "L'inscription a échoué. Veuillez vérifier vos informations et réessayer.",
    'wpSetup.errorSetupFailed': 'La configuration a échoué. Veuillez réessayer.',
    'wpSetup.heading': 'Configurez votre assistant IA',
    'wpSetup.stepAccount.subtitle':
      'Créez un compte Ethora pour héberger votre assistant IA.',
    'wpSetup.stepConfigure.subtitle':
      'Confirmez ce que votre assistant doit savoir sur votre site.',
    'wpSetup.stepProvisioning.subtitle':
      "Configuration en cours. Cela prend généralement moins d'une minute.",
    'wpSetup.stepDone.subtitle': 'Votre assistant est prêt.',
    'wpSetup.stepError.subtitle':
      "Une erreur s'est produite pendant la configuration.",
    'wpSetup.firstNameLabel': 'Prénom',
    'wpSetup.lastNameLabel': 'Nom',
    'wpSetup.emailLabel': 'E-mail',
    'wpSetup.passwordLabel': 'Mot de passe',
    'wpSetup.passwordHelper': 'Au moins 6 caractères.',
    'wpSetup.continueButton': 'Continuer',
    'wpSetup.appNameLabel': "Nom de l'application",
    'wpSetup.siteUrlLabel': 'URL du site à indexer',
    'wpSetup.siteUrlHelper':
      "Nous indexerons jusqu'à 100 pages afin que votre assistant puisse répondre aux questions sur votre site.",
    'wpSetup.systemPromptLabel': 'Consigne système',
    'wpSetup.setupButton': 'Configurer mon IA',
    'wpSetup.provisioningText':
      "Indexation de votre site : généralement moins d'une minute, jusqu'à 100 pages.",
    'wpSetup.doneAlertTitle': 'Votre assistant IA est prêt.',
    'wpSetup.crawlIncompleteText':
      "L'indexation se termine encore en arrière-plan. Votre chat fonctionne déjà ; les réponses s'amélioreront à mesure que d'autres pages seront indexées.",
    'wpSetup.returnOriginText':
      'Vous pouvez fermer cette fenêtre. Votre extension WordPress a été mise à jour automatiquement.',
    'wpSetup.copyAppIdText':
      "Copiez cet identifiant d'application dans les paramètres de votre extension WordPress :",
    'wpSetup.startOverButton': 'Recommencer',

    // --- Chat.tsx ---
    'chat.heading': 'Discussions',
    'chat.switcherLabel': 'Test des discussions dans',
    'chat.baseApp': 'Application de base',
    'chat.baseAppSuffix': '(application de base)',
    'chat.switching': 'Changement…',
    'chat.switchingContext': "Changement de contexte d'application…",
    'chat.noChatsBanner.prefix':
      "Vous êtes dans le contexte de votre propre application, mais aucune discussion ne semble encore disponible. Rendez-vous dans ",
    'chat.noChatsBanner.linkText': "Paramètres de l'application → Discussions",
    'chat.noChatsBanner.suffix':
      ' pour créer des discussions épinglées, inviter des bots IA, etc.',
    'chat.demoNoAppsBanner.prefix':
      "Vous testez les discussions publiques de notre application de démonstration. Explorez en tant qu'utilisateur final ou ",
    'chat.demoNoAppsBanner.linkText': 'créez votre propre application',
    'chat.demoNoAppsBanner.suffix':
      ' où vous configurerez vos propres discussions.',
    'chat.demoHasAppsBanner':
      "Vous testez les discussions publiques de notre application de démonstration. Utilisez le sélecteur déroulant ci-dessus pour passer à vos propres applications et discussions.",
    'chat.toastRestoreFailed':
      'Impossible de restaurer le contexte des discussions. Retour à votre application de base. ',
    'chat.toastSwitchFailed': "Échec du changement d'application : ",
  },
  es: {
    // --- Error403Page.tsx ---
    'error403.status': 'Error 403',
    'error403.title': 'Acceso prohibido',
    'error403.description':
      'Lo sentimos, no tienes permisos para acceder a esta página.',

    // --- Error404Page.tsx ---
    'error404.status': 'Error 404',
    'error404.title': 'No encontramos esa página',
    'error404.description':
      'Lo sentimos, la página que buscas no existe o ha sido movida.',

    // --- Error429Page.tsx ---
    'error429.status': 'Error 429',
    'error429.title': 'Demasiadas solicitudes',
    'error429.description':
      'Has enviado demasiadas solicitudes en poco tiempo. Espera un momento antes de volver a intentarlo.',

    // --- Help.tsx ---
    'help.title': 'Ayuda y soporte',
    'help.subtitle':
      'Recursos para empezar y sacar el máximo partido a Ethora.',
    'help.whatsNew.title': 'Novedades',
    'help.whatsNew.titleWithVersion': 'Novedades de la versión {version}',
    'help.whatsNew.description':
      'Descubre lo que hemos lanzado recientemente: funciones, mejoras y enlaces rápidos para probarlas.',
    'help.whatsNew.cta': 'Ver novedades',
    'help.sdk.title': 'SDK',
    'help.sdk.description':
      '¿Estás integrando Ethora en tus aplicaciones existentes o creando una nueva app web/móvil? Consulta nuestro monorepo del SDK en GitHub: incluye el componente de chat, ayudantes de integración backend y ejemplos listos para usar.',
    'help.sdk.cta': 'Abrir el SDK en GitHub',
    'help.mcp.title': 'MCP',
    'help.mcp.description':
      'Usa nuestro servidor MCP con tu IDE de IA: conoce todas las funciones, herramientas y API de Ethora. Solo dile a tu IDE de IA qué quieres construir y usará el MCP de Ethora para configurar tu proyecto.',
    'help.mcp.cta': 'Abrir el MCP en GitHub',
    'help.forum.title': 'Foro',
    'help.forum.description':
      '¿Tienes preguntas técnicas o sobre el producto? Crea un tema en nuestro foro comunitario: el equipo y otros desarrolladores responden allí.',
    'help.forum.cta': 'Visitar el foro',
    'help.bookACall.title': 'Reservar una llamada',
    'help.bookACall.description':
      'Habla por teléfono con nuestro equipo de producto. Te orientaremos para que puedas aprovechar Ethora de forma rápida y eficiente.',
    'help.bookACall.cta': 'Reservar una llamada',
    'help.status.title': 'Estado',
    'help.status.description':
      'Estado de la infraestructura y disponibilidad en tiempo real para este entorno: API, XMPP, notificaciones push, IA y más. Consúltalo primero si algo no funciona bien.',
    'help.status.cta': 'Abrir página de estado',

    // --- TurnstileBridge.tsx ---
    'turnstileBridge.heading': 'Confirma que no eres un robot',
    'turnstileBridge.subtext': 'Completa la verificación para continuar',

    // --- WhatsNew.tsx ---
    'whatsNew.title': 'Novedades',
    'whatsNew.backToHelp': 'Volver a Ayuda y soporte',
    'whatsNew.subtitle':
      'Descubre lo que se lanzó en las últimas versiones. Cada elemento enlaza a la aplicación o a más información.',
    'whatsNew.cardOpen': 'Abrir',
    'whatsNew.cardBookACall': 'Reservar una llamada',
    'whatsNew.cardLearnMore': 'Saber más',
    'whatsNew.releaseNotesLink': 'Notas de la versión completas en GitHub',
    'whatsNew.blogLink': 'Leer más en el blog',

    // --- WpSetup/index.tsx ---
    'wpSetup.errorTurnstile': 'Completa el desafío de verificación a continuación.',
    'wpSetup.errorPasswordLength':
      'La contraseña debe tener al menos 6 caracteres.',
    'wpSetup.errorSignupFailed':
      'El registro falló. Comprueba tus datos e inténtalo de nuevo.',
    'wpSetup.errorSetupFailed': 'La configuración falló. Inténtalo de nuevo.',
    'wpSetup.heading': 'Configura tu asistente de IA',
    'wpSetup.stepAccount.subtitle':
      'Crea una cuenta de Ethora para alojar tu asistente de IA.',
    'wpSetup.stepConfigure.subtitle':
      'Confirma lo que tu asistente debe saber sobre tu sitio.',
    'wpSetup.stepProvisioning.subtitle':
      'Configurando todo. Esto suele tardar menos de un minuto.',
    'wpSetup.stepDone.subtitle': 'Tu asistente está listo.',
    'wpSetup.stepError.subtitle': 'Algo salió mal durante la configuración.',
    'wpSetup.firstNameLabel': 'Nombre',
    'wpSetup.lastNameLabel': 'Apellido',
    'wpSetup.emailLabel': 'Correo electrónico',
    'wpSetup.passwordLabel': 'Contraseña',
    'wpSetup.passwordHelper': 'Al menos 6 caracteres.',
    'wpSetup.continueButton': 'Continuar',
    'wpSetup.appNameLabel': 'Nombre de la aplicación',
    'wpSetup.siteUrlLabel': 'URL del sitio a indexar',
    'wpSetup.siteUrlHelper':
      'Indexaremos hasta 100 páginas para que tu asistente pueda responder preguntas sobre tu sitio.',
    'wpSetup.systemPromptLabel': 'Instrucción del sistema',
    'wpSetup.setupButton': 'Configurar mi IA',
    'wpSetup.provisioningText':
      'Indexando tu sitio: normalmente menos de un minuto, hasta 100 páginas.',
    'wpSetup.doneAlertTitle': 'Tu asistente de IA está listo.',
    'wpSetup.crawlIncompleteText':
      'La indexación aún está terminando en segundo plano. Tu chat ya funciona; las respuestas mejorarán a medida que se indexen más páginas.',
    'wpSetup.returnOriginText':
      'Puedes cerrar esta ventana. Tu plugin de WordPress se ha actualizado automáticamente.',
    'wpSetup.copyAppIdText':
      'Copia este ID de aplicación en la configuración de tu plugin de WordPress:',
    'wpSetup.startOverButton': 'Empezar de nuevo',

    // --- Chat.tsx ---
    'chat.heading': 'Chats',
    'chat.switcherLabel': 'Probando chats en',
    'chat.baseApp': 'Aplicación base',
    'chat.baseAppSuffix': '(aplicación base)',
    'chat.switching': 'Cambiando…',
    'chat.switchingContext': 'Cambiando el contexto de la aplicación…',
    'chat.noChatsBanner.prefix':
      'Estás dentro del contexto de tu propia aplicación, pero parece que aún no hay chats disponibles. Ve a ',
    'chat.noChatsBanner.linkText': 'Configuración de la app → Chats',
    'chat.noChatsBanner.suffix':
      ' para crear chats fijados, invitar bots de IA, etc.',
    'chat.demoNoAppsBanner.prefix':
      'Estás probando los chats públicos de nuestra aplicación de demostración. Explora como usuario final o ',
    'chat.demoNoAppsBanner.linkText': 'crea tu propia aplicación',
    'chat.demoNoAppsBanner.suffix': ' donde podrás configurar tus propios chats.',
    'chat.demoHasAppsBanner':
      'Estás probando los chats públicos de nuestra aplicación de demostración. Usa el selector desplegable de arriba para cambiar a tus propias aplicaciones y chats.',
    'chat.toastRestoreFailed':
      'No se pudo restaurar el contexto de chats. Volviendo a tu aplicación base. ',
    'chat.toastSwitchFailed': 'Error al cambiar de aplicación: ',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
