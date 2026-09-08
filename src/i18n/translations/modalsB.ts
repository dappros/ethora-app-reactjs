import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Second batch of modal dictionaries (see index.ts for how this merges into
// the app-wide translations table). Namespaced per source file: NewAppModal,
// AvatarModalCropper, CreateDocumentModal, NewUserModal,
// ResetPasswordUserModal, ConfirmModal.
export const modalsB = {
  en: {
    'newAppModal.creatingTitle': 'Application creation in progress!',
    'newAppModal.creatingMessage':
      'Your app is being deployed. Please wait, this might take up to 10-15 seconds',
    'newAppModal.title': 'Get Started with Your New App',
    'newAppModal.namePlaceholder': 'App Name',
    'newAppModal.nameRequired': 'App name is required',
    'newAppModal.nameMinLength': 'App name must be at least 3 characters',
    'newAppModal.continueButton': 'Continue',
    'newAppModal.cancelButton': 'Cancel',
    'newAppModal.createSuccessToast': 'Application created successfully!',
    'newAppModal.createErrorToast': 'Error creating application.',

    'avatarModalCropper.uploadAlt': 'Upload',
    'avatarModalCropper.cancelButton': 'Cancel',
    'avatarModalCropper.doneButton': 'Done',

    'createDocumentModal.title': 'New Document',
    'createDocumentModal.titlePlaceholder': 'Document title',
    'createDocumentModal.noFileChosen': 'No file chosen',
    'createDocumentModal.cancelButton': 'Cancel',
    'createDocumentModal.createButton': 'Create',
    'createDocumentModal.successToast': 'Document created successfully',

    'newUserModal.title': 'Add New User',
    'newUserModal.firstNamePlaceholder': 'First Name',
    'newUserModal.lastNamePlaceholder': 'Last Name',
    'newUserModal.emailPlaceholder': 'Email',
    'newUserModal.passwordPlaceholder': 'Password',
    'newUserModal.passwordHint':
      'Generated automatically. Edit it if you like — it is saved as the sign-in password and downloaded as a CSV once the user is created.',
    'newUserModal.passwordRegenerate': 'Generate a new password',
    'newUserModal.passwordMinLength': 'Password must be at least 6 characters',
    'newUserModal.cancelButton': 'Cancel',
    'newUserModal.continueButton': 'Continue',

    'resetPasswordUserModal.title': 'Reset password',
    'resetPasswordUserModal.cancelButton': 'Cancel',
    'resetPasswordUserModal.continueButton': 'Continue',

    'confirmModal.cancelLabelDefault': 'Cancel',
    'confirmModal.closeAriaLabel': 'Close',
    'confirmModal.workingLabel': 'Working...',
  },
  fr: {
    'newAppModal.creatingTitle': "Création de l'application en cours !",
    'newAppModal.creatingMessage':
      "Votre application est en cours de déploiement. Veuillez patienter, cela peut prendre jusqu'à 10 à 15 secondes",
    'newAppModal.title': 'Commencez avec votre nouvelle application',
    'newAppModal.namePlaceholder': "Nom de l'application",
    'newAppModal.nameRequired': "Le nom de l'application est requis",
    'newAppModal.nameMinLength':
      "Le nom de l'application doit comporter au moins 3 caractères",
    'newAppModal.continueButton': 'Continuer',
    'newAppModal.cancelButton': 'Annuler',
    'newAppModal.createSuccessToast': 'Application créée avec succès !',
    'newAppModal.createErrorToast':
      "Erreur lors de la création de l'application.",

    'avatarModalCropper.uploadAlt': 'Téléverser',
    'avatarModalCropper.cancelButton': 'Annuler',
    'avatarModalCropper.doneButton': 'Terminé',

    'createDocumentModal.title': 'Nouveau document',
    'createDocumentModal.titlePlaceholder': 'Titre du document',
    'createDocumentModal.noFileChosen': 'Aucun fichier choisi',
    'createDocumentModal.cancelButton': 'Annuler',
    'createDocumentModal.createButton': 'Créer',
    'createDocumentModal.successToast': 'Document créé avec succès',

    'newUserModal.title': 'Ajouter un nouvel utilisateur',
    'newUserModal.firstNamePlaceholder': 'Prénom',
    'newUserModal.lastNamePlaceholder': 'Nom',
    'newUserModal.emailPlaceholder': 'E-mail',
    'newUserModal.passwordPlaceholder': 'Mot de passe',
    'newUserModal.passwordHint':
      'Généré automatiquement. Modifiez-le si vous le souhaitez : il est enregistré comme mot de passe de connexion et téléchargé en CSV une fois l’utilisateur créé.',
    'newUserModal.passwordRegenerate': 'Générer un nouveau mot de passe',
    'newUserModal.passwordMinLength':
      'Le mot de passe doit contenir au moins 6 caractères',
    'newUserModal.cancelButton': 'Annuler',
    'newUserModal.continueButton': 'Continuer',

    'resetPasswordUserModal.title': 'Réinitialiser le mot de passe',
    'resetPasswordUserModal.cancelButton': 'Annuler',
    'resetPasswordUserModal.continueButton': 'Continuer',

    'confirmModal.cancelLabelDefault': 'Annuler',
    'confirmModal.closeAriaLabel': 'Fermer',
    'confirmModal.workingLabel': 'Traitement en cours...',
  },
  es: {
    'newAppModal.creatingTitle': '¡Creación de la aplicación en curso!',
    'newAppModal.creatingMessage':
      'Tu aplicación se está implementando. Espera, esto puede tardar entre 10 y 15 segundos',
    'newAppModal.title': 'Empieza con tu nueva aplicación',
    'newAppModal.namePlaceholder': 'Nombre de la aplicación',
    'newAppModal.nameRequired': 'El nombre de la aplicación es obligatorio',
    'newAppModal.nameMinLength':
      'El nombre de la aplicación debe tener al menos 3 caracteres',
    'newAppModal.continueButton': 'Continuar',
    'newAppModal.cancelButton': 'Cancelar',
    'newAppModal.createSuccessToast': '¡Aplicación creada correctamente!',
    'newAppModal.createErrorToast': 'Error al crear la aplicación.',

    'avatarModalCropper.uploadAlt': 'Subir',
    'avatarModalCropper.cancelButton': 'Cancelar',
    'avatarModalCropper.doneButton': 'Listo',

    'createDocumentModal.title': 'Nuevo documento',
    'createDocumentModal.titlePlaceholder': 'Título del documento',
    'createDocumentModal.noFileChosen': 'Ningún archivo seleccionado',
    'createDocumentModal.cancelButton': 'Cancelar',
    'createDocumentModal.createButton': 'Crear',
    'createDocumentModal.successToast': 'Documento creado correctamente',

    'newUserModal.title': 'Añadir nuevo usuario',
    'newUserModal.firstNamePlaceholder': 'Nombre',
    'newUserModal.lastNamePlaceholder': 'Apellido',
    'newUserModal.emailPlaceholder': 'Correo electrónico',
    'newUserModal.passwordPlaceholder': 'Contraseña',
    'newUserModal.passwordHint':
      'Generada automáticamente. Puedes editarla: se guarda como contraseña de acceso y se descarga en CSV cuando se crea el usuario.',
    'newUserModal.passwordRegenerate': 'Generar una contraseña nueva',
    'newUserModal.passwordMinLength':
      'La contraseña debe tener al menos 6 caracteres',
    'newUserModal.cancelButton': 'Cancelar',
    'newUserModal.continueButton': 'Continuar',

    'resetPasswordUserModal.title': 'Restablecer contraseña',
    'resetPasswordUserModal.cancelButton': 'Cancelar',
    'resetPasswordUserModal.continueButton': 'Continuar',

    'confirmModal.cancelLabelDefault': 'Cancelar',
    'confirmModal.closeAriaLabel': 'Cerrar',
    'confirmModal.workingLabel': 'Procesando...',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
