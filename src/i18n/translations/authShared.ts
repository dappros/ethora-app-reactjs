import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Shared static UI text for the small/reusable AuthPage building blocks
// (social login buttons, logo/tagline, Metamask modal, etc). Namespaced per
// source file, e.g. 'authGoogleButton.continueLabel'. See index.ts for how
// this gets merged into the app-wide translations table.
export const authShared = {
  en: {
    'authFacebookButton.emailNotProvided': 'Email not provided by Facebook',
    'authFacebookButton.registrationFailed': 'Social registration failed',
    'authFacebookButton.continueLabel': 'Continue with Facebook',

    'authGoogleButton.loginFailed': 'Google login failed',
    'authGoogleButton.emailNotProvided': 'Email not provided by Google',
    'authGoogleButton.registrationFailed': 'Social registration failed',
    'authGoogleButton.continueLabel': 'Continue with Google',

    'authLogoContent.logoAlt': 'Company logo',
    'authLogoContent.taglineSuffix': ': join our community',

    'authBrandPanel.subtitle':
      'The developer platform for real-time messaging and AI assistants.',
    'authBrandPanel.chatChannel': '#support',
    'authBrandPanel.chatQuestion': 'How do I add the chat widget to my app?',
    'authBrandPanel.chatAnswerPart1': 'Install',
    'authBrandPanel.chatAnswerPart2':
      'and drop in the <Chat/> component — done.',
    'authBrandPanel.aiTyping': 'AI is typing…',
    'authBrandPanel.trustedBy': 'Trusted by 8,000+ developers',
    'authBrandPanel.uptime': '99.9% uptime',

    'authMetamaskButton.installFirst': 'Install Metamask first!',
    'authMetamaskButton.loginSuccess': 'Successfully logged in with Metamask!',
    'authMetamaskButton.loginFailed': 'Failed to sign with Metamask.',
    'authMetamaskButton.registerSuccess':
      'Successfully registered with Metamask!',
    'authMetamaskButton.registrationFailed': 'Registration failed.',
    'authMetamaskButton.continueLabel': 'Continue with Metamask',
    'authMetamaskButton.dialogTitle': 'Register with Metamask',
    'authMetamaskButton.firstNameLabel': 'First Name',
    'authMetamaskButton.lastNameLabel': 'Last Name',
    'authMetamaskButton.firstNameRequired': 'First name is required',
    'authMetamaskButton.lastNameRequired': 'Last name is required',
    'authMetamaskButton.cancel': 'Cancel',
    'authMetamaskButton.register': 'Register',
  },
  fr: {
    'authFacebookButton.emailNotProvided':
      "Facebook n'a pas fourni d'adresse e-mail",
    'authFacebookButton.registrationFailed':
      "Échec de l'inscription via un réseau social",
    'authFacebookButton.continueLabel': 'Continuer avec Facebook',

    'authGoogleButton.loginFailed': 'Échec de la connexion avec Google',
    'authGoogleButton.emailNotProvided':
      "Google n'a pas fourni d'adresse e-mail",
    'authGoogleButton.registrationFailed':
      "Échec de l'inscription via un réseau social",
    'authGoogleButton.continueLabel': 'Continuer avec Google',

    'authLogoContent.logoAlt': "Logo de l'entreprise",
    'authLogoContent.taglineSuffix': ' : rejoignez notre communauté',

    'authBrandPanel.subtitle':
      "La plateforme développeur pour la messagerie en temps réel et les assistants IA.",
    'authBrandPanel.chatChannel': '#support',
    'authBrandPanel.chatQuestion':
      'Comment ajouter le widget de chat à mon application ?',
    'authBrandPanel.chatAnswerPart1': 'Installez',
    'authBrandPanel.chatAnswerPart2':
      "et insérez le composant <Chat/> — c'est fait.",
    'authBrandPanel.aiTyping': "L'IA écrit…",
    'authBrandPanel.trustedBy': 'Adopté par plus de 8 000 développeurs',
    'authBrandPanel.uptime': '99,9 % de disponibilité',

    'authMetamaskButton.installFirst': "Installez d'abord Metamask !",
    'authMetamaskButton.loginSuccess': 'Connexion réussie avec Metamask !',
    'authMetamaskButton.loginFailed': 'Échec de la signature avec Metamask.',
    'authMetamaskButton.registerSuccess':
      'Inscription réussie avec Metamask !',
    'authMetamaskButton.registrationFailed': "Échec de l'inscription.",
    'authMetamaskButton.continueLabel': 'Continuer avec Metamask',
    'authMetamaskButton.dialogTitle': "S'inscrire avec Metamask",
    'authMetamaskButton.firstNameLabel': 'Prénom',
    'authMetamaskButton.lastNameLabel': 'Nom',
    'authMetamaskButton.firstNameRequired': 'Le prénom est requis',
    'authMetamaskButton.lastNameRequired': 'Le nom est requis',
    'authMetamaskButton.cancel': 'Annuler',
    'authMetamaskButton.register': "S'inscrire",
  },
  es: {
    'authFacebookButton.emailNotProvided':
      'Facebook no proporcionó un correo electrónico',
    'authFacebookButton.registrationFailed': 'Error en el registro social',
    'authFacebookButton.continueLabel': 'Continuar con Facebook',

    'authGoogleButton.loginFailed': 'Error al iniciar sesión con Google',
    'authGoogleButton.emailNotProvided':
      'Google no proporcionó un correo electrónico',
    'authGoogleButton.registrationFailed': 'Error en el registro social',
    'authGoogleButton.continueLabel': 'Continuar con Google',

    'authLogoContent.logoAlt': 'Logotipo de la empresa',
    'authLogoContent.taglineSuffix': ': únete a nuestra comunidad',

    'authBrandPanel.subtitle':
      'La plataforma para desarrolladores de mensajería en tiempo real y asistentes de IA.',
    'authBrandPanel.chatChannel': '#support',
    'authBrandPanel.chatQuestion':
      '¿Cómo agrego el widget de chat a mi aplicación?',
    'authBrandPanel.chatAnswerPart1': 'Instala',
    'authBrandPanel.chatAnswerPart2':
      'y añade el componente <Chat/> — listo.',
    'authBrandPanel.aiTyping': 'La IA está escribiendo…',
    'authBrandPanel.trustedBy': 'Con la confianza de más de 8,000 desarrolladores',
    'authBrandPanel.uptime': '99.9% de disponibilidad',

    'authMetamaskButton.installFirst': '¡Instala Metamask primero!',
    'authMetamaskButton.loginSuccess':
      '¡Sesión iniciada correctamente con Metamask!',
    'authMetamaskButton.loginFailed': 'No se pudo firmar con Metamask.',
    'authMetamaskButton.registerSuccess':
      '¡Registro completado correctamente con Metamask!',
    'authMetamaskButton.registrationFailed': 'Error en el registro.',
    'authMetamaskButton.continueLabel': 'Continuar con Metamask',
    'authMetamaskButton.dialogTitle': 'Registrarse con Metamask',
    'authMetamaskButton.firstNameLabel': 'Nombre',
    'authMetamaskButton.lastNameLabel': 'Apellido',
    'authMetamaskButton.firstNameRequired': 'El nombre es obligatorio',
    'authMetamaskButton.lastNameRequired': 'El apellido es obligatorio',
    'authMetamaskButton.cancel': 'Cancelar',
    'authMetamaskButton.register': 'Registrarse',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
