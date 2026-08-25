import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Login / Register / Forgot-password flows (src/pages/AuthPage/** and
// src/pages/Login.tsx). Namespaced per component/step so multiple files can
// be edited independently without key collisions - see common.ts for the
// overall shape this file follows.
export const authFlows = {
  en: {
    // ForgetPassword/Steps/FirstStep.tsx
    'authForgetPasswordFirstStep.description':
      'Please, enter your email, and we will send you a link to reset your password.',
    'authForgetPasswordFirstStep.emailPlaceholder': 'Email',
    'authForgetPasswordFirstStep.emailRequired': 'Email is required',
    'authForgetPasswordFirstStep.emailInvalid': 'Invalid email address',
    'authForgetPasswordFirstStep.submit': 'Send Email',

    // ForgetPassword/Steps/SecondStep.tsx
    'authForgetPasswordSecondStep.title': 'Check your email address',
    'authForgetPasswordSecondStep.sentEmailPrefix': "We've sent an email to",
    'authForgetPasswordSecondStep.yourEmailFallback': 'your email',
    'authForgetPasswordSecondStep.instructionClickLink':
      'Just click on the link in the email to continue the registration process.',
    'authForgetPasswordSecondStep.instructionCheckSpam':
      "If you don't see it, check your spam folder.",
    'authForgetPasswordSecondStep.stillCantFind':
      "Still can't find the email?",
    'authForgetPasswordSecondStep.resendIn': 'Resend Email in',
    'authForgetPasswordSecondStep.resendEmail': 'Resend Email',

    // ForgetPassword/Steps/ThirdStep.tsx
    'authForgetPasswordThirdStep.badResetUrl':
      'Bad reset url. Try reset again',
    'authForgetPasswordThirdStep.resetSuccess':
      'Password was successfully reset',
    'authForgetPasswordThirdStep.error': 'Error',
    'authForgetPasswordThirdStep.title': 'Set your new password',
    'authForgetPasswordThirdStep.newPasswordPlaceholder':
      'Enter New Password',
    'authForgetPasswordThirdStep.passwordRequired': 'Password is required',
    'authForgetPasswordThirdStep.passwordMinLength':
      'Password must be at least 4 characters',
    'authForgetPasswordThirdStep.repeatPasswordPlaceholder':
      'Repeat New Password',
    'authForgetPasswordThirdStep.submit': 'Reset password',

    // Forms/ForgetPasswordForm.tsx
    'authForgetPasswordForm.stepNotFound': 'Step not found',
    'authForgetPasswordForm.title': 'Forgot Password',
    'authForgetPasswordForm.backToSignIn': 'Back to Sign In',
    'authForgetPasswordForm.noAccount': "Don't have an account?",
    'authForgetPasswordForm.signUp': 'Sign Up',

    // Register/RegistrationOpenRoute.tsx + the social/wallet buttons, for
    // apps whose owner has closed self-service registration.
    'authRegistrationClosed.notice':
      'Registration is closed for this app.',
    'authRegistrationClosed.socialNoAccount':
      'No account found for this email. Registration is closed for this app - ask the app owner to add you.',
    'authRegistrationClosed.walletNoAccount':
      'No account found for this wallet. Registration is closed for this app - ask the app owner to add you.',

    // Forms/LoginForm.tsx
    'authLoginForm.title': 'Sign In',
    'authLoginForm.noAccount': "Don't have an account?",
    'authLoginForm.signUp': 'Sign Up',

    // Forms/RegisterLayout.tsx
    'authRegisterLayout.title': 'Sign Up',
    'authRegisterLayout.alreadyHaveAccount': 'Already have an account?',
    'authRegisterLayout.signIn': 'Sign In',

    // Login/Steps/LoginForm.tsx
    'authLoginStep.processError':
      'Failed to process login. Please try again.',
    'authLoginStep.emailPlaceholder': 'Email',
    'authLoginStep.emailRequired': 'Email is required',
    'authLoginStep.emailInvalid': 'Invalid email address',
    'authLoginStep.passwordPlaceholder': 'Password',
    'authLoginStep.requiredField': 'Required field',
    'authLoginStep.forgotPassword': 'Forgot password ?',
    'authLoginStep.submit': 'Sign In',
    'authLoginStep.or': 'or',
    'authLoginStep.loginFailed':
      'Login failed. Please check your credentials.',
    'authLoginStep.timeoutError':
      'Request timed out. Please check if the backend server is running on port 8080.',
    'authLoginStep.serverErrorPrefix': 'Server error',
    'authLoginStep.noResponseError':
      'No response from server. Please check if the backend is running.',
    'authLoginStep.unexpectedError': 'An unexpected error occurred.',

    // Register/RegisterForm.tsx
    'authRegisterForm.didYouMean': 'Did you mean',
    'authRegisterForm.or': 'OR',
    'authRegisterForm.firstNamePlaceholder': 'First Name',
    'authRegisterForm.firstNameRequired': 'First Name is required',
    'authRegisterForm.lastNamePlaceholder': 'Last Name',
    'authRegisterForm.emailPlaceholder': 'Email',
    'authRegisterForm.emailRequired': 'Email is required',
    'authRegisterForm.emailInvalid': 'Invalid email address',
    'authRegisterForm.passwordPlaceholder': 'Password',
    'authRegisterForm.requiredField': 'Required field',
    'authRegisterForm.submit': 'Sign Up',
    'authRegisterForm.agreementPrefix':
      "By clicking the 'Sign Up' button, you agree to our",
    'authRegisterForm.termsAndConditions': 'Terms & Conditions',
    'authRegisterForm.accountExists':
      'An account with this email already exists.',

    // Register/Steps/FirstStep.tsx
    'authRegisterFirstStep.perhapsYouMeant': 'Perhaps you meant',
    'authRegisterFirstStep.or': 'OR',
    'authRegisterFirstStep.firstNamePlaceholder': 'First Name',
    'authRegisterFirstStep.firstNameRequired': 'First Name is required',
    'authRegisterFirstStep.lastNamePlaceholder': 'Last Name',
    'authRegisterFirstStep.emailPlaceholder': 'Email',
    'authRegisterFirstStep.emailRequired': 'Email is required',
    'authRegisterFirstStep.emailInvalid': 'Invalid email address',
    'authRegisterFirstStep.passwordPlaceholder': 'Password',
    'authRegisterFirstStep.requiredField': 'Required field',
    'authRegisterFirstStep.submit': 'Sign Up',
    'authRegisterFirstStep.agreementPrefix':
      "By clicking the 'Sign Up' button, you agree to our",
    'authRegisterFirstStep.termsAndConditions': 'Terms & Conditions',
    'authRegisterFirstStep.accountExists':
      'An account with this email already exists.',

    // Register/Steps/SecondStep.tsx
    'authRegisterSecondStep.title': 'Confirm your email address',
    'authRegisterSecondStep.sentEmailPrefix': "We've sent an email to",
    'authRegisterSecondStep.yourEmailFallback': 'your email',
    'authRegisterSecondStep.instructionClickLink':
      'Just click on the link in the email to continue the registration process.',
    'authRegisterSecondStep.instructionCheckSpam':
      "If you don't see it, check your spam folder.",
    'authRegisterSecondStep.stillCantFind': "Still can't find the email?",
    'authRegisterSecondStep.resendIn': 'Resend in',
    'authRegisterSecondStep.resendEmail': 'Resend Email',
    'authRegisterSecondStep.resendSuccess': 'Email has been resent',
    'authRegisterSecondStep.resendError': 'An error occurred',

    // Register/Steps/ThirdStep.tsx
    'authRegisterThirdStep.passwordMismatch': 'Passwords do not match!',
    'authRegisterThirdStep.success': 'Success',
    'authRegisterThirdStep.error': 'Error',
    'authRegisterThirdStep.title': 'Set your own password',
    'authRegisterThirdStep.enterPasswordPlaceholder': 'Enter Your Password',
    'authRegisterThirdStep.requiredField': 'Required field',
    'authRegisterThirdStep.repeatPasswordPlaceholder': 'Repeat Your Password',
    'authRegisterThirdStep.submit': 'Set Password',

    // pages/Login.tsx
    'authLoginPage.title': 'Login',
  },
  fr: {
    // ForgetPassword/Steps/FirstStep.tsx
    'authForgetPasswordFirstStep.description':
      "Veuillez saisir votre adresse e-mail, nous vous enverrons un lien pour réinitialiser votre mot de passe.",
    'authForgetPasswordFirstStep.emailPlaceholder': 'E-mail',
    'authForgetPasswordFirstStep.emailRequired': "L'e-mail est requis",
    'authForgetPasswordFirstStep.emailInvalid': 'Adresse e-mail invalide',
    'authForgetPasswordFirstStep.submit': "Envoyer l'e-mail",

    // ForgetPassword/Steps/SecondStep.tsx
    'authForgetPasswordSecondStep.title': 'Vérifiez votre adresse e-mail',
    'authForgetPasswordSecondStep.sentEmailPrefix':
      'Nous avons envoyé un e-mail à',
    'authForgetPasswordSecondStep.yourEmailFallback': 'votre adresse e-mail',
    'authForgetPasswordSecondStep.instructionClickLink':
      "Cliquez simplement sur le lien dans l'e-mail pour poursuivre le processus d'inscription.",
    'authForgetPasswordSecondStep.instructionCheckSpam':
      'Si vous ne le voyez pas, vérifiez votre dossier spam.',
    'authForgetPasswordSecondStep.stillCantFind':
      "Vous ne trouvez toujours pas l'e-mail ?",
    'authForgetPasswordSecondStep.resendIn': "Renvoyer l'e-mail dans",
    'authForgetPasswordSecondStep.resendEmail': "Renvoyer l'e-mail",

    // ForgetPassword/Steps/ThirdStep.tsx
    'authForgetPasswordThirdStep.badResetUrl':
      'Lien de réinitialisation invalide. Veuillez recommencer.',
    'authForgetPasswordThirdStep.resetSuccess':
      'Le mot de passe a été réinitialisé avec succès',
    'authForgetPasswordThirdStep.error': 'Erreur',
    'authForgetPasswordThirdStep.title': 'Définissez votre nouveau mot de passe',
    'authForgetPasswordThirdStep.newPasswordPlaceholder':
      'Saisir le nouveau mot de passe',
    'authForgetPasswordThirdStep.passwordRequired':
      'Le mot de passe est requis',
    'authForgetPasswordThirdStep.passwordMinLength':
      'Le mot de passe doit contenir au moins 4 caractères',
    'authForgetPasswordThirdStep.repeatPasswordPlaceholder':
      'Répéter le nouveau mot de passe',
    'authForgetPasswordThirdStep.submit': 'Réinitialiser le mot de passe',

    // Forms/ForgetPasswordForm.tsx
    'authForgetPasswordForm.stepNotFound': 'Étape introuvable',
    'authForgetPasswordForm.title': 'Mot de passe oublié',
    'authForgetPasswordForm.backToSignIn': 'Retour à la connexion',
    'authForgetPasswordForm.noAccount': "Vous n'avez pas de compte ?",
    'authForgetPasswordForm.signUp': "S'inscrire",

    // Register/RegistrationOpenRoute.tsx + the social/wallet buttons, for
    // apps whose owner has closed self-service registration.
    'authRegistrationClosed.notice':
      'Les inscriptions sont fermées pour cette application.',
    'authRegistrationClosed.socialNoAccount':
      "Aucun compte trouvé pour cette adresse e-mail. Les inscriptions sont fermées pour cette application - demandez au propriétaire de vous ajouter.",
    'authRegistrationClosed.walletNoAccount':
      "Aucun compte trouvé pour ce portefeuille. Les inscriptions sont fermées pour cette application - demandez au propriétaire de vous ajouter.",

    // Forms/LoginForm.tsx
    'authLoginForm.title': 'Connexion',
    'authLoginForm.noAccount': "Vous n'avez pas de compte ?",
    'authLoginForm.signUp': "S'inscrire",

    // Forms/RegisterLayout.tsx
    'authRegisterLayout.title': 'Inscription',
    'authRegisterLayout.alreadyHaveAccount': 'Vous avez déjà un compte ?',
    'authRegisterLayout.signIn': 'Se connecter',

    // Login/Steps/LoginForm.tsx
    'authLoginStep.processError':
      'Échec du traitement de la connexion. Veuillez réessayer.',
    'authLoginStep.emailPlaceholder': 'E-mail',
    'authLoginStep.emailRequired': "L'e-mail est requis",
    'authLoginStep.emailInvalid': 'Adresse e-mail invalide',
    'authLoginStep.passwordPlaceholder': 'Mot de passe',
    'authLoginStep.requiredField': 'Champ requis',
    'authLoginStep.forgotPassword': 'Mot de passe oublié ?',
    'authLoginStep.submit': 'Se connecter',
    'authLoginStep.or': 'ou',
    'authLoginStep.loginFailed':
      'Échec de la connexion. Veuillez vérifier vos identifiants.',
    'authLoginStep.timeoutError':
      "Délai d'attente dépassé. Vérifiez que le serveur backend fonctionne sur le port 8080.",
    'authLoginStep.serverErrorPrefix': 'Erreur du serveur',
    'authLoginStep.noResponseError':
      "Aucune réponse du serveur. Vérifiez que le backend est en cours d'exécution.",
    'authLoginStep.unexpectedError': "Une erreur inattendue s'est produite.",

    // Register/RegisterForm.tsx
    'authRegisterForm.didYouMean': 'Vouliez-vous dire',
    'authRegisterForm.or': 'OU',
    'authRegisterForm.firstNamePlaceholder': 'Prénom',
    'authRegisterForm.firstNameRequired': 'Le prénom est requis',
    'authRegisterForm.lastNamePlaceholder': 'Nom',
    'authRegisterForm.emailPlaceholder': 'E-mail',
    'authRegisterForm.emailRequired': "L'e-mail est requis",
    'authRegisterForm.emailInvalid': 'Adresse e-mail invalide',
    'authRegisterForm.passwordPlaceholder': 'Mot de passe',
    'authRegisterForm.requiredField': 'Champ requis',
    'authRegisterForm.submit': "S'inscrire",
    'authRegisterForm.agreementPrefix':
      "En cliquant sur le bouton « S'inscrire », vous acceptez nos",
    'authRegisterForm.termsAndConditions': 'Conditions générales',
    'authRegisterForm.accountExists':
      'Un compte avec cette adresse e-mail existe déjà.',

    // Register/Steps/FirstStep.tsx
    'authRegisterFirstStep.perhapsYouMeant': 'Peut-être vouliez-vous dire',
    'authRegisterFirstStep.or': 'OU',
    'authRegisterFirstStep.firstNamePlaceholder': 'Prénom',
    'authRegisterFirstStep.firstNameRequired': 'Le prénom est requis',
    'authRegisterFirstStep.lastNamePlaceholder': 'Nom',
    'authRegisterFirstStep.emailPlaceholder': 'E-mail',
    'authRegisterFirstStep.emailRequired': "L'e-mail est requis",
    'authRegisterFirstStep.emailInvalid': 'Adresse e-mail invalide',
    'authRegisterFirstStep.passwordPlaceholder': 'Mot de passe',
    'authRegisterFirstStep.requiredField': 'Champ requis',
    'authRegisterFirstStep.submit': "S'inscrire",
    'authRegisterFirstStep.agreementPrefix':
      "En cliquant sur le bouton « S'inscrire », vous acceptez nos",
    'authRegisterFirstStep.termsAndConditions': 'Conditions générales',
    'authRegisterFirstStep.accountExists':
      'Un compte avec cette adresse e-mail existe déjà.',

    // Register/Steps/SecondStep.tsx
    'authRegisterSecondStep.title': 'Confirmez votre adresse e-mail',
    'authRegisterSecondStep.sentEmailPrefix': 'Nous avons envoyé un e-mail à',
    'authRegisterSecondStep.yourEmailFallback': 'votre adresse e-mail',
    'authRegisterSecondStep.instructionClickLink':
      "Cliquez simplement sur le lien dans l'e-mail pour poursuivre le processus d'inscription.",
    'authRegisterSecondStep.instructionCheckSpam':
      'Si vous ne le voyez pas, vérifiez votre dossier spam.',
    'authRegisterSecondStep.stillCantFind':
      "Vous ne trouvez toujours pas l'e-mail ?",
    'authRegisterSecondStep.resendIn': 'Renvoyer dans',
    'authRegisterSecondStep.resendEmail': "Renvoyer l'e-mail",
    'authRegisterSecondStep.resendSuccess': "L'e-mail a été renvoyé",
    'authRegisterSecondStep.resendError': 'Une erreur est survenue',

    // Register/Steps/ThirdStep.tsx
    'authRegisterThirdStep.passwordMismatch':
      'Les mots de passe ne correspondent pas !',
    'authRegisterThirdStep.success': 'Succès',
    'authRegisterThirdStep.error': 'Erreur',
    'authRegisterThirdStep.title': 'Définissez votre propre mot de passe',
    'authRegisterThirdStep.enterPasswordPlaceholder':
      'Saisissez votre mot de passe',
    'authRegisterThirdStep.requiredField': 'Champ requis',
    'authRegisterThirdStep.repeatPasswordPlaceholder':
      'Répétez votre mot de passe',
    'authRegisterThirdStep.submit': 'Définir le mot de passe',

    // pages/Login.tsx
    'authLoginPage.title': 'Connexion',
  },
  es: {
    // ForgetPassword/Steps/FirstStep.tsx
    'authForgetPasswordFirstStep.description':
      'Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
    'authForgetPasswordFirstStep.emailPlaceholder': 'Correo electrónico',
    'authForgetPasswordFirstStep.emailRequired':
      'El correo electrónico es obligatorio',
    'authForgetPasswordFirstStep.emailInvalid':
      'Dirección de correo electrónico no válida',
    'authForgetPasswordFirstStep.submit': 'Enviar correo',

    // ForgetPassword/Steps/SecondStep.tsx
    'authForgetPasswordSecondStep.title': 'Revisa tu correo electrónico',
    'authForgetPasswordSecondStep.sentEmailPrefix': 'Hemos enviado un correo a',
    'authForgetPasswordSecondStep.yourEmailFallback': 'tu correo electrónico',
    'authForgetPasswordSecondStep.instructionClickLink':
      'Haz clic en el enlace del correo para continuar con el proceso de registro.',
    'authForgetPasswordSecondStep.instructionCheckSpam':
      'Si no lo ves, revisa tu carpeta de spam.',
    'authForgetPasswordSecondStep.stillCantFind':
      '¿Sigues sin encontrar el correo?',
    'authForgetPasswordSecondStep.resendIn': 'Reenviar correo en',
    'authForgetPasswordSecondStep.resendEmail': 'Reenviar correo',

    // ForgetPassword/Steps/ThirdStep.tsx
    'authForgetPasswordThirdStep.badResetUrl':
      'Enlace de restablecimiento no válido. Inténtalo de nuevo.',
    'authForgetPasswordThirdStep.resetSuccess':
      'La contraseña se restableció correctamente',
    'authForgetPasswordThirdStep.error': 'Error',
    'authForgetPasswordThirdStep.title': 'Establece tu nueva contraseña',
    'authForgetPasswordThirdStep.newPasswordPlaceholder':
      'Introduce la nueva contraseña',
    'authForgetPasswordThirdStep.passwordRequired':
      'La contraseña es obligatoria',
    'authForgetPasswordThirdStep.passwordMinLength':
      'La contraseña debe tener al menos 4 caracteres',
    'authForgetPasswordThirdStep.repeatPasswordPlaceholder':
      'Repite la nueva contraseña',
    'authForgetPasswordThirdStep.submit': 'Restablecer contraseña',

    // Forms/ForgetPasswordForm.tsx
    'authForgetPasswordForm.stepNotFound': 'Paso no encontrado',
    'authForgetPasswordForm.title': 'Contraseña olvidada',
    'authForgetPasswordForm.backToSignIn': 'Volver a iniciar sesión',
    'authForgetPasswordForm.noAccount': '¿No tienes una cuenta?',
    'authForgetPasswordForm.signUp': 'Regístrate',

    // Register/RegistrationOpenRoute.tsx + the social/wallet buttons, for
    // apps whose owner has closed self-service registration.
    'authRegistrationClosed.notice':
      'El registro está cerrado en esta aplicación.',
    'authRegistrationClosed.socialNoAccount':
      'No se encontró ninguna cuenta con este correo. El registro está cerrado en esta aplicación: pide al propietario que te añada.',
    'authRegistrationClosed.walletNoAccount':
      'No se encontró ninguna cuenta con esta cartera. El registro está cerrado en esta aplicación: pide al propietario que te añada.',

    // Forms/LoginForm.tsx
    'authLoginForm.title': 'Iniciar sesión',
    'authLoginForm.noAccount': '¿No tienes una cuenta?',
    'authLoginForm.signUp': 'Regístrate',

    // Forms/RegisterLayout.tsx
    'authRegisterLayout.title': 'Regístrate',
    'authRegisterLayout.alreadyHaveAccount': '¿Ya tienes una cuenta?',
    'authRegisterLayout.signIn': 'Iniciar sesión',

    // Login/Steps/LoginForm.tsx
    'authLoginStep.processError':
      'No se pudo procesar el inicio de sesión. Inténtalo de nuevo.',
    'authLoginStep.emailPlaceholder': 'Correo electrónico',
    'authLoginStep.emailRequired': 'El correo electrónico es obligatorio',
    'authLoginStep.emailInvalid': 'Dirección de correo electrónico no válida',
    'authLoginStep.passwordPlaceholder': 'Contraseña',
    'authLoginStep.requiredField': 'Campo obligatorio',
    'authLoginStep.forgotPassword': '¿Olvidaste tu contraseña?',
    'authLoginStep.submit': 'Iniciar sesión',
    'authLoginStep.or': 'o',
    'authLoginStep.loginFailed':
      'Error al iniciar sesión. Verifica tus credenciales.',
    'authLoginStep.timeoutError':
      'Tiempo de espera agotado. Verifica que el servidor backend esté ejecutándose en el puerto 8080.',
    'authLoginStep.serverErrorPrefix': 'Error del servidor',
    'authLoginStep.noResponseError':
      'No hay respuesta del servidor. Verifica que el backend esté en ejecución.',
    'authLoginStep.unexpectedError': 'Se produjo un error inesperado.',

    // Register/RegisterForm.tsx
    'authRegisterForm.didYouMean': '¿Quisiste decir',
    'authRegisterForm.or': 'O',
    'authRegisterForm.firstNamePlaceholder': 'Nombre',
    'authRegisterForm.firstNameRequired': 'El nombre es obligatorio',
    'authRegisterForm.lastNamePlaceholder': 'Apellido',
    'authRegisterForm.emailPlaceholder': 'Correo electrónico',
    'authRegisterForm.emailRequired': 'El correo electrónico es obligatorio',
    'authRegisterForm.emailInvalid': 'Dirección de correo electrónico no válida',
    'authRegisterForm.passwordPlaceholder': 'Contraseña',
    'authRegisterForm.requiredField': 'Campo obligatorio',
    'authRegisterForm.submit': 'Regístrate',
    'authRegisterForm.agreementPrefix':
      'Al hacer clic en el botón «Regístrate», aceptas nuestros',
    'authRegisterForm.termsAndConditions': 'Términos y condiciones',
    'authRegisterForm.accountExists':
      'Ya existe una cuenta con este correo electrónico.',

    // Register/Steps/FirstStep.tsx
    'authRegisterFirstStep.perhapsYouMeant': 'Quizás quisiste decir',
    'authRegisterFirstStep.or': 'O',
    'authRegisterFirstStep.firstNamePlaceholder': 'Nombre',
    'authRegisterFirstStep.firstNameRequired': 'El nombre es obligatorio',
    'authRegisterFirstStep.lastNamePlaceholder': 'Apellido',
    'authRegisterFirstStep.emailPlaceholder': 'Correo electrónico',
    'authRegisterFirstStep.emailRequired':
      'El correo electrónico es obligatorio',
    'authRegisterFirstStep.emailInvalid':
      'Dirección de correo electrónico no válida',
    'authRegisterFirstStep.passwordPlaceholder': 'Contraseña',
    'authRegisterFirstStep.requiredField': 'Campo obligatorio',
    'authRegisterFirstStep.submit': 'Regístrate',
    'authRegisterFirstStep.agreementPrefix':
      'Al hacer clic en el botón «Regístrate», aceptas nuestros',
    'authRegisterFirstStep.termsAndConditions': 'Términos y condiciones',
    'authRegisterFirstStep.accountExists':
      'Ya existe una cuenta con este correo electrónico.',

    // Register/Steps/SecondStep.tsx
    'authRegisterSecondStep.title': 'Confirma tu correo electrónico',
    'authRegisterSecondStep.sentEmailPrefix': 'Hemos enviado un correo a',
    'authRegisterSecondStep.yourEmailFallback': 'tu correo electrónico',
    'authRegisterSecondStep.instructionClickLink':
      'Haz clic en el enlace del correo para continuar con el proceso de registro.',
    'authRegisterSecondStep.instructionCheckSpam':
      'Si no lo ves, revisa tu carpeta de spam.',
    'authRegisterSecondStep.stillCantFind': '¿Sigues sin encontrar el correo?',
    'authRegisterSecondStep.resendIn': 'Reenviar en',
    'authRegisterSecondStep.resendEmail': 'Reenviar correo',
    'authRegisterSecondStep.resendSuccess': 'El correo se ha reenviado',
    'authRegisterSecondStep.resendError': 'Se produjo un error',

    // Register/Steps/ThirdStep.tsx
    'authRegisterThirdStep.passwordMismatch':
      '¡Las contraseñas no coinciden!',
    'authRegisterThirdStep.success': 'Éxito',
    'authRegisterThirdStep.error': 'Error',
    'authRegisterThirdStep.title': 'Establece tu propia contraseña',
    'authRegisterThirdStep.enterPasswordPlaceholder':
      'Introduce tu contraseña',
    'authRegisterThirdStep.requiredField': 'Campo obligatorio',
    'authRegisterThirdStep.repeatPasswordPlaceholder': 'Repite tu contraseña',
    'authRegisterThirdStep.submit': 'Establecer contraseña',

    // pages/Login.tsx
    'authLoginPage.title': 'Iniciar sesión',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
