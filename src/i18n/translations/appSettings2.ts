import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// App Settings surfaces: AI Widget, Home Screen, Menu, Mobile App, the
// "create app" progress banner, Sign-on Options, Visibility, Web App, Web +
// Mobile App (combined) and the read-only Widget preview tab. Keys are
// namespaced per source file (see the CLAUDE.md pattern) so this area can be
// edited independently of other translation dictionaries.
export const appSettings2 = {
  en: {
    // --- AIWidget.tsx ---
    'appSettingsAIWidget.disabledBannerStrong':
      'AI features are not enabled in this deployment.',
    'appSettingsAIWidget.disabledBannerText':
      'The AI Widget is shown here in preview mode. Contact your administrator to enable AI features.',
    'appSettingsAIWidget.aiBotLabel': 'AI bot:',
    'appSettingsAIWidget.statusEnabled': 'enabled',
    'appSettingsAIWidget.statusDisabled': 'disabled',
    'appSettingsAIWidget.enableButton': 'Enable',
    'appSettingsAIWidget.disableButton': 'Disable',
    'appSettingsAIWidget.ragLabel': 'RAG:',
    'appSettingsAIWidget.ragEmpty': 'empty',
    'appSettingsAIWidget.conversationsLabel': 'Conversations:',
    'appSettingsAIWidget.stopTestButton': 'Stop test',
    'appSettingsAIWidget.newSessionButton': 'New session',
    'appSettingsAIWidget.testWidgetButton': 'Test widget',
    'appSettingsAIWidget.enableBotFirstTooltip':
      'Enable the AI bot first to test the widget here.',
    'appSettingsAIWidget.widgetHostingNotConfiguredTooltip':
      'Widget hosting is not configured for this deployment.',

    // --- HomeScreen.tsx ---
    'appSettingsHomeScreen.description':
      'Choose which screen your Users will see immediately after log in.',
    'appSettingsHomeScreen.radioGroupAriaLabel': 'Server size',
    'appSettingsHomeScreen.listOfChatsLabel': 'List of Chats',
    'appSettingsHomeScreen.listOfChatsDescription':
      'User will be see the list of chats available to them with tabs for Pinned, group and private chats.',
    'appSettingsHomeScreen.goodForLabel': 'Good for:',
    'appSettingsHomeScreen.communityWord': 'community',
    'appSettingsHomeScreen.communityUseCase':
      'use case where quick access to multiple conversations is important.',
    'appSettingsHomeScreen.profileWalletLabel': 'Profile / Wallet',
    'appSettingsHomeScreen.profileWalletDescription':
      'User will see their Profile and any documents or assets stored there. User will be able to share their profile or individual documents / assets.',
    'appSettingsHomeScreen.digitalWalletWord': 'digital wallet',
    'appSettingsHomeScreen.digitalWalletUseCase':
      "use case where quick access to User's documents, assets or QR pass is important.",
    'appSettingsHomeScreen.adminPanelLabel': 'Admin panel',
    'appSettingsHomeScreen.adminPanelDescription':
      'Users will see Admin first, as long as they have permissions.',
    'appSettingsHomeScreen.usefulWhenPrefix': 'Useful when you on-board many',
    'appSettingsHomeScreen.adminUsersWord': 'admin users',
    'appSettingsHomeScreen.adminUsersSuffix':
      'or for a Base App on your dedicated server.',

    // --- Menu.tsx ---
    'appSettingsMenu.description':
      'Manage items that are displayed in your App menu.',
    'appSettingsMenu.emailPasswordLabel': 'Email + Password',
    'appSettingsMenu.emailPasswordDescription':
      'Each of your Users is equipped with a personal digital wallet. User will see their Assets (wallet contents) in their Profile screen. Depending on configuration, the Profile and Assets can also be visible to other Users.',
    'appSettingsMenu.chatsLabel': 'Chats',
    'appSettingsMenu.chatsDescription':
      'Shows a list of Chats including your default Pinned Chats and also group and private conversations that your User is a part of.',
    'appSettingsMenu.settingsLabel': 'Settings',
    'appSettingsMenu.settingsDescription':
      'This is where your User can manage their visibility and privacy settings, as well as download their data or delete their account (GDPR and CCPA compliance requirement).',

    // --- MobileApp.tsx ---
    'appSettingsMobileApp.heading': 'Mobile App',
    'appSettingsMobileApp.quickNoCodeHeading': 'Quick no code options',
    'appSettingsMobileApp.quickNoCodePrefix':
      'For quick no code integration, please check our',
    'appSettingsMobileApp.webAppLinkText': 'Web app',
    'appSettingsMobileApp.and': 'and',
    'appSettingsMobileApp.aiWidgetLinkText': 'AI Widget',
    'appSettingsMobileApp.quickNoCodeSuffix':
      'sections. Our web app is responsive and you can try using it on your mobile devices before you commit to building a native app.',
    'appSettingsMobileApp.reactNativeComponentDesc':
      'Ethora Chat Component for React Native. Handy when you need to integrate chat or AI agent into your existing RN app.',
    'appSettingsMobileApp.reactNativeTemplateDesc':
      "a full app template. Handy when you don't have an app and prefer a ready solution.",
    'appSettingsMobileApp.swiftSdkDesc': 'Swift SDK',
    'appSettingsMobileApp.kotlinSdkDesc': 'Kotlin SDK',
    'appSettingsMobileApp.pushNotificationsHeading': 'Push Notifications',
    'appSettingsMobileApp.followPrefix': 'Follow',
    'appSettingsMobileApp.thisManualLinkText': 'this manual',
    'appSettingsMobileApp.followMiddle':
      'to set up your Firebase account. Extract and upload your',
    'appSettingsMobileApp.followSuffix':
      'This will enable your users to receive push notifications for chat messages they missed while being offline.',
    'appSettingsMobileApp.uploadButton': 'Upload',
    'appSettingsMobileApp.deleteButton': 'Delete',
    'appSettingsMobileApp.deleteModal.title': 'Delete service account?',
    'appSettingsMobileApp.deleteModal.message':
      'Your Firebase service account will be removed and your users will stop receiving push notifications for missed chat messages. You can upload a new service-account.json at any time.',
    'appSettingsMobileApp.deleteModal.confirmLabel': 'Delete',
    'appSettingsMobileApp.toast.uploadSuccess':
      'Firebase service account uploaded',
    'appSettingsMobileApp.toast.uploadFailed':
      'Failed to upload Firebase service account',
    'appSettingsMobileApp.toast.deleteSuccess':
      'Firebase service account deleted',
    'appSettingsMobileApp.toast.deleteFailed':
      'Failed to delete Firebase service account',

    // --- ProgressCreateApp.tsx ---
    'appSettingsProgressCreateApp.stepAppCreated': 'App Created',
    'appSettingsProgressCreateApp.stepAppearanceAdjusted':
      'Appearance Adjusted',
    'appSettingsProgressCreateApp.stepEndUserCreated': 'End User Created',
    'appSettingsProgressCreateApp.hintOpenPrefix': 'Hint: open',
    'appSettingsProgressCreateApp.appearanceTabButton': 'Appearance tab',
    'appSettingsProgressCreateApp.hintOpenSuffix':
      'to adjust your branding.',
    'appSettingsProgressCreateApp.hintGoToPrefix': 'Hint: go to',
    'appSettingsProgressCreateApp.webAppTabButton': 'Web app tab',
    'appSettingsProgressCreateApp.hintGoToSuffix':
      'and copy your app link to test as end-user.',
    'appSettingsProgressCreateApp.completedMessage':
      '🎉 Well done! You have successfully completed the Initial Setup!',

    // --- SignonOptions.tsx ---
    'appSettingsSignonOptions.description':
      'Choose which sign on options to enable in your App. This controls how your Users create new accounts and login.',
    // --- SignonOptions.tsx: self-service registration switch ---
    'appSettingsSignonOptions.userRegistrationHeading': 'User registration',
    'appSettingsSignonOptions.userRegistrationDescription':
      'Controls whether visitors can create their own account in your App. This is enforced by the server, not just hidden in the interface.',
    'appSettingsSignonOptions.allowUserRegistrationLabel':
      'Allow new users to register',
    'appSettingsSignonOptions.registrationClosedWarning':
      'Registration is closed. Only you can add users - from the dashboard, by batch import, or via the API. Users who already have an account can still sign in, reset their password and stay signed in.',
    'appSettingsSignonOptions.registrationOpenHint':
      'Anyone who reaches your App can sign up. Turn this off if you provision every user yourself.',
    'appSettingsSignonOptions.standardLoginHeading': 'Standard login',
    'appSettingsSignonOptions.standardLoginDescription':
      'User is required to create an account with their e-mail and memorize the password. They will need to confirm their e-mail address by clicking a link. E-mails from the platform can be customized with your branding.',
    'appSettingsSignonOptions.emailPasswordLabel': 'Email + Password',
    'appSettingsSignonOptions.socialSignOnHeading': 'Social Sign-On',
    'appSettingsSignonOptions.socialSignOnDescription':
      "Allows your users to sign on into your app with popular platform accounts. It will still create an account but the User won't have to memorize their password.",
    'appSettingsSignonOptions.googleLabel': 'Google',
    'appSettingsSignonOptions.firebaseWarning':
      'Make sure to add your App Firebase settings for this to work.',
    'appSettingsSignonOptions.appleLabel': 'Apple',
    'appSettingsSignonOptions.facebookLabel': 'Facebook',
    'appSettingsSignonOptions.metamaskLabel': 'Metamask',
    'appSettingsSignonOptions.web3Description':
      'Web3 projects will benefit from signing in with their existing crypto wallet.',
    'appSettingsSignonOptions.customBackendHeading':
      'Custom backend integration',
    'appSettingsSignonOptions.customBackendDescription':
      'Some projects prefer to create accounts for Users programmatically, connecting their existing legacy software with Ethora. In this case, your legacy software will control accounts via our Users API (or a custom endpoint) and your Users will either (a) login via e-mail + password route, (b) login via a custom login screen, or (c) be logged on automatically as part of an embedded experience. See Documentation and use Forum or contact us for help with this option.',
    'appSettingsSignonOptions.apiIntegrationLabel':
      'API integration with your backend',

    // --- Visibility.tsx ---
    'appSettingsVisibility.description1':
      'These are the default permissions to be applied to all Users created in your App.',
    'appSettingsVisibility.description2':
      'Keep the recommended settings if you are not sure and you can come back to this later.',
    'appSettingsVisibility.profilesVisibilityHeading': 'Profiles Visibility',
    'appSettingsVisibility.profilesVisibilityDesc1':
      'By default, User profiles can be viewed by any other Users and bots after they follow a correct link, a QR code or tap on it in the Chat.',
    'appSettingsVisibility.profilesVisibilityDesc2':
      'For tighter security and business logic driven sharing, you can disable this. Your Users will still be able to share their profiles with others, but they will have to do it explicitly via a special sharing link.',
    'appSettingsVisibility.profilesViewableLabel':
      'User Profiles can be viewed by others',
    'appSettingsVisibility.profilesSharedExplicitlyLabel':
      'User Profiles need to be explicitly shared by the User for others to see',
    'appSettingsVisibility.assetsVisibilityHeading': 'Assets Visibility',
    'appSettingsVisibility.assetsVisibilityDesc1':
      'Assets are Documents, Files, Media, Tokens (depending on what your App supports), stored within Users wallets.',
    'appSettingsVisibility.assetsVisibilityDesc2':
      'Depending on your App settings, Users either upload/create Assets themselves or these are managed by your own business logic via API.',
    'appSettingsVisibility.assetsVisibilityDesc3':
      "By default, other Users can see one's Assets in one's Profile.",
    'appSettingsVisibility.assetsVisibilityDesc4':
      'Alternative, more restricted setting, is where Assets are hidden. Profile will only display items such as name, photo, description, but no Assets. Users will still be able to share their Assets with others, but they will have to do it explicitly via a special sharing link, individually for each Asset.',
    'appSettingsVisibility.assetsViewableLabel':
      "All User's Assets can be viewed by all who can view User's Profile",
    'appSettingsVisibility.assetsHiddenLabel':
      "User's Assets are hidden. User has to explicitly share each Asset individually via a sharing link for others to see.",
    'appSettingsVisibility.appLockedAccountsHeading': 'App-locked accounts',
    'appSettingsVisibility.appLockedDesc1':
      'By default, your User accounts are App locked. This means that your Users can NOT sign on into other Apps within your Organization or any other Apps within the Server.',
    'appSettingsVisibility.appLockedDesc2':
      'You may switch this setting to Unlocked if you want your Users to have self-sovereign accounts which makes them free to login into other Apps in the Server, discover their content and fully control their own account.',
    'appSettingsVisibility.accountsTiedLabel':
      'All User accounts are tied to your App',
    'appSettingsVisibility.accountsUnlockedLabel':
      'User accounts are unlocked (self-sovereign)',

    // --- WebApp.tsx ---
    'appSettingsWebApp.domainNameHeading': 'Domain name',
    'appSettingsWebApp.domainNameDescription':
      'Your web app is hosted in our cloud with a complimentary 2nd level domain name available for Free plan users and 1st level domain name for Business plan users.',
    'appSettingsWebApp.selfHostInfo':
      'Self-host option: just clone our engine from github, build and run it on your server.',
    'appSettingsWebApp.appNamePlaceholder': 'Your App Name',
    'appSettingsWebApp.upgradeToBusinessButton': 'Upgrade to Business',
    'appSettingsWebApp.toUnlockText': 'to unlock',
    'appSettingsWebApp.googleFirebaseHeading':
      'Google sign-in and Firebase analytics',
    'appSettingsWebApp.googleFirebaseDescription':
      'Firebase credentials are required to allow your users to sign on via Google Account. Also this allows you to track your app usage analytics in your Firebase console. These options will be disabled if credentials are not provided.',
    'appSettingsWebApp.firebaseConfigInfo':
      'Copy paste the configuration from your Firebase Console',
    'appSettingsWebApp.aiBotHeading': 'AI Bot',
    'appSettingsWebApp.chatRoomHeading': 'Chat room',
    'appSettingsWebApp.selectChatRoomText':
      'Select Chat room where the bot should be deployed',
    'appSettingsWebApp.chatSelectLabel': 'Chat',
    'appSettingsWebApp.noneLabel': 'None',
    'appSettingsWebApp.displayNameHeading': 'Display Name',
    'appSettingsWebApp.displayNameTooltip':
      "Only the app owner can change the bot's name.",
    'appSettingsWebApp.displayNameDescription':
      'Which Display Name should the bot use?',
    'appSettingsWebApp.firstNamePlaceholder': 'First name',
    'appSettingsWebApp.lastNamePlaceholder': 'Last name',
    'appSettingsWebApp.greetingMessageHeading':
      'Greeting message when joining the room',
    'appSettingsWebApp.greetingMessageDescription':
      'Bot sends this message as a greeting once launched. Delete for no message.',
    'appSettingsWebApp.defaultGreetingLabel':
      'Hello, I am your AI assistant. How can I help you today?',
    'appSettingsWebApp.responseTriggerHeading': 'Response trigger',
    'appSettingsWebApp.responseTriggerDescription':
      'To which messages should the bot respond',
    'appSettingsWebApp.anyMessageLabel': 'Any message from another user',
    'appSettingsWebApp.botPrefixLabel':
      "Any messages addressed to the bot or with '/bot' prefix",
    'appSettingsWebApp.additionalSettingsHeading': 'Additional settings',
    'appSettingsWebApp.additionalSettingsPrefix': 'Use',
    'appSettingsWebApp.aiWidgetLinkText': 'AI Widget',
    'appSettingsWebApp.additionalSettingsSuffix':
      'tab for additional settings such as prompt and documents upload.',

    // --- WebMobileApp.tsx ---
    'appSettingsWebMobileApp.webAppHeading': 'Web app',
    'appSettingsWebMobileApp.domainNameHeading': 'Domain name',
    'appSettingsWebMobileApp.domainNameDescription':
      'Your web app is hosted in our cloud with a complimentary 2nd level domain name available for Free plan users and 1st level domain name for Business plan users.',
    'appSettingsWebMobileApp.selfHostInfo':
      'Self-host option: just clone our engine from github, build and run it on your server.',
    'appSettingsWebMobileApp.appNamePlaceholder': 'Your App Name',
    'appSettingsWebMobileApp.upgradeToBusinessButton': 'Upgrade to Business',
    'appSettingsWebMobileApp.toUnlockText': 'to unlock',
    'appSettingsWebMobileApp.googleFirebaseHeading':
      'Google sign-in and Firebase analytics',
    'appSettingsWebMobileApp.googleFirebaseDescription':
      'Firebase credentials are required to allow your users to sign on via Google Account. Also this allows you to track your app usage analytics in your Firebase console. These options will be disabled if credentials are not provided.',
    'appSettingsWebMobileApp.firebaseConfigInfo':
      'Copy paste the configuration from your Firebase Console',
    'appSettingsWebMobileApp.mobileAppSectionHeading': 'Mobile app',
    'appSettingsWebMobileApp.mobileAppHeading': 'Mobile App',
    'appSettingsWebMobileApp.bundleIdDescription':
      'Please enter Bundle ID. Bundle ID should be unique to identify your app for Appstore and other purposes.',
    'appSettingsWebMobileApp.bundleIdPlaceholder': 'Bundle ID',
    'appSettingsWebMobileApp.prepareReactNativeBuildButton':
      'Prepare React Native Build',
    'appSettingsWebMobileApp.androidBuildHeading': 'Android build',
    'appSettingsWebMobileApp.googleServicesJsonHeading':
      'Google Services JSON',
    'appSettingsWebMobileApp.uploadButton': 'Upload',
    'appSettingsWebMobileApp.firebaseServerKeyHeading':
      'Firebase server key (for push notifications)',
    'appSettingsWebMobileApp.firebaseServerKeyPlaceholder':
      'Firebase Server Key',
    'appSettingsWebMobileApp.iosBuildHeading': 'IOS build',
    'appSettingsWebMobileApp.googleServicesPlistHeading':
      'Google Services PLIST',
    'appSettingsWebMobileApp.pushNotificationsCertHeading':
      'Push Notifications Certificate (Apple)',

    // --- Widget.tsx ---
    'appSettingsWidget.homeScreenHeading': 'Home screen',
    'appSettingsWidget.homeScreenDescription':
      'Choose which screen your Users will see immediately after log in.',
    'appSettingsWidget.radioGroupAriaLabel': 'Server size',
    'appSettingsWidget.listOfChatsLabel': 'List of Chats',
    'appSettingsWidget.listOfChatsDescription':
      'User will be see the list of chats available to them with tabs for Pinned, group and private chats.',
    'appSettingsWidget.goodForLabel': 'Good for:',
    'appSettingsWidget.communityWord': 'community',
    'appSettingsWidget.communityUseCase':
      'use case where quick access to multiple conversations is important.',
    'appSettingsWidget.profileWalletLabel': 'Profile / Wallet',
    'appSettingsWidget.profileWalletDescription':
      'User will see their Profile and any documents or assets stored there. User will be able to share their profile or individual documents / assets.',
    'appSettingsWidget.digitalWalletWord': 'digital wallet',
    'appSettingsWidget.digitalWalletUseCase':
      "use case where quick access to User's documents, assets or QR pass is important.",
    'appSettingsWidget.adminPanelLabel': 'Admin panel',
    'appSettingsWidget.adminPanelDescription':
      'Users will see Admin first, as long as they have permissions.',
    'appSettingsWidget.usefulWhenPrefix': 'Useful when you on-board many',
    'appSettingsWidget.adminUsersWord': 'admin users',
    'appSettingsWidget.adminUsersSuffix':
      'or for a Base App on your dedicated server.',
    'appSettingsWidget.menuHeading': 'Menu',
    'appSettingsWidget.menuDescription':
      'Manage items that are displayed in your App menu.',
    'appSettingsWidget.emailPasswordLabel': 'Email + Password',
    'appSettingsWidget.emailPasswordDescription':
      'Each of your Users is equipped with a personal digital wallet. User will see their Assets (wallet contents) in their Profile screen. Depending on configuration, the Profile and Assets can also be visible to other Users.',
    'appSettingsWidget.chatsLabel': 'Chats',
    'appSettingsWidget.chatsDescription':
      'Shows a list of Chats including your default Pinned Chats and also group and private conversations that your User is a part of.',
    'appSettingsWidget.settingsLabel': 'Settings',
    'appSettingsWidget.settingsDescription':
      'This is where your User can manage their visibility and privacy settings, as well as download their data or delete their account (GDPR and CCPA compliance requirement).',
  },
  fr: {
    // --- AIWidget.tsx ---
    'appSettingsAIWidget.disabledBannerStrong':
      "Les fonctionnalités d'IA ne sont pas activées sur ce déploiement.",
    'appSettingsAIWidget.disabledBannerText':
      "Le Widget IA est affiché ici en mode aperçu. Contactez votre administrateur pour activer les fonctionnalités d'IA.",
    'appSettingsAIWidget.aiBotLabel': 'Bot IA :',
    'appSettingsAIWidget.statusEnabled': 'activé',
    'appSettingsAIWidget.statusDisabled': 'désactivé',
    'appSettingsAIWidget.enableButton': 'Activer',
    'appSettingsAIWidget.disableButton': 'Désactiver',
    'appSettingsAIWidget.ragLabel': 'RAG :',
    'appSettingsAIWidget.ragEmpty': 'vide',
    'appSettingsAIWidget.conversationsLabel': 'Conversations :',
    'appSettingsAIWidget.stopTestButton': 'Arrêter le test',
    'appSettingsAIWidget.newSessionButton': 'Nouvelle session',
    'appSettingsAIWidget.testWidgetButton': 'Tester le widget',
    'appSettingsAIWidget.enableBotFirstTooltip':
      "Activez d'abord le bot IA pour tester le widget ici.",
    'appSettingsAIWidget.widgetHostingNotConfiguredTooltip':
      "L'hébergement du widget n'est pas configuré pour ce déploiement.",

    // --- HomeScreen.tsx ---
    'appSettingsHomeScreen.description':
      'Choisissez l’écran que vos Utilisateurs verront immédiatement après leur connexion.',
    'appSettingsHomeScreen.radioGroupAriaLabel': 'Taille du serveur',
    'appSettingsHomeScreen.listOfChatsLabel': 'Liste des discussions',
    'appSettingsHomeScreen.listOfChatsDescription':
      'L’Utilisateur verra la liste des discussions qui lui sont accessibles, avec des onglets pour les discussions épinglées, de groupe et privées.',
    'appSettingsHomeScreen.goodForLabel': 'Idéal pour :',
    'appSettingsHomeScreen.communityWord': 'communauté',
    'appSettingsHomeScreen.communityUseCase':
      "un cas d'usage où l'accès rapide à plusieurs conversations est important.",
    'appSettingsHomeScreen.profileWalletLabel': 'Profil / Portefeuille',
    'appSettingsHomeScreen.profileWalletDescription':
      'L’Utilisateur verra son Profil ainsi que tous les documents ou actifs qui y sont stockés. L’Utilisateur pourra partager son profil ou des documents / actifs individuels.',
    'appSettingsHomeScreen.digitalWalletWord': 'portefeuille numérique',
    'appSettingsHomeScreen.digitalWalletUseCase':
      "un cas d'usage où l'accès rapide aux documents, actifs ou pass QR de l'Utilisateur est important.",
    'appSettingsHomeScreen.adminPanelLabel': "Panneau d'administration",
    'appSettingsHomeScreen.adminPanelDescription':
      'Les Utilisateurs verront l’Administration en premier, à condition d’en avoir les autorisations.',
    'appSettingsHomeScreen.usefulWhenPrefix':
      'Utile lorsque vous intégrez de nombreux',
    'appSettingsHomeScreen.adminUsersWord': 'utilisateurs administrateurs',
    'appSettingsHomeScreen.adminUsersSuffix':
      'ou pour une Application de base sur votre serveur dédié.',

    // --- Menu.tsx ---
    'appSettingsMenu.description':
      'Gérez les éléments affichés dans le menu de votre Application.',
    'appSettingsMenu.emailPasswordLabel': 'E-mail + Mot de passe',
    'appSettingsMenu.emailPasswordDescription':
      'Chacun de vos Utilisateurs dispose d’un portefeuille numérique personnel. L’Utilisateur verra ses Actifs (contenu du portefeuille) sur son écran de Profil. Selon la configuration, le Profil et les Actifs peuvent également être visibles par d’autres Utilisateurs.',
    'appSettingsMenu.chatsLabel': 'Discussions',
    'appSettingsMenu.chatsDescription':
      'Affiche une liste de Discussions comprenant vos Discussions épinglées par défaut ainsi que les conversations de groupe et privées auxquelles votre Utilisateur participe.',
    'appSettingsMenu.settingsLabel': 'Paramètres',
    'appSettingsMenu.settingsDescription':
      'C’est ici que votre Utilisateur peut gérer ses paramètres de visibilité et de confidentialité, ainsi que télécharger ses données ou supprimer son compte (exigence de conformité RGPD et CCPA).',

    // --- MobileApp.tsx ---
    'appSettingsMobileApp.heading': 'Application mobile',
    'appSettingsMobileApp.quickNoCodeHeading': 'Options rapides sans code',
    'appSettingsMobileApp.quickNoCodePrefix':
      'Pour une intégration rapide sans code, consultez nos sections',
    'appSettingsMobileApp.webAppLinkText': 'Application web',
    'appSettingsMobileApp.and': 'et',
    'appSettingsMobileApp.aiWidgetLinkText': 'Widget IA',
    'appSettingsMobileApp.quickNoCodeSuffix':
      "sections. Notre application web est responsive et vous pouvez l'essayer sur vos appareils mobiles avant de vous engager à développer une application native.",
    'appSettingsMobileApp.reactNativeComponentDesc':
      'Composant de Chat Ethora pour React Native. Pratique lorsque vous devez intégrer un chat ou un agent IA dans votre application RN existante.',
    'appSettingsMobileApp.reactNativeTemplateDesc':
      "un modèle d'application complet. Pratique lorsque vous n'avez pas d'application et préférez une solution prête à l'emploi.",
    'appSettingsMobileApp.swiftSdkDesc': 'SDK Swift',
    'appSettingsMobileApp.kotlinSdkDesc': 'SDK Kotlin',
    'appSettingsMobileApp.pushNotificationsHeading': 'Notifications push',
    'appSettingsMobileApp.followPrefix': 'Suivez',
    'appSettingsMobileApp.thisManualLinkText': 'ce guide',
    'appSettingsMobileApp.followMiddle':
      'pour configurer votre compte Firebase. Extrayez et téléversez votre',
    'appSettingsMobileApp.followSuffix':
      'Cela permettra à vos utilisateurs de recevoir des notifications push pour les messages de discussion qu’ils ont manqués pendant qu’ils étaient hors ligne.',
    'appSettingsMobileApp.uploadButton': 'Téléverser',
    'appSettingsMobileApp.deleteButton': 'Supprimer',
    'appSettingsMobileApp.deleteModal.title':
      'Supprimer le compte de service ?',
    'appSettingsMobileApp.deleteModal.message':
      'Votre compte de service Firebase sera supprimé et vos utilisateurs ne recevront plus de notifications push pour les messages manqués. Vous pouvez téléverser un nouveau service-account.json à tout moment.',
    'appSettingsMobileApp.deleteModal.confirmLabel': 'Supprimer',
    'appSettingsMobileApp.toast.uploadSuccess':
      'Compte de service Firebase téléversé',
    'appSettingsMobileApp.toast.uploadFailed':
      'Échec du téléversement du compte de service Firebase',
    'appSettingsMobileApp.toast.deleteSuccess':
      'Compte de service Firebase supprimé',
    'appSettingsMobileApp.toast.deleteFailed':
      'Échec de la suppression du compte de service Firebase',

    // --- ProgressCreateApp.tsx ---
    'appSettingsProgressCreateApp.stepAppCreated': 'Application créée',
    'appSettingsProgressCreateApp.stepAppearanceAdjusted':
      'Apparence ajustée',
    'appSettingsProgressCreateApp.stepEndUserCreated':
      'Utilisateur final créé',
    'appSettingsProgressCreateApp.hintOpenPrefix': "Astuce : ouvrez l'",
    'appSettingsProgressCreateApp.appearanceTabButton': 'onglet Apparence',
    'appSettingsProgressCreateApp.hintOpenSuffix':
      'pour ajuster votre image de marque.',
    'appSettingsProgressCreateApp.hintGoToPrefix': "Astuce : allez à l'",
    'appSettingsProgressCreateApp.webAppTabButton':
      "onglet Application web",
    'appSettingsProgressCreateApp.hintGoToSuffix':
      'et copiez le lien de votre application pour la tester en tant qu’utilisateur final.',
    'appSettingsProgressCreateApp.completedMessage':
      '🎉 Bravo ! Vous avez terminé avec succès la Configuration initiale !',

    // --- SignonOptions.tsx ---
    'appSettingsSignonOptions.description':
      'Choisissez les options de connexion à activer dans votre Application. Cela détermine comment vos Utilisateurs créent de nouveaux comptes et se connectent.',
    // --- SignonOptions.tsx: self-service registration switch ---
    'appSettingsSignonOptions.userRegistrationHeading': 'Inscription des utilisateurs',
    'appSettingsSignonOptions.userRegistrationDescription':
      "Détermine si les visiteurs peuvent créer eux-mêmes un compte dans votre App. La règle est appliquée par le serveur, pas seulement masquée dans l'interface.",
    'appSettingsSignonOptions.allowUserRegistrationLabel':
      'Autoriser les nouveaux utilisateurs à s\'inscrire',
    'appSettingsSignonOptions.registrationClosedWarning':
      "Les inscriptions sont fermées. Vous seul pouvez ajouter des utilisateurs - depuis le tableau de bord, par import groupé ou via l'API. Les utilisateurs qui ont déjà un compte peuvent toujours se connecter, réinitialiser leur mot de passe et rester connectés.",
    'appSettingsSignonOptions.registrationOpenHint':
      'Toute personne qui accède à votre App peut créer un compte. Désactivez cette option si vous créez vous-même chaque utilisateur.',
    'appSettingsSignonOptions.standardLoginHeading': 'Connexion standard',
    'appSettingsSignonOptions.standardLoginDescription':
      'L’Utilisateur doit créer un compte avec son e-mail et mémoriser le mot de passe. Il devra confirmer son adresse e-mail en cliquant sur un lien. Les e-mails envoyés par la plateforme peuvent être personnalisés avec votre image de marque.',
    'appSettingsSignonOptions.emailPasswordLabel': 'E-mail + Mot de passe',
    'appSettingsSignonOptions.socialSignOnHeading': 'Connexion sociale',
    'appSettingsSignonOptions.socialSignOnDescription':
      'Permet à vos utilisateurs de se connecter à votre application avec des comptes de plateformes populaires. Un compte sera tout de même créé, mais l’Utilisateur n’aura pas à mémoriser son mot de passe.',
    'appSettingsSignonOptions.googleLabel': 'Google',
    'appSettingsSignonOptions.firebaseWarning':
      'Assurez-vous d’ajouter les paramètres Firebase de votre Application pour que cela fonctionne.',
    'appSettingsSignonOptions.appleLabel': 'Apple',
    'appSettingsSignonOptions.facebookLabel': 'Facebook',
    'appSettingsSignonOptions.metamaskLabel': 'Metamask',
    'appSettingsSignonOptions.web3Description':
      'Les projets Web3 bénéficieront de la connexion avec leur portefeuille crypto existant.',
    'appSettingsSignonOptions.customBackendHeading':
      'Intégration backend personnalisée',
    'appSettingsSignonOptions.customBackendDescription':
      'Certains projets préfèrent créer les comptes de leurs Utilisateurs de manière programmatique, en connectant leur logiciel existant à Ethora. Dans ce cas, votre logiciel existant contrôlera les comptes via notre API Utilisateurs (ou un point de terminaison personnalisé) et vos Utilisateurs pourront soit (a) se connecter via e-mail + mot de passe, (b) se connecter via un écran de connexion personnalisé, soit (c) être connectés automatiquement dans le cadre d’une expérience intégrée. Consultez la Documentation, utilisez le Forum ou contactez-nous pour obtenir de l’aide sur cette option.',
    'appSettingsSignonOptions.apiIntegrationLabel':
      'Intégration API avec votre backend',

    // --- Visibility.tsx ---
    'appSettingsVisibility.description1':
      'Voici les autorisations par défaut qui seront appliquées à tous les Utilisateurs créés dans votre Application.',
    'appSettingsVisibility.description2':
      'Conservez les paramètres recommandés si vous n’êtes pas sûr ; vous pourrez y revenir plus tard.',
    'appSettingsVisibility.profilesVisibilityHeading':
      'Visibilité des profils',
    'appSettingsVisibility.profilesVisibilityDesc1':
      'Par défaut, les profils des Utilisateurs peuvent être consultés par tout autre Utilisateur ou bot après avoir suivi le lien correct, un code QR ou en tapant dessus dans la Discussion.',
    'appSettingsVisibility.profilesVisibilityDesc2':
      'Pour une sécurité renforcée et un partage piloté par votre logique métier, vous pouvez désactiver cette option. Vos Utilisateurs pourront toujours partager leurs profils avec d’autres, mais devront le faire explicitement via un lien de partage spécial.',
    'appSettingsVisibility.profilesViewableLabel':
      'Les Profils des Utilisateurs peuvent être consultés par d’autres',
    'appSettingsVisibility.profilesSharedExplicitlyLabel':
      'Les Profils des Utilisateurs doivent être explicitement partagés par l’Utilisateur pour être vus par d’autres',
    'appSettingsVisibility.assetsVisibilityHeading': 'Visibilité des actifs',
    'appSettingsVisibility.assetsVisibilityDesc1':
      'Les Actifs sont des Documents, Fichiers, Médias, Jetons (selon ce que prend en charge votre Application), stockés dans les portefeuilles des Utilisateurs.',
    'appSettingsVisibility.assetsVisibilityDesc2':
      'Selon les paramètres de votre Application, les Utilisateurs téléversent/créent eux-mêmes leurs Actifs, ou ceux-ci sont gérés par votre propre logique métier via l’API.',
    'appSettingsVisibility.assetsVisibilityDesc3':
      'Par défaut, les autres Utilisateurs peuvent voir les Actifs d’un Utilisateur dans son Profil.',
    'appSettingsVisibility.assetsVisibilityDesc4':
      'Une autre option, plus restrictive, consiste à masquer les Actifs. Le Profil n’affichera que des éléments tels que le nom, la photo, la description, mais aucun Actif. Les Utilisateurs pourront toujours partager leurs Actifs avec d’autres, mais devront le faire explicitement via un lien de partage spécial, individuellement pour chaque Actif.',
    'appSettingsVisibility.assetsViewableLabel':
      'Tous les Actifs de l’Utilisateur peuvent être consultés par toute personne pouvant voir le Profil de l’Utilisateur',
    'appSettingsVisibility.assetsHiddenLabel':
      'Les Actifs de l’Utilisateur sont masqués. L’Utilisateur doit partager explicitement chaque Actif individuellement via un lien de partage pour que d’autres puissent le voir.',
    'appSettingsVisibility.appLockedAccountsHeading':
      'Comptes verrouillés à l’Application',
    'appSettingsVisibility.appLockedDesc1':
      'Par défaut, les comptes de vos Utilisateurs sont verrouillés à l’Application. Cela signifie que vos Utilisateurs ne peuvent PAS se connecter à d’autres Applications de votre Organisation ni à toute autre Application du Serveur.',
    'appSettingsVisibility.appLockedDesc2':
      'Vous pouvez basculer ce paramètre sur Déverrouillé si vous souhaitez que vos Utilisateurs disposent de comptes auto-souverains, ce qui leur permet de se connecter librement à d’autres Applications du Serveur, de découvrir leur contenu et de contrôler entièrement leur propre compte.',
    'appSettingsVisibility.accountsTiedLabel':
      'Tous les comptes Utilisateurs sont liés à votre Application',
    'appSettingsVisibility.accountsUnlockedLabel':
      'Les comptes Utilisateurs sont déverrouillés (auto-souverains)',

    // --- WebApp.tsx ---
    'appSettingsWebApp.domainNameHeading': 'Nom de domaine',
    'appSettingsWebApp.domainNameDescription':
      'Votre application web est hébergée dans notre cloud avec un nom de domaine de 2ᵉ niveau offert pour les utilisateurs du plan Gratuit et un nom de domaine de 1ᵉʳ niveau pour les utilisateurs du plan Business.',
    'appSettingsWebApp.selfHostInfo':
      'Option d’auto-hébergement : il vous suffit de cloner notre moteur depuis github, de le compiler et de l’exécuter sur votre serveur.',
    'appSettingsWebApp.appNamePlaceholder': 'Nom de votre Application',
    'appSettingsWebApp.upgradeToBusinessButton': 'Passer au plan Business',
    'appSettingsWebApp.toUnlockText': 'pour débloquer',
    'appSettingsWebApp.googleFirebaseHeading':
      'Connexion Google et analyses Firebase',
    'appSettingsWebApp.googleFirebaseDescription':
      'Les identifiants Firebase sont nécessaires pour permettre à vos utilisateurs de se connecter via un compte Google. Cela vous permet également de suivre les statistiques d’utilisation de votre application dans votre console Firebase. Ces options seront désactivées si les identifiants ne sont pas fournis.',
    'appSettingsWebApp.firebaseConfigInfo':
      'Copiez-collez la configuration depuis votre Console Firebase',
    'appSettingsWebApp.aiBotHeading': 'Bot IA',
    'appSettingsWebApp.chatRoomHeading': 'Salon de discussion',
    'appSettingsWebApp.selectChatRoomText':
      'Sélectionnez le salon de discussion où le bot doit être déployé',
    'appSettingsWebApp.chatSelectLabel': 'Discussion',
    'appSettingsWebApp.noneLabel': 'Aucun',
    'appSettingsWebApp.displayNameHeading': 'Nom d’affichage',
    'appSettingsWebApp.displayNameTooltip':
      'Seul le propriétaire de l’application peut modifier le nom du bot.',
    'appSettingsWebApp.displayNameDescription':
      'Quel nom d’affichage le bot doit-il utiliser ?',
    'appSettingsWebApp.firstNamePlaceholder': 'Prénom',
    'appSettingsWebApp.lastNamePlaceholder': 'Nom de famille',
    'appSettingsWebApp.greetingMessageHeading':
      'Message d’accueil lors de l’arrivée dans le salon',
    'appSettingsWebApp.greetingMessageDescription':
      'Le bot envoie ce message en guise d’accueil une fois lancé. Supprimez-le pour ne pas envoyer de message.',
    'appSettingsWebApp.defaultGreetingLabel':
      'Bonjour, je suis votre assistant IA. Comment puis-je vous aider aujourd’hui ?',
    'appSettingsWebApp.responseTriggerHeading': 'Déclencheur de réponse',
    'appSettingsWebApp.responseTriggerDescription':
      'À quels messages le bot doit-il répondre',
    'appSettingsWebApp.anyMessageLabel':
      'Tout message provenant d’un autre utilisateur',
    'appSettingsWebApp.botPrefixLabel':
      'Tout message adressé au bot ou précédé du préfixe « /bot »',
    'appSettingsWebApp.additionalSettingsHeading':
      'Paramètres supplémentaires',
    'appSettingsWebApp.additionalSettingsPrefix': 'Utilisez le',
    'appSettingsWebApp.aiWidgetLinkText': 'Widget IA',
    'appSettingsWebApp.additionalSettingsSuffix':
      'pour les paramètres supplémentaires tels que le prompt et l’envoi de documents.',

    // --- WebMobileApp.tsx ---
    'appSettingsWebMobileApp.webAppHeading': 'Application web',
    'appSettingsWebMobileApp.domainNameHeading': 'Nom de domaine',
    'appSettingsWebMobileApp.domainNameDescription':
      'Votre application web est hébergée dans notre cloud avec un nom de domaine de 2ᵉ niveau offert pour les utilisateurs du plan Gratuit et un nom de domaine de 1ᵉʳ niveau pour les utilisateurs du plan Business.',
    'appSettingsWebMobileApp.selfHostInfo':
      'Option d’auto-hébergement : il vous suffit de cloner notre moteur depuis github, de le compiler et de l’exécuter sur votre serveur.',
    'appSettingsWebMobileApp.appNamePlaceholder': 'Nom de votre Application',
    'appSettingsWebMobileApp.upgradeToBusinessButton':
      'Passer au plan Business',
    'appSettingsWebMobileApp.toUnlockText': 'pour débloquer',
    'appSettingsWebMobileApp.googleFirebaseHeading':
      'Connexion Google et analyses Firebase',
    'appSettingsWebMobileApp.googleFirebaseDescription':
      'Les identifiants Firebase sont nécessaires pour permettre à vos utilisateurs de se connecter via un compte Google. Cela vous permet également de suivre les statistiques d’utilisation de votre application dans votre console Firebase. Ces options seront désactivées si les identifiants ne sont pas fournis.',
    'appSettingsWebMobileApp.firebaseConfigInfo':
      'Copiez-collez la configuration depuis votre Console Firebase',
    'appSettingsWebMobileApp.mobileAppSectionHeading': 'Application mobile',
    'appSettingsWebMobileApp.mobileAppHeading': 'Application mobile',
    'appSettingsWebMobileApp.bundleIdDescription':
      'Veuillez saisir l’ID de Bundle. L’ID de Bundle doit être unique pour identifier votre application sur l’App Store et à d’autres fins.',
    'appSettingsWebMobileApp.bundleIdPlaceholder': 'ID de Bundle',
    'appSettingsWebMobileApp.prepareReactNativeBuildButton':
      'Préparer la compilation React Native',
    'appSettingsWebMobileApp.androidBuildHeading': 'Compilation Android',
    'appSettingsWebMobileApp.googleServicesJsonHeading':
      'JSON Google Services',
    'appSettingsWebMobileApp.uploadButton': 'Téléverser',
    'appSettingsWebMobileApp.firebaseServerKeyHeading':
      'Clé de serveur Firebase (pour les notifications push)',
    'appSettingsWebMobileApp.firebaseServerKeyPlaceholder':
      'Clé de serveur Firebase',
    'appSettingsWebMobileApp.iosBuildHeading': 'Compilation iOS',
    'appSettingsWebMobileApp.googleServicesPlistHeading':
      'PLIST Google Services',
    'appSettingsWebMobileApp.pushNotificationsCertHeading':
      'Certificat de notifications push (Apple)',

    // --- Widget.tsx ---
    'appSettingsWidget.homeScreenHeading': 'Écran d’accueil',
    'appSettingsWidget.homeScreenDescription':
      'Choisissez l’écran que vos Utilisateurs verront immédiatement après leur connexion.',
    'appSettingsWidget.radioGroupAriaLabel': 'Taille du serveur',
    'appSettingsWidget.listOfChatsLabel': 'Liste des discussions',
    'appSettingsWidget.listOfChatsDescription':
      'L’Utilisateur verra la liste des discussions qui lui sont accessibles, avec des onglets pour les discussions épinglées, de groupe et privées.',
    'appSettingsWidget.goodForLabel': 'Idéal pour :',
    'appSettingsWidget.communityWord': 'communauté',
    'appSettingsWidget.communityUseCase':
      "un cas d'usage où l'accès rapide à plusieurs conversations est important.",
    'appSettingsWidget.profileWalletLabel': 'Profil / Portefeuille',
    'appSettingsWidget.profileWalletDescription':
      'L’Utilisateur verra son Profil ainsi que tous les documents ou actifs qui y sont stockés. L’Utilisateur pourra partager son profil ou des documents / actifs individuels.',
    'appSettingsWidget.digitalWalletWord': 'portefeuille numérique',
    'appSettingsWidget.digitalWalletUseCase':
      "un cas d'usage où l'accès rapide aux documents, actifs ou pass QR de l'Utilisateur est important.",
    'appSettingsWidget.adminPanelLabel': 'Panneau d’administration',
    'appSettingsWidget.adminPanelDescription':
      'Les Utilisateurs verront l’Administration en premier, à condition d’en avoir les autorisations.',
    'appSettingsWidget.usefulWhenPrefix':
      'Utile lorsque vous intégrez de nombreux',
    'appSettingsWidget.adminUsersWord': 'utilisateurs administrateurs',
    'appSettingsWidget.adminUsersSuffix':
      'ou pour une Application de base sur votre serveur dédié.',
    'appSettingsWidget.menuHeading': 'Menu',
    'appSettingsWidget.menuDescription':
      'Gérez les éléments affichés dans le menu de votre Application.',
    'appSettingsWidget.emailPasswordLabel': 'E-mail + Mot de passe',
    'appSettingsWidget.emailPasswordDescription':
      'Chacun de vos Utilisateurs dispose d’un portefeuille numérique personnel. L’Utilisateur verra ses Actifs (contenu du portefeuille) sur son écran de Profil. Selon la configuration, le Profil et les Actifs peuvent également être visibles par d’autres Utilisateurs.',
    'appSettingsWidget.chatsLabel': 'Discussions',
    'appSettingsWidget.chatsDescription':
      'Affiche une liste de Discussions comprenant vos Discussions épinglées par défaut ainsi que les conversations de groupe et privées auxquelles votre Utilisateur participe.',
    'appSettingsWidget.settingsLabel': 'Paramètres',
    'appSettingsWidget.settingsDescription':
      'C’est ici que votre Utilisateur peut gérer ses paramètres de visibilité et de confidentialité, ainsi que télécharger ses données ou supprimer son compte (exigence de conformité RGPD et CCPA).',
  },
  es: {
    // --- AIWidget.tsx ---
    'appSettingsAIWidget.disabledBannerStrong':
      'Las funciones de IA no están habilitadas en este despliegue.',
    'appSettingsAIWidget.disabledBannerText':
      'El Widget de IA se muestra aquí en modo de vista previa. Contacta a tu administrador para habilitar las funciones de IA.',
    'appSettingsAIWidget.aiBotLabel': 'Bot de IA:',
    'appSettingsAIWidget.statusEnabled': 'habilitado',
    'appSettingsAIWidget.statusDisabled': 'deshabilitado',
    'appSettingsAIWidget.enableButton': 'Habilitar',
    'appSettingsAIWidget.disableButton': 'Deshabilitar',
    'appSettingsAIWidget.ragLabel': 'RAG:',
    'appSettingsAIWidget.ragEmpty': 'vacío',
    'appSettingsAIWidget.conversationsLabel': 'Conversaciones:',
    'appSettingsAIWidget.stopTestButton': 'Detener prueba',
    'appSettingsAIWidget.newSessionButton': 'Nueva sesión',
    'appSettingsAIWidget.testWidgetButton': 'Probar widget',
    'appSettingsAIWidget.enableBotFirstTooltip':
      'Habilita primero el bot de IA para probar el widget aquí.',
    'appSettingsAIWidget.widgetHostingNotConfiguredTooltip':
      'El alojamiento del widget no está configurado para este despliegue.',

    // --- HomeScreen.tsx ---
    'appSettingsHomeScreen.description':
      'Elige la pantalla que verán tus Usuarios inmediatamente después de iniciar sesión.',
    'appSettingsHomeScreen.radioGroupAriaLabel': 'Tamaño del servidor',
    'appSettingsHomeScreen.listOfChatsLabel': 'Lista de chats',
    'appSettingsHomeScreen.listOfChatsDescription':
      'El Usuario verá la lista de chats disponibles para él, con pestañas para chats fijados, grupales y privados.',
    'appSettingsHomeScreen.goodForLabel': 'Ideal para:',
    'appSettingsHomeScreen.communityWord': 'comunidad',
    'appSettingsHomeScreen.communityUseCase':
      'un caso de uso donde el acceso rápido a múltiples conversaciones es importante.',
    'appSettingsHomeScreen.profileWalletLabel': 'Perfil / Billetera',
    'appSettingsHomeScreen.profileWalletDescription':
      'El Usuario verá su Perfil y cualquier documento o activo almacenado allí. El Usuario podrá compartir su perfil o documentos / activos individuales.',
    'appSettingsHomeScreen.digitalWalletWord': 'billetera digital',
    'appSettingsHomeScreen.digitalWalletUseCase':
      'un caso de uso donde el acceso rápido a los documentos, activos o pase QR del Usuario es importante.',
    'appSettingsHomeScreen.adminPanelLabel': 'Panel de administración',
    'appSettingsHomeScreen.adminPanelDescription':
      'Los Usuarios verán la Administración primero, siempre que tengan los permisos necesarios.',
    'appSettingsHomeScreen.usefulWhenPrefix':
      'Útil cuando incorporas a muchos',
    'appSettingsHomeScreen.adminUsersWord': 'usuarios administradores',
    'appSettingsHomeScreen.adminUsersSuffix':
      'o para una Aplicación base en tu servidor dedicado.',

    // --- Menu.tsx ---
    'appSettingsMenu.description':
      'Administra los elementos que se muestran en el menú de tu Aplicación.',
    'appSettingsMenu.emailPasswordLabel': 'Correo electrónico + Contraseña',
    'appSettingsMenu.emailPasswordDescription':
      'Cada uno de tus Usuarios cuenta con una billetera digital personal. El Usuario verá sus Activos (contenido de la billetera) en su pantalla de Perfil. Según la configuración, el Perfil y los Activos también pueden ser visibles para otros Usuarios.',
    'appSettingsMenu.chatsLabel': 'Chats',
    'appSettingsMenu.chatsDescription':
      'Muestra una lista de Chats que incluye tus Chats fijados por defecto, así como las conversaciones grupales y privadas de las que forma parte tu Usuario.',
    'appSettingsMenu.settingsLabel': 'Configuración',
    'appSettingsMenu.settingsDescription':
      'Aquí es donde tu Usuario puede gestionar su configuración de visibilidad y privacidad, así como descargar sus datos o eliminar su cuenta (requisito de cumplimiento del RGPD y la CCPA).',

    // --- MobileApp.tsx ---
    'appSettingsMobileApp.heading': 'Aplicación móvil',
    'appSettingsMobileApp.quickNoCodeHeading': 'Opciones rápidas sin código',
    'appSettingsMobileApp.quickNoCodePrefix':
      'Para una integración rápida sin código, consulta nuestras secciones',
    'appSettingsMobileApp.webAppLinkText': 'Aplicación web',
    'appSettingsMobileApp.and': 'y',
    'appSettingsMobileApp.aiWidgetLinkText': 'Widget de IA',
    'appSettingsMobileApp.quickNoCodeSuffix':
      'secciones. Nuestra aplicación web es responsiva y puedes probarla en tus dispositivos móviles antes de comprometerte a crear una aplicación nativa.',
    'appSettingsMobileApp.reactNativeComponentDesc':
      'Componente de Chat de Ethora para React Native. Útil cuando necesitas integrar chat o un agente de IA en tu aplicación RN existente.',
    'appSettingsMobileApp.reactNativeTemplateDesc':
      'una plantilla de aplicación completa. Útil cuando no tienes una aplicación y prefieres una solución lista para usar.',
    'appSettingsMobileApp.swiftSdkDesc': 'SDK de Swift',
    'appSettingsMobileApp.kotlinSdkDesc': 'SDK de Kotlin',
    'appSettingsMobileApp.pushNotificationsHeading': 'Notificaciones push',
    'appSettingsMobileApp.followPrefix': 'Sigue',
    'appSettingsMobileApp.thisManualLinkText': 'esta guía',
    'appSettingsMobileApp.followMiddle':
      'para configurar tu cuenta de Firebase. Extrae y sube tu',
    'appSettingsMobileApp.followSuffix':
      'Esto permitirá que tus usuarios reciban notificaciones push de los mensajes de chat que se perdieron mientras estaban desconectados.',
    'appSettingsMobileApp.uploadButton': 'Subir',
    'appSettingsMobileApp.deleteButton': 'Eliminar',
    'appSettingsMobileApp.deleteModal.title':
      '¿Eliminar la cuenta de servicio?',
    'appSettingsMobileApp.deleteModal.message':
      'Se eliminará tu cuenta de servicio de Firebase y tus usuarios dejarán de recibir notificaciones push de los mensajes perdidos. Puedes subir un nuevo service-account.json en cualquier momento.',
    'appSettingsMobileApp.deleteModal.confirmLabel': 'Eliminar',
    'appSettingsMobileApp.toast.uploadSuccess':
      'Cuenta de servicio de Firebase subida',
    'appSettingsMobileApp.toast.uploadFailed':
      'No se pudo subir la cuenta de servicio de Firebase',
    'appSettingsMobileApp.toast.deleteSuccess':
      'Cuenta de servicio de Firebase eliminada',
    'appSettingsMobileApp.toast.deleteFailed':
      'No se pudo eliminar la cuenta de servicio de Firebase',

    // --- ProgressCreateApp.tsx ---
    'appSettingsProgressCreateApp.stepAppCreated': 'Aplicación creada',
    'appSettingsProgressCreateApp.stepAppearanceAdjusted':
      'Apariencia ajustada',
    'appSettingsProgressCreateApp.stepEndUserCreated':
      'Usuario final creado',
    'appSettingsProgressCreateApp.hintOpenPrefix': 'Consejo: abre la',
    'appSettingsProgressCreateApp.appearanceTabButton':
      'pestaña Apariencia',
    'appSettingsProgressCreateApp.hintOpenSuffix':
      'para ajustar tu marca.',
    'appSettingsProgressCreateApp.hintGoToPrefix': 'Consejo: ve a la',
    'appSettingsProgressCreateApp.webAppTabButton':
      'pestaña Aplicación web',
    'appSettingsProgressCreateApp.hintGoToSuffix':
      'y copia el enlace de tu aplicación para probarla como usuario final.',
    'appSettingsProgressCreateApp.completedMessage':
      '🎉 ¡Bien hecho! Has completado con éxito la Configuración inicial.',

    // --- SignonOptions.tsx ---
    'appSettingsSignonOptions.description':
      'Elige qué opciones de inicio de sesión habilitar en tu Aplicación. Esto controla cómo tus Usuarios crean nuevas cuentas e inician sesión.',
    // --- SignonOptions.tsx: self-service registration switch ---
    'appSettingsSignonOptions.userRegistrationHeading': 'Registro de usuarios',
    'appSettingsSignonOptions.userRegistrationDescription':
      'Controla si los visitantes pueden crear su propia cuenta en tu App. Lo aplica el servidor, no es solo una opción oculta en la interfaz.',
    'appSettingsSignonOptions.allowUserRegistrationLabel':
      'Permitir que se registren nuevos usuarios',
    'appSettingsSignonOptions.registrationClosedWarning':
      'El registro está cerrado. Solo tú puedes añadir usuarios: desde el panel, mediante importación por lotes o a través de la API. Quienes ya tienen una cuenta pueden seguir iniciando sesión, restablecer su contraseña y mantener la sesión abierta.',
    'appSettingsSignonOptions.registrationOpenHint':
      'Cualquiera que llegue a tu App puede registrarse. Desactívalo si eres tú quien crea cada usuario.',
    'appSettingsSignonOptions.standardLoginHeading':
      'Inicio de sesión estándar',
    'appSettingsSignonOptions.standardLoginDescription':
      'El Usuario debe crear una cuenta con su correo electrónico y memorizar la contraseña. Deberá confirmar su dirección de correo electrónico haciendo clic en un enlace. Los correos electrónicos de la plataforma se pueden personalizar con tu marca.',
    'appSettingsSignonOptions.emailPasswordLabel':
      'Correo electrónico + Contraseña',
    'appSettingsSignonOptions.socialSignOnHeading':
      'Inicio de sesión social',
    'appSettingsSignonOptions.socialSignOnDescription':
      'Permite que tus usuarios inicien sesión en tu aplicación con cuentas de plataformas populares. Se seguirá creando una cuenta, pero el Usuario no tendrá que memorizar su contraseña.',
    'appSettingsSignonOptions.googleLabel': 'Google',
    'appSettingsSignonOptions.firebaseWarning':
      'Asegúrate de agregar la configuración de Firebase de tu Aplicación para que esto funcione.',
    'appSettingsSignonOptions.appleLabel': 'Apple',
    'appSettingsSignonOptions.facebookLabel': 'Facebook',
    'appSettingsSignonOptions.metamaskLabel': 'Metamask',
    'appSettingsSignonOptions.web3Description':
      'Los proyectos Web3 se beneficiarán al iniciar sesión con su billetera cripto existente.',
    'appSettingsSignonOptions.customBackendHeading':
      'Integración de backend personalizada',
    'appSettingsSignonOptions.customBackendDescription':
      'Algunos proyectos prefieren crear cuentas para los Usuarios de forma programática, conectando su software heredado existente con Ethora. En este caso, tu software heredado controlará las cuentas a través de nuestra API de Usuarios (o un endpoint personalizado) y tus Usuarios podrán (a) iniciar sesión mediante correo electrónico + contraseña, (b) iniciar sesión mediante una pantalla de inicio de sesión personalizada, o (c) iniciar sesión automáticamente como parte de una experiencia integrada. Consulta la Documentación y usa el Foro o contáctanos para obtener ayuda con esta opción.',
    'appSettingsSignonOptions.apiIntegrationLabel':
      'Integración de API con tu backend',

    // --- Visibility.tsx ---
    'appSettingsVisibility.description1':
      'Estos son los permisos predeterminados que se aplicarán a todos los Usuarios creados en tu Aplicación.',
    'appSettingsVisibility.description2':
      'Mantén la configuración recomendada si no estás seguro; puedes volver a esto más tarde.',
    'appSettingsVisibility.profilesVisibilityHeading':
      'Visibilidad de perfiles',
    'appSettingsVisibility.profilesVisibilityDesc1':
      'Por defecto, otros Usuarios y bots pueden ver los perfiles de Usuario después de seguir el enlace correcto, un código QR o tocarlo en el Chat.',
    'appSettingsVisibility.profilesVisibilityDesc2':
      'Para una mayor seguridad y un uso compartido controlado por la lógica de negocio, puedes desactivar esto. Tus Usuarios podrán seguir compartiendo sus perfiles con otros, pero deberán hacerlo explícitamente mediante un enlace de uso compartido especial.',
    'appSettingsVisibility.profilesViewableLabel':
      'Los Perfiles de Usuario pueden ser vistos por otros',
    'appSettingsVisibility.profilesSharedExplicitlyLabel':
      'Los Perfiles de Usuario deben ser compartidos explícitamente por el Usuario para que otros los vean',
    'appSettingsVisibility.assetsVisibilityHeading':
      'Visibilidad de activos',
    'appSettingsVisibility.assetsVisibilityDesc1':
      'Los Activos son Documentos, Archivos, Medios, Tokens (según lo que admita tu Aplicación), almacenados en las billeteras de los Usuarios.',
    'appSettingsVisibility.assetsVisibilityDesc2':
      'Según la configuración de tu Aplicación, los Usuarios suben/crean sus propios Activos, o estos son gestionados por tu propia lógica de negocio a través de la API.',
    'appSettingsVisibility.assetsVisibilityDesc3':
      'Por defecto, otros Usuarios pueden ver los Activos de un Usuario en su Perfil.',
    'appSettingsVisibility.assetsVisibilityDesc4':
      'Una configuración alternativa y más restringida consiste en ocultar los Activos. El Perfil solo mostrará elementos como el nombre, la foto y la descripción, pero ningún Activo. Los Usuarios podrán seguir compartiendo sus Activos con otros, pero deberán hacerlo explícitamente mediante un enlace de uso compartido especial, de forma individual para cada Activo.',
    'appSettingsVisibility.assetsViewableLabel':
      'Todos los Activos del Usuario pueden ser vistos por cualquiera que pueda ver el Perfil del Usuario',
    'appSettingsVisibility.assetsHiddenLabel':
      'Los Activos del Usuario están ocultos. El Usuario debe compartir explícitamente cada Activo de forma individual mediante un enlace para que otros lo vean.',
    'appSettingsVisibility.appLockedAccountsHeading':
      'Cuentas bloqueadas a la Aplicación',
    'appSettingsVisibility.appLockedDesc1':
      'Por defecto, las cuentas de tus Usuarios están bloqueadas a la Aplicación. Esto significa que tus Usuarios NO pueden iniciar sesión en otras Aplicaciones de tu Organización ni en ninguna otra Aplicación del Servidor.',
    'appSettingsVisibility.appLockedDesc2':
      'Puedes cambiar esta configuración a Desbloqueado si deseas que tus Usuarios tengan cuentas autosoberanas, lo que les permite iniciar sesión libremente en otras Aplicaciones del Servidor, descubrir su contenido y controlar por completo su propia cuenta.',
    'appSettingsVisibility.accountsTiedLabel':
      'Todas las cuentas de Usuario están vinculadas a tu Aplicación',
    'appSettingsVisibility.accountsUnlockedLabel':
      'Las cuentas de Usuario están desbloqueadas (autosoberanas)',

    // --- WebApp.tsx ---
    'appSettingsWebApp.domainNameHeading': 'Nombre de dominio',
    'appSettingsWebApp.domainNameDescription':
      'Tu aplicación web está alojada en nuestra nube con un nombre de dominio de 2.º nivel gratuito disponible para los usuarios del plan Gratuito y un nombre de dominio de 1.er nivel para los usuarios del plan Business.',
    'appSettingsWebApp.selfHostInfo':
      'Opción de autoalojamiento: simplemente clona nuestro motor desde github, compílalo y ejecútalo en tu servidor.',
    'appSettingsWebApp.appNamePlaceholder': 'Nombre de tu Aplicación',
    'appSettingsWebApp.upgradeToBusinessButton': 'Actualizar a Business',
    'appSettingsWebApp.toUnlockText': 'para desbloquear',
    'appSettingsWebApp.googleFirebaseHeading':
      'Inicio de sesión con Google y análisis de Firebase',
    'appSettingsWebApp.googleFirebaseDescription':
      'Se requieren credenciales de Firebase para permitir que tus usuarios inicien sesión con una cuenta de Google. Esto también te permite realizar un seguimiento de las estadísticas de uso de tu aplicación en tu consola de Firebase. Estas opciones se desactivarán si no se proporcionan las credenciales.',
    'appSettingsWebApp.firebaseConfigInfo':
      'Copia y pega la configuración desde tu Consola de Firebase',
    'appSettingsWebApp.aiBotHeading': 'Bot de IA',
    'appSettingsWebApp.chatRoomHeading': 'Sala de chat',
    'appSettingsWebApp.selectChatRoomText':
      'Selecciona la sala de chat donde debe implementarse el bot',
    'appSettingsWebApp.chatSelectLabel': 'Chat',
    'appSettingsWebApp.noneLabel': 'Ninguno',
    'appSettingsWebApp.displayNameHeading': 'Nombre para mostrar',
    'appSettingsWebApp.displayNameTooltip':
      'Solo el propietario de la aplicación puede cambiar el nombre del bot.',
    'appSettingsWebApp.displayNameDescription':
      '¿Qué nombre para mostrar debe usar el bot?',
    'appSettingsWebApp.firstNamePlaceholder': 'Nombre',
    'appSettingsWebApp.lastNamePlaceholder': 'Apellido',
    'appSettingsWebApp.greetingMessageHeading':
      'Mensaje de bienvenida al unirse a la sala',
    'appSettingsWebApp.greetingMessageDescription':
      'El bot envía este mensaje como saludo una vez iniciado. Bórralo para no enviar ningún mensaje.',
    'appSettingsWebApp.defaultGreetingLabel':
      'Hola, soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?',
    'appSettingsWebApp.responseTriggerHeading': 'Disparador de respuesta',
    'appSettingsWebApp.responseTriggerDescription':
      'A qué mensajes debe responder el bot',
    'appSettingsWebApp.anyMessageLabel': 'Cualquier mensaje de otro usuario',
    'appSettingsWebApp.botPrefixLabel':
      "Cualquier mensaje dirigido al bot o con el prefijo '/bot'",
    'appSettingsWebApp.additionalSettingsHeading':
      'Configuración adicional',
    'appSettingsWebApp.additionalSettingsPrefix': 'Usa la pestaña',
    'appSettingsWebApp.aiWidgetLinkText': 'Widget de IA',
    'appSettingsWebApp.additionalSettingsSuffix':
      'para configuración adicional como el prompt y la carga de documentos.',

    // --- WebMobileApp.tsx ---
    'appSettingsWebMobileApp.webAppHeading': 'Aplicación web',
    'appSettingsWebMobileApp.domainNameHeading': 'Nombre de dominio',
    'appSettingsWebMobileApp.domainNameDescription':
      'Tu aplicación web está alojada en nuestra nube con un nombre de dominio de 2.º nivel gratuito disponible para los usuarios del plan Gratuito y un nombre de dominio de 1.er nivel para los usuarios del plan Business.',
    'appSettingsWebMobileApp.selfHostInfo':
      'Opción de autoalojamiento: simplemente clona nuestro motor desde github, compílalo y ejecútalo en tu servidor.',
    'appSettingsWebMobileApp.appNamePlaceholder': 'Nombre de tu Aplicación',
    'appSettingsWebMobileApp.upgradeToBusinessButton':
      'Actualizar a Business',
    'appSettingsWebMobileApp.toUnlockText': 'para desbloquear',
    'appSettingsWebMobileApp.googleFirebaseHeading':
      'Inicio de sesión con Google y análisis de Firebase',
    'appSettingsWebMobileApp.googleFirebaseDescription':
      'Se requieren credenciales de Firebase para permitir que tus usuarios inicien sesión con una cuenta de Google. Esto también te permite realizar un seguimiento de las estadísticas de uso de tu aplicación en tu consola de Firebase. Estas opciones se desactivarán si no se proporcionan las credenciales.',
    'appSettingsWebMobileApp.firebaseConfigInfo':
      'Copia y pega la configuración desde tu Consola de Firebase',
    'appSettingsWebMobileApp.mobileAppSectionHeading': 'Aplicación móvil',
    'appSettingsWebMobileApp.mobileAppHeading': 'Aplicación móvil',
    'appSettingsWebMobileApp.bundleIdDescription':
      'Introduce el ID de Bundle. El ID de Bundle debe ser único para identificar tu aplicación en la App Store y para otros fines.',
    'appSettingsWebMobileApp.bundleIdPlaceholder': 'ID de Bundle',
    'appSettingsWebMobileApp.prepareReactNativeBuildButton':
      'Preparar compilación de React Native',
    'appSettingsWebMobileApp.androidBuildHeading': 'Compilación de Android',
    'appSettingsWebMobileApp.googleServicesJsonHeading':
      'JSON de Google Services',
    'appSettingsWebMobileApp.uploadButton': 'Subir',
    'appSettingsWebMobileApp.firebaseServerKeyHeading':
      'Clave de servidor de Firebase (para notificaciones push)',
    'appSettingsWebMobileApp.firebaseServerKeyPlaceholder':
      'Clave de servidor de Firebase',
    'appSettingsWebMobileApp.iosBuildHeading': 'Compilación de iOS',
    'appSettingsWebMobileApp.googleServicesPlistHeading':
      'PLIST de Google Services',
    'appSettingsWebMobileApp.pushNotificationsCertHeading':
      'Certificado de notificaciones push (Apple)',

    // --- Widget.tsx ---
    'appSettingsWidget.homeScreenHeading': 'Pantalla de inicio',
    'appSettingsWidget.homeScreenDescription':
      'Elige la pantalla que verán tus Usuarios inmediatamente después de iniciar sesión.',
    'appSettingsWidget.radioGroupAriaLabel': 'Tamaño del servidor',
    'appSettingsWidget.listOfChatsLabel': 'Lista de chats',
    'appSettingsWidget.listOfChatsDescription':
      'El Usuario verá la lista de chats disponibles para él, con pestañas para chats fijados, grupales y privados.',
    'appSettingsWidget.goodForLabel': 'Ideal para:',
    'appSettingsWidget.communityWord': 'comunidad',
    'appSettingsWidget.communityUseCase':
      'un caso de uso donde el acceso rápido a múltiples conversaciones es importante.',
    'appSettingsWidget.profileWalletLabel': 'Perfil / Billetera',
    'appSettingsWidget.profileWalletDescription':
      'El Usuario verá su Perfil y cualquier documento o activo almacenado allí. El Usuario podrá compartir su perfil o documentos / activos individuales.',
    'appSettingsWidget.digitalWalletWord': 'billetera digital',
    'appSettingsWidget.digitalWalletUseCase':
      'un caso de uso donde el acceso rápido a los documentos, activos o pase QR del Usuario es importante.',
    'appSettingsWidget.adminPanelLabel': 'Panel de administración',
    'appSettingsWidget.adminPanelDescription':
      'Los Usuarios verán la Administración primero, siempre que tengan los permisos necesarios.',
    'appSettingsWidget.usefulWhenPrefix': 'Útil cuando incorporas a muchos',
    'appSettingsWidget.adminUsersWord': 'usuarios administradores',
    'appSettingsWidget.adminUsersSuffix':
      'o para una Aplicación base en tu servidor dedicado.',
    'appSettingsWidget.menuHeading': 'Menú',
    'appSettingsWidget.menuDescription':
      'Administra los elementos que se muestran en el menú de tu Aplicación.',
    'appSettingsWidget.emailPasswordLabel':
      'Correo electrónico + Contraseña',
    'appSettingsWidget.emailPasswordDescription':
      'Cada uno de tus Usuarios cuenta con una billetera digital personal. El Usuario verá sus Activos (contenido de la billetera) en su pantalla de Perfil. Según la configuración, el Perfil y los Activos también pueden ser visibles para otros Usuarios.',
    'appSettingsWidget.chatsLabel': 'Chats',
    'appSettingsWidget.chatsDescription':
      'Muestra una lista de Chats que incluye tus Chats fijados por defecto, así como las conversaciones grupales y privadas de las que forma parte tu Usuario.',
    'appSettingsWidget.settingsLabel': 'Configuración',
    'appSettingsWidget.settingsDescription':
      'Aquí es donde tu Usuario puede gestionar su configuración de visibilidad y privacidad, así como descargar sus datos o eliminar su cuenta (requisito de cumplimiento del RGPD y la CCPA).',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
