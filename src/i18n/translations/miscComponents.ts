import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Static UI text for a grab-bag of smaller/standalone components: the
// Appearance (branding) preview mockups, the Billing box/table/modals, the
// local statistics line chart, the feedback widget, and the app-wide error
// surfaces. Namespaced per source file (see each `*.ComponentName.key`
// prefix below) so this file can grow without key collisions.
export const miscComponents = {
  en: {
    // AppearanceIphone.tsx
    'appearanceIphone.signUp': 'Sign Up',
    'appearanceIphone.placeholderFirstName': 'First Name',
    'appearanceIphone.placeholderLastName': 'Last Name',
    'appearanceIphone.placeholderEmail': 'Email',
    'appearanceIphone.agreementPrefix':
      'By clicking the "Sign Up" button, you agree to our',
    'appearanceIphone.termsAndConditions': 'Terms & Conditions.',
    'appearanceIphone.or': 'or',
    'appearanceIphone.continueWithGoogle': 'Continue with Google',
    'appearanceIphone.alreadyHaveAccount': 'Already have an account?',
    'appearanceIphone.signIn': 'Sign In',

    // AppearanceRightImage.tsx
    'appearanceRightImage.signUp': 'Sign Up',
    'appearanceRightImage.joinCommunityTagline': '{name}: join our community',
    'appearanceRightImage.agreementPrefix':
      'By clicking the "Sign Up" button, you agree to our',
    'appearanceRightImage.termsAndConditions': 'Terms & Conditions.',
    'appearanceRightImage.continueWithGoogle': 'Continue with Google',
    'appearanceRightImage.alreadyHaveAccount': 'Already have an account?',
    'appearanceRightImage.signIn': 'Sign In',

    // BillingHistoryTable.tsx
    'billingHistoryTable.date': 'Date',
    'billingHistoryTable.amount': 'Amount',
    'billingHistoryTable.status': 'Status',
    'billingHistoryTable.invoice': 'Invoice',

    // BillingModalChangeInfo.tsx
    'billingModalChangeInfo.title': 'Billing Address',
    'billingModalChangeInfo.addressLabel': 'Address',
    'billingModalChangeInfo.addressRequired': 'Address is required',
    'billingModalChangeInfo.cityLabel': 'City',
    'billingModalChangeInfo.cityRequired': 'City is required',
    'billingModalChangeInfo.countryLabel': 'Country',
    'billingModalChangeInfo.countryRequired': 'Country is required',
    'billingModalChangeInfo.stateLabel': 'State / Province / Region',
    'billingModalChangeInfo.stateRequired':
      'State/Province/Region is required',
    'billingModalChangeInfo.zipLabel': 'Postal / Zip Code',
    'billingModalChangeInfo.zipRequired': 'Postal/Zip Code is required',
    'billingModalChangeInfo.companyCheckbox':
      "I'm purchasing for a company",
    'billingModalChangeInfo.phoneLabel': 'Phone (optional)',
    'billingModalChangeInfo.timezoneLabel': 'Timezone',
    'billingModalChangeInfo.timezoneRequired': 'Timezone is required',
    'billingModalChangeInfo.timezonePacific': 'Pacific Time (PT)',
    'billingModalChangeInfo.timezoneMountain': 'Mountain Time (MT)',
    'billingModalChangeInfo.timezoneCentral': 'Central Time (CT)',
    'billingModalChangeInfo.timezoneEastern': 'Eastern Time (ET)',
    'billingModalChangeInfo.cancel': 'Cancel',
    'billingModalChangeInfo.saveChanges': 'Save changes',

    // BillingModalCheckoutForm.tsx
    'billingModalCheckoutForm.payNow': 'Pay now',
    'billingModalCheckoutForm.unexpectedError':
      'An unexpected error occurred.',
    'billingModalCheckoutForm.dynamicPaymentMethodsNote':
      'Payment methods are dynamically displayed based on customer location, order amount, and currency.',
    'billingModalCheckoutForm.previewPaymentMethods':
      'Preview payment methods by transaction',

    // BillingModalChangePlan.tsx
    'billingModalChangePlan.free.title': 'Free',
    'billingModalChangePlan.free.required': '* Enough for you MVP',
    'billingModalChangePlan.free.feature1': 'Custom level 2 domain (web3)',
    'billingModalChangePlan.free.feature2':
      'Web3, Chat and Push Notifications',
    'billingModalChangePlan.free.feature3':
      'Full API and IPFS (fair use policy)',
    'billingModalChangePlan.free.feature4': 'Discord & GitHub support',
    'billingModalChangePlan.free.feature5': 'Shared Cloud hosting',
    'billingModalChangePlan.business.title': 'Business',
    'billingModalChangePlan.business.required': '* Powering SMEs',
    'billingModalChangePlan.business.price': '199$ / month',
    'billingModalChangePlan.business.feature2':
      'Custom primary domain (web3)',
    'billingModalChangePlan.business.feature3':
      'Advanced L1, L2, IPFS options',
    'billingModalChangePlan.business.feature4':
      'High API and RPC performance',
    'billingModalChangePlan.business.feature5': 'Business Cloud SLA',
    'billingModalChangePlan.enterprise.title': 'Enterprise',
    'billingModalChangePlan.enterprise.required':
      '* Custom and larger needs',
    'billingModalChangePlan.enterprise.price': 'Custom',
    'billingModalChangePlan.enterprise.feature2':
      'Dedicated / On-prem hosting',
    'billingModalChangePlan.enterprise.feature3':
      'Enterprise custom configuration',
    'billingModalChangePlan.enterprise.feature4': '24/7 phone support',
    'billingModalChangePlan.enterprise.feature5': 'Enterprise-grade SLA',
    'billingModalChangePlan.everythingInFree': 'Everything in Free',
    'billingModalChangePlan.everythingInBusiness': 'Everything in Business',
    'billingModalChangePlan.choosePlan': 'Choose plan',

    // FeedbackButton.tsx
    'feedbackButton.support': 'Support',
    'feedbackButton.mobileAbbrev': 'Sp',

    // FeedbackIframe.tsx
    'feedbackIframe.title': 'Feedback',

    // ErrorContainer.tsx
    'errorContainer.goBack': 'Go Back',

    // RouterErrorBoundary.tsx
    'routerErrorBoundary.somethingWentWrong': 'Something went wrong',
    'routerErrorBoundary.refreshPage': 'Refresh page',
    'routerErrorBoundary.errorOccurred': 'An error occurred',
    'routerErrorBoundary.routingError': 'Routing error',
    'routerErrorBoundary.unknownError': 'Unknown error',
  },
  fr: {
    // AppearanceIphone.tsx
    'appearanceIphone.signUp': "S'inscrire",
    'appearanceIphone.placeholderFirstName': 'Prénom',
    'appearanceIphone.placeholderLastName': 'Nom',
    'appearanceIphone.placeholderEmail': 'E-mail',
    'appearanceIphone.agreementPrefix':
      "En cliquant sur le bouton « S'inscrire », vous acceptez nos",
    'appearanceIphone.termsAndConditions': 'Conditions générales.',
    'appearanceIphone.or': 'ou',
    'appearanceIphone.continueWithGoogle': 'Continuer avec Google',
    'appearanceIphone.alreadyHaveAccount': 'Vous avez déjà un compte ?',
    'appearanceIphone.signIn': 'Se connecter',

    // AppearanceRightImage.tsx
    'appearanceRightImage.signUp': "S'inscrire",
    'appearanceRightImage.joinCommunityTagline':
      '{name} : rejoignez notre communauté',
    'appearanceRightImage.agreementPrefix':
      "En cliquant sur le bouton « S'inscrire », vous acceptez nos",
    'appearanceRightImage.termsAndConditions': 'Conditions générales.',
    'appearanceRightImage.continueWithGoogle': 'Continuer avec Google',
    'appearanceRightImage.alreadyHaveAccount': 'Vous avez déjà un compte ?',
    'appearanceRightImage.signIn': 'Se connecter',

    // BillingHistoryTable.tsx
    'billingHistoryTable.date': 'Date',
    'billingHistoryTable.amount': 'Montant',
    'billingHistoryTable.status': 'Statut',
    'billingHistoryTable.invoice': 'Facture',

    // BillingModalChangeInfo.tsx
    'billingModalChangeInfo.title': 'Adresse de facturation',
    'billingModalChangeInfo.addressLabel': 'Adresse',
    'billingModalChangeInfo.addressRequired': "L'adresse est requise",
    'billingModalChangeInfo.cityLabel': 'Ville',
    'billingModalChangeInfo.cityRequired': 'La ville est requise',
    'billingModalChangeInfo.countryLabel': 'Pays',
    'billingModalChangeInfo.countryRequired': 'Le pays est requis',
    'billingModalChangeInfo.stateLabel': 'État / Province / Région',
    'billingModalChangeInfo.stateRequired':
      "L'État/la Province/la Région est requis(e)",
    'billingModalChangeInfo.zipLabel': 'Code postal',
    'billingModalChangeInfo.zipRequired': 'Le code postal est requis',
    'billingModalChangeInfo.companyCheckbox':
      "J'effectue cet achat pour une entreprise",
    'billingModalChangeInfo.phoneLabel': 'Téléphone (facultatif)',
    'billingModalChangeInfo.timezoneLabel': 'Fuseau horaire',
    'billingModalChangeInfo.timezoneRequired': 'Le fuseau horaire est requis',
    'billingModalChangeInfo.timezonePacific': 'Heure du Pacifique (PT)',
    'billingModalChangeInfo.timezoneMountain': 'Heure des Rocheuses (MT)',
    'billingModalChangeInfo.timezoneCentral': 'Heure du Centre (CT)',
    'billingModalChangeInfo.timezoneEastern': "Heure de l'Est (ET)",
    'billingModalChangeInfo.cancel': 'Annuler',
    'billingModalChangeInfo.saveChanges': 'Enregistrer les modifications',

    // BillingModalCheckoutForm.tsx
    'billingModalCheckoutForm.payNow': 'Payer maintenant',
    'billingModalCheckoutForm.unexpectedError':
      "Une erreur inattendue s'est produite.",
    'billingModalCheckoutForm.dynamicPaymentMethodsNote':
      "Les modes de paiement affichés varient dynamiquement selon la localisation du client, le montant de la commande et la devise.",
    'billingModalCheckoutForm.previewPaymentMethods':
      'Aperçu des modes de paiement par transaction',

    // BillingModalChangePlan.tsx
    'billingModalChangePlan.free.title': 'Gratuit',
    'billingModalChangePlan.free.required': '* Suffisant pour votre MVP',
    'billingModalChangePlan.free.feature1':
      'Domaine de niveau 2 personnalisé (web3)',
    'billingModalChangePlan.free.feature2':
      'Web3, chat et notifications push',
    'billingModalChangePlan.free.feature3':
      "API complète et IPFS (politique d'utilisation raisonnable)",
    'billingModalChangePlan.free.feature4': 'Support Discord et GitHub',
    'billingModalChangePlan.free.feature5': 'Hébergement cloud partagé',
    'billingModalChangePlan.business.title': 'Professionnel',
    'billingModalChangePlan.business.required': '* Conçu pour les PME',
    'billingModalChangePlan.business.price': '199 $ / mois',
    'billingModalChangePlan.business.feature2':
      'Domaine principal personnalisé (web3)',
    'billingModalChangePlan.business.feature3':
      'Options avancées L1, L2, IPFS',
    'billingModalChangePlan.business.feature4':
      'Hautes performances API et RPC',
    'billingModalChangePlan.business.feature5': 'SLA Cloud Entreprise',
    'billingModalChangePlan.enterprise.title': 'Entreprise',
    'billingModalChangePlan.enterprise.required':
      '* Pour les besoins sur mesure et à grande échelle',
    'billingModalChangePlan.enterprise.price': 'Sur mesure',
    'billingModalChangePlan.enterprise.feature2':
      'Hébergement dédié / sur site',
    'billingModalChangePlan.enterprise.feature3':
      "Configuration personnalisée pour l'entreprise",
    'billingModalChangePlan.enterprise.feature4':
      'Support téléphonique 24 h/24, 7 j/7',
    'billingModalChangePlan.enterprise.feature5':
      "SLA de niveau entreprise",
    'billingModalChangePlan.everythingInFree':
      "Tout ce qui est inclus dans l'offre Gratuit",
    'billingModalChangePlan.everythingInBusiness':
      "Tout ce qui est inclus dans l'offre Professionnel",
    'billingModalChangePlan.choosePlan': 'Choisir ce forfait',

    // FeedbackButton.tsx
    'feedbackButton.support': 'Assistance',
    'feedbackButton.mobileAbbrev': 'As',

    // FeedbackIframe.tsx
    'feedbackIframe.title': "Commentaires",

    // ErrorContainer.tsx
    'errorContainer.goBack': 'Retour',

    // RouterErrorBoundary.tsx
    'routerErrorBoundary.somethingWentWrong': "Une erreur s'est produite",
    'routerErrorBoundary.refreshPage': 'Actualiser la page',
    'routerErrorBoundary.errorOccurred': "Une erreur s'est produite",
    'routerErrorBoundary.routingError': 'Erreur de routage',
    'routerErrorBoundary.unknownError': 'Erreur inconnue',
  },
  es: {
    // AppearanceIphone.tsx
    'appearanceIphone.signUp': 'Registrarse',
    'appearanceIphone.placeholderFirstName': 'Nombre',
    'appearanceIphone.placeholderLastName': 'Apellido',
    'appearanceIphone.placeholderEmail': 'Correo electrónico',
    'appearanceIphone.agreementPrefix':
      'Al hacer clic en el botón "Registrarse", aceptas nuestros',
    'appearanceIphone.termsAndConditions': 'Términos y condiciones.',
    'appearanceIphone.or': 'o',
    'appearanceIphone.continueWithGoogle': 'Continuar con Google',
    'appearanceIphone.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'appearanceIphone.signIn': 'Iniciar sesión',

    // AppearanceRightImage.tsx
    'appearanceRightImage.signUp': 'Registrarse',
    'appearanceRightImage.joinCommunityTagline':
      '{name}: únete a nuestra comunidad',
    'appearanceRightImage.agreementPrefix':
      'Al hacer clic en el botón "Registrarse", aceptas nuestros',
    'appearanceRightImage.termsAndConditions': 'Términos y condiciones.',
    'appearanceRightImage.continueWithGoogle': 'Continuar con Google',
    'appearanceRightImage.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'appearanceRightImage.signIn': 'Iniciar sesión',

    // BillingHistoryTable.tsx
    'billingHistoryTable.date': 'Fecha',
    'billingHistoryTable.amount': 'Importe',
    'billingHistoryTable.status': 'Estado',
    'billingHistoryTable.invoice': 'Factura',

    // BillingModalChangeInfo.tsx
    'billingModalChangeInfo.title': 'Dirección de facturación',
    'billingModalChangeInfo.addressLabel': 'Dirección',
    'billingModalChangeInfo.addressRequired': 'La dirección es obligatoria',
    'billingModalChangeInfo.cityLabel': 'Ciudad',
    'billingModalChangeInfo.cityRequired': 'La ciudad es obligatoria',
    'billingModalChangeInfo.countryLabel': 'País',
    'billingModalChangeInfo.countryRequired': 'El país es obligatorio',
    'billingModalChangeInfo.stateLabel': 'Estado / Provincia / Región',
    'billingModalChangeInfo.stateRequired':
      'El estado/provincia/región es obligatorio',
    'billingModalChangeInfo.zipLabel': 'Código postal',
    'billingModalChangeInfo.zipRequired': 'El código postal es obligatorio',
    'billingModalChangeInfo.companyCheckbox':
      'Estoy comprando para una empresa',
    'billingModalChangeInfo.phoneLabel': 'Teléfono (opcional)',
    'billingModalChangeInfo.timezoneLabel': 'Zona horaria',
    'billingModalChangeInfo.timezoneRequired':
      'La zona horaria es obligatoria',
    'billingModalChangeInfo.timezonePacific': 'Hora del Pacífico (PT)',
    'billingModalChangeInfo.timezoneMountain': 'Hora de las Montañas (MT)',
    'billingModalChangeInfo.timezoneCentral': 'Hora Central (CT)',
    'billingModalChangeInfo.timezoneEastern': 'Hora del Este (ET)',
    'billingModalChangeInfo.cancel': 'Cancelar',
    'billingModalChangeInfo.saveChanges': 'Guardar cambios',

    // BillingModalCheckoutForm.tsx
    'billingModalCheckoutForm.payNow': 'Pagar ahora',
    'billingModalCheckoutForm.unexpectedError':
      'Se produjo un error inesperado.',
    'billingModalCheckoutForm.dynamicPaymentMethodsNote':
      'Los métodos de pago se muestran de forma dinámica según la ubicación del cliente, el importe del pedido y la moneda.',
    'billingModalCheckoutForm.previewPaymentMethods':
      'Vista previa de los métodos de pago por transacción',

    // BillingModalChangePlan.tsx
    'billingModalChangePlan.free.title': 'Gratis',
    'billingModalChangePlan.free.required': '* Suficiente para tu MVP',
    'billingModalChangePlan.free.feature1':
      'Dominio de nivel 2 personalizado (web3)',
    'billingModalChangePlan.free.feature2':
      'Web3, chat y notificaciones push',
    'billingModalChangePlan.free.feature3':
      'API completa e IPFS (política de uso razonable)',
    'billingModalChangePlan.free.feature4': 'Soporte por Discord y GitHub',
    'billingModalChangePlan.free.feature5':
      'Alojamiento en la nube compartido',
    'billingModalChangePlan.business.title': 'Empresarial',
    'billingModalChangePlan.business.required':
      '* Impulsando a las pymes',
    'billingModalChangePlan.business.price': '199 $ / mes',
    'billingModalChangePlan.business.feature2':
      'Dominio principal personalizado (web3)',
    'billingModalChangePlan.business.feature3':
      'Opciones avanzadas de L1, L2 e IPFS',
    'billingModalChangePlan.business.feature4':
      'Alto rendimiento de API y RPC',
    'billingModalChangePlan.business.feature5': 'SLA de nube empresarial',
    'billingModalChangePlan.enterprise.title': 'Corporativo',
    'billingModalChangePlan.enterprise.required':
      '* Para necesidades personalizadas y de mayor escala',
    'billingModalChangePlan.enterprise.price': 'Personalizado',
    'billingModalChangePlan.enterprise.feature2':
      'Alojamiento dedicado / en las instalaciones',
    'billingModalChangePlan.enterprise.feature3':
      'Configuración personalizada para empresas',
    'billingModalChangePlan.enterprise.feature4': 'Soporte telefónico 24/7',
    'billingModalChangePlan.enterprise.feature5':
      'SLA de nivel empresarial',
    'billingModalChangePlan.everythingInFree':
      'Todo lo incluido en el plan Gratis',
    'billingModalChangePlan.everythingInBusiness':
      'Todo lo incluido en el plan Empresarial',
    'billingModalChangePlan.choosePlan': 'Elegir plan',

    // FeedbackButton.tsx
    'feedbackButton.support': 'Soporte',
    'feedbackButton.mobileAbbrev': 'So',

    // FeedbackIframe.tsx
    'feedbackIframe.title': 'Comentarios',

    // ErrorContainer.tsx
    'errorContainer.goBack': 'Volver',

    // RouterErrorBoundary.tsx
    'routerErrorBoundary.somethingWentWrong': 'Algo salió mal',
    'routerErrorBoundary.refreshPage': 'Actualizar página',
    'routerErrorBoundary.errorOccurred': 'Se produjo un error',
    'routerErrorBoundary.routingError': 'Error de enrutamiento',
    'routerErrorBoundary.unknownError': 'Error desconocido',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
