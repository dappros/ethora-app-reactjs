import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Account / User Settings area: src/pages/UserSettings/* (tab shell +
// Manage Data, Visibility, Profile Shares, Document Shares, Blocked Users,
// Referrals) plus src/pages/ProfileEdit.tsx. Namespaced per source file so
// concurrent edits to other areas don't collide with this file (see
// index.ts for how per-area dictionaries are merged).
export const userSettings = {
  en: {
    // src/pages/UserSettings/UserSettings.tsx
    'userSettingsPage.heading': 'Account',
    'userSettingsPage.tabManageData': 'Manage Data',
    'userSettingsPage.tabVisibility': 'Visibility',
    'userSettingsPage.tabProfileShares': 'Profile Shares',
    'userSettingsPage.tabDocumentShares': 'Document Shares',
    'userSettingsPage.tabBlockedUsers': 'Blocked Users',
    'userSettingsPage.logoutButton': 'Logout',

    // src/pages/UserSettings/BlockedUsers.tsx
    'userSettingsBlockedUsers.title': 'Users you have blocked',

    // src/pages/UserSettings/ManageData.tsx
    'userSettingsManageData.downloadHeading': 'Download your data',
    'userSettingsManageData.downloadDescription':
      'You own your data. Tap the button below to download a copy of your data',
    'userSettingsManageData.downloadButton': 'Download My Data',
    'userSettingsManageData.deleteHeading': 'Delete your data',
    'userSettingsManageData.deleteDescription':
      'Use this only if you want to permanently delete your account & data from our system.',
    'userSettingsManageData.deleteButton': 'Delete My Account',
    'userSettingsManageData.modalTitle': 'Delete Account',
    'userSettingsManageData.modalConfirm':
      'Are you sure you want to delete all your data from the platform?',
    'userSettingsManageData.cancelButton': 'Cancel',
    'userSettingsManageData.submitButton': 'Submit',
    'userSettingsManageData.toastSuccess': 'Success',
    'userSettingsManageData.toastError': 'Error',

    // src/pages/UserSettings/Visibility.tsx
    'userSettingsVisibility.profileVisibilityHeading': 'Profile Visibility',
    'userSettingsVisibility.radioOpenLabel': 'Open (default)',
    'userSettingsVisibility.profileOpenDescription':
      'Your profile can be viewed by anyone who follows your profile link or QR code',
    'userSettingsVisibility.radioRestrictedLabel': 'Restricted',
    'userSettingsVisibility.profileRestrictedDescription':
      'Only users with your permission or temporary secure link can see your profile',
    'userSettingsVisibility.documentsVisibilityHeading':
      'Documents Visibility',
    'userSettingsVisibility.radioFullLabel': 'Full (default)',
    'userSettingsVisibility.documentsFullDescription':
      'Show all Documents to those who can see your profile',
    'userSettingsVisibility.radioIndividualLabel': 'Individual',
    'userSettingsVisibility.documentsIndividualDescription':
      'You need to share each document individually before others can see them',
    'userSettingsVisibility.toastSaved': 'Saved',
    'userSettingsVisibility.toastError': 'Error',

    // src/pages/UserSettings/ProfileShares.tsx
    'userSettingsProfileShares.modalTitle': 'Create a Profile Sharing link',
    'userSettingsProfileShares.modalDescription':
      "Send this link to your trusted contact(s) so they can access your profile when you're in Restricted mode.",
    'userSettingsProfileShares.modalInfo':
      "You'll be able to remove this link any time if you change your mind.",
    'userSettingsProfileShares.expirationLabel': 'Expiration',
    'userSettingsProfileShares.expirationHint':
      'If you set this, this link will only be valid for the given period of time.',
    'userSettingsProfileShares.optionNoExpiration': 'No Expiration',
    'userSettingsProfileShares.optionOneHour': '1 hour',
    'userSettingsProfileShares.optionOneDay': '1 day',
    'userSettingsProfileShares.optionOneWeek': '1 week',
    'userSettingsProfileShares.optionOneMonth': '1 month',
    'userSettingsProfileShares.memoLabel': 'Memo',
    'userSettingsProfileShares.memoHint':
      'Add an optional note so that you remember who you shared this with.',
    'userSettingsProfileShares.memoPlaceholder': 'Add note',
    'userSettingsProfileShares.cancelButton': 'Cancel',
    'userSettingsProfileShares.continueButton': 'Continue',
    'userSettingsProfileShares.tableMemo': 'Memo',
    'userSettingsProfileShares.tableCreationDate': 'Creation Date',
    'userSettingsProfileShares.tableExpiredDate': 'Expired Date',
    'userSettingsProfileShares.tableAction': 'Action',
    'userSettingsProfileShares.noExpirationValue': 'infinite',
    'userSettingsProfileShares.toastSuccess': 'Success',
    'userSettingsProfileShares.toastError': 'Error',
    'userSettingsProfileShares.toastCopied': 'Copied',
    'userSettingsProfileShares.deleteModalTitle': 'Delete Share Link',
    'userSettingsProfileShares.deleteConfirm':
      'Are you sure you want to delete share link?',
    'userSettingsProfileShares.submitButton': 'Submit',
    'userSettingsProfileShares.heading': 'Current Profile Shares',
    'userSettingsProfileShares.description':
      'Listed below are your currently active profile sharing links. You can share or delete them.',
    'userSettingsProfileShares.listOfShares': 'List of shares',
    'userSettingsProfileShares.addNewShare': 'Add New Share',
    'userSettingsProfileShares.emptyState':
      'There are no shares yet, or you can add them by clicking the "Add New Share" button',

    // src/pages/UserSettings/DocumentShares.tsx
    'userSettingsDocumentShares.modalTitle': 'Create a Document Sharing link',
    'userSettingsDocumentShares.modalDescription':
      "Send this link to your trusted contact(s) so they can access your profile when you're in Restricted mode.",
    'userSettingsDocumentShares.modalInfo':
      "You'll be able to remove this link any time if you change your mind.",
    'userSettingsDocumentShares.expirationLabel': 'Expiration',
    'userSettingsDocumentShares.expirationHint':
      'If you set this, this link will only be valid for the given period of time.',
    'userSettingsDocumentShares.optionNoExpiration': 'No Expiration',
    'userSettingsDocumentShares.optionOneHour': '1 hour',
    'userSettingsDocumentShares.optionOneDay': '1 day',
    'userSettingsDocumentShares.optionOneWeek': '1 week',
    'userSettingsDocumentShares.optionOneMonth': '1 month',
    'userSettingsDocumentShares.documentLabel': 'Document',
    'userSettingsDocumentShares.optionChooseDocument': 'Choose Document',
    'userSettingsDocumentShares.memoLabel': 'Memo',
    'userSettingsDocumentShares.memoHint':
      'Add an optional note so that you remember who you shared this with.',
    'userSettingsDocumentShares.memoPlaceholder': 'Add note',
    'userSettingsDocumentShares.cancelButton': 'Cancel',
    'userSettingsDocumentShares.continueButton': 'Continue',
    'userSettingsDocumentShares.tableDocumentName': 'Document Name',
    'userSettingsDocumentShares.tableMemo': 'Memo',
    'userSettingsDocumentShares.tableCreationDate': 'Creation Date',
    'userSettingsDocumentShares.tableExpiredDate': 'Expired Date',
    'userSettingsDocumentShares.tableAction': 'Action',
    'userSettingsDocumentShares.noExpirationValue': 'infinite',
    'userSettingsDocumentShares.toastSuccess': 'Success',
    'userSettingsDocumentShares.toastError': 'Error',
    'userSettingsDocumentShares.toastCopied': 'Copied',
    'userSettingsDocumentShares.deleteModalTitle': 'Delete Share Link',
    'userSettingsDocumentShares.deleteConfirm':
      'Are you sure you want to delete share link?',
    'userSettingsDocumentShares.submitButton': 'Submit',
    'userSettingsDocumentShares.heading': 'Current Document Shares',
    'userSettingsDocumentShares.description':
      'Listed below are your currently active document sharing links. You can share or delete them.',
    'userSettingsDocumentShares.listOfShares': 'List of shares',
    'userSettingsDocumentShares.addNewShare': 'Add New Share',
    'userSettingsDocumentShares.emptyState':
      'There are no shares yet, or you can add them by clicking the "Add New Share" button',

    // src/pages/UserSettings/Referrals.tsx
    'userSettingsReferrals.giftFriends': 'Gift friends',
    'userSettingsReferrals.andReceive': 'and receive',
    'userSettingsReferrals.sendInvite':
      '. Send friends invite with your personal invitation code.',
    'userSettingsReferrals.yourInvitationCode': 'Your invitation code',
    'userSettingsReferrals.orEnterReferral':
      'Or enter your referral code to earn coins',
    'userSettingsReferrals.referralPlaceholder': 'Your referral code',
    'userSettingsReferrals.earnCoinsButton': 'Earn Coins',
    'userSettingsReferrals.toastSuccess': 'Success',
    'userSettingsReferrals.toastError': 'Error',

    // src/pages/ProfileEdit.tsx
    'profileEdit.heading': 'Profile',
    'profileEdit.cancelButton': 'Cancel',
    'profileEdit.saveButton': 'Save',
    'profileEdit.firstNameLabel': 'First Name',
    'profileEdit.firstNamePlaceholder': 'First Name',
    'profileEdit.lastNameLabel': 'Last Name',
    'profileEdit.lastNamePlaceholder': 'Last Name',
    'profileEdit.aboutLabel': 'About',
    'profileEdit.aboutPlaceholder': 'About',
    'profileEdit.toastSuccess': 'Profile updated successfully',
    'profileEdit.toastError': 'An error occurred while saving the profile',
  },
  fr: {
    // src/pages/UserSettings/UserSettings.tsx
    'userSettingsPage.heading': 'Compte',
    'userSettingsPage.tabManageData': 'Gérer les données',
    'userSettingsPage.tabVisibility': 'Visibilité',
    'userSettingsPage.tabProfileShares': 'Partages de profil',
    'userSettingsPage.tabDocumentShares': 'Partages de documents',
    'userSettingsPage.tabBlockedUsers': 'Utilisateurs bloqués',
    'userSettingsPage.logoutButton': 'Déconnexion',

    // src/pages/UserSettings/BlockedUsers.tsx
    'userSettingsBlockedUsers.title': 'Utilisateurs que vous avez bloqués',

    // src/pages/UserSettings/ManageData.tsx
    'userSettingsManageData.downloadHeading': 'Télécharger vos données',
    'userSettingsManageData.downloadDescription':
      'Vous êtes propriétaire de vos données. Appuyez sur le bouton ci-dessous pour télécharger une copie de vos données.',
    'userSettingsManageData.downloadButton': 'Télécharger mes données',
    'userSettingsManageData.deleteHeading': 'Supprimer vos données',
    'userSettingsManageData.deleteDescription':
      "N'utilisez cette option que si vous souhaitez supprimer définitivement votre compte et vos données de notre système.",
    'userSettingsManageData.deleteButton': 'Supprimer mon compte',
    'userSettingsManageData.modalTitle': 'Supprimer le compte',
    'userSettingsManageData.modalConfirm':
      'Êtes-vous sûr de vouloir supprimer toutes vos données de la plateforme ?',
    'userSettingsManageData.cancelButton': 'Annuler',
    'userSettingsManageData.submitButton': 'Confirmer',
    'userSettingsManageData.toastSuccess': 'Succès',
    'userSettingsManageData.toastError': 'Erreur',

    // src/pages/UserSettings/Visibility.tsx
    'userSettingsVisibility.profileVisibilityHeading': 'Visibilité du profil',
    'userSettingsVisibility.radioOpenLabel': 'Ouvert (par défaut)',
    'userSettingsVisibility.profileOpenDescription':
      'Votre profil peut être consulté par toute personne qui suit votre lien de profil ou votre code QR.',
    'userSettingsVisibility.radioRestrictedLabel': 'Restreint',
    'userSettingsVisibility.profileRestrictedDescription':
      "Seuls les utilisateurs disposant de votre autorisation ou d'un lien sécurisé temporaire peuvent voir votre profil.",
    'userSettingsVisibility.documentsVisibilityHeading':
      'Visibilité des documents',
    'userSettingsVisibility.radioFullLabel': 'Complet (par défaut)',
    'userSettingsVisibility.documentsFullDescription':
      'Afficher tous les documents aux personnes qui peuvent voir votre profil.',
    'userSettingsVisibility.radioIndividualLabel': 'Individuel',
    'userSettingsVisibility.documentsIndividualDescription':
      "Vous devez partager chaque document individuellement avant que d'autres personnes puissent les voir.",
    'userSettingsVisibility.toastSaved': 'Enregistré',
    'userSettingsVisibility.toastError': 'Erreur',

    // src/pages/UserSettings/ProfileShares.tsx
    'userSettingsProfileShares.modalTitle':
      'Créer un lien de partage de profil',
    'userSettingsProfileShares.modalDescription':
      "Envoyez ce lien à vos contacts de confiance afin qu'ils puissent accéder à votre profil lorsque vous êtes en mode Restreint.",
    'userSettingsProfileShares.modalInfo':
      "Vous pourrez supprimer ce lien à tout moment si vous changez d'avis.",
    'userSettingsProfileShares.expirationLabel': 'Expiration',
    'userSettingsProfileShares.expirationHint':
      'Si vous définissez cette option, ce lien ne sera valable que pour la période indiquée.',
    'userSettingsProfileShares.optionNoExpiration': 'Sans expiration',
    'userSettingsProfileShares.optionOneHour': '1 heure',
    'userSettingsProfileShares.optionOneDay': '1 jour',
    'userSettingsProfileShares.optionOneWeek': '1 semaine',
    'userSettingsProfileShares.optionOneMonth': '1 mois',
    'userSettingsProfileShares.memoLabel': 'Mémo',
    'userSettingsProfileShares.memoHint':
      "Ajoutez une note facultative pour vous rappeler avec qui vous avez partagé ce lien.",
    'userSettingsProfileShares.memoPlaceholder': 'Ajouter une note',
    'userSettingsProfileShares.cancelButton': 'Annuler',
    'userSettingsProfileShares.continueButton': 'Continuer',
    'userSettingsProfileShares.tableMemo': 'Mémo',
    'userSettingsProfileShares.tableCreationDate': 'Date de création',
    'userSettingsProfileShares.tableExpiredDate': "Date d'expiration",
    'userSettingsProfileShares.tableAction': 'Action',
    'userSettingsProfileShares.noExpirationValue': 'illimité',
    'userSettingsProfileShares.toastSuccess': 'Succès',
    'userSettingsProfileShares.toastError': 'Erreur',
    'userSettingsProfileShares.toastCopied': 'Copié',
    'userSettingsProfileShares.deleteModalTitle':
      'Supprimer le lien de partage',
    'userSettingsProfileShares.deleteConfirm':
      'Êtes-vous sûr de vouloir supprimer ce lien de partage ?',
    'userSettingsProfileShares.submitButton': 'Confirmer',
    'userSettingsProfileShares.heading': 'Partages de profil actuels',
    'userSettingsProfileShares.description':
      'Ci-dessous se trouvent vos liens de partage de profil actuellement actifs. Vous pouvez les partager ou les supprimer.',
    'userSettingsProfileShares.listOfShares': 'Liste des partages',
    'userSettingsProfileShares.addNewShare': 'Ajouter un partage',
    'userSettingsProfileShares.emptyState':
      "Il n'y a pas encore de partages, vous pouvez en ajouter en cliquant sur le bouton « Ajouter un partage ».",

    // src/pages/UserSettings/DocumentShares.tsx
    'userSettingsDocumentShares.modalTitle':
      'Créer un lien de partage de document',
    'userSettingsDocumentShares.modalDescription':
      "Envoyez ce lien à vos contacts de confiance afin qu'ils puissent accéder à votre profil lorsque vous êtes en mode Restreint.",
    'userSettingsDocumentShares.modalInfo':
      "Vous pourrez supprimer ce lien à tout moment si vous changez d'avis.",
    'userSettingsDocumentShares.expirationLabel': 'Expiration',
    'userSettingsDocumentShares.expirationHint':
      'Si vous définissez cette option, ce lien ne sera valable que pour la période indiquée.',
    'userSettingsDocumentShares.optionNoExpiration': 'Sans expiration',
    'userSettingsDocumentShares.optionOneHour': '1 heure',
    'userSettingsDocumentShares.optionOneDay': '1 jour',
    'userSettingsDocumentShares.optionOneWeek': '1 semaine',
    'userSettingsDocumentShares.optionOneMonth': '1 mois',
    'userSettingsDocumentShares.documentLabel': 'Document',
    'userSettingsDocumentShares.optionChooseDocument': 'Choisir un document',
    'userSettingsDocumentShares.memoLabel': 'Mémo',
    'userSettingsDocumentShares.memoHint':
      "Ajoutez une note facultative pour vous rappeler avec qui vous avez partagé ce lien.",
    'userSettingsDocumentShares.memoPlaceholder': 'Ajouter une note',
    'userSettingsDocumentShares.cancelButton': 'Annuler',
    'userSettingsDocumentShares.continueButton': 'Continuer',
    'userSettingsDocumentShares.tableDocumentName': 'Nom du document',
    'userSettingsDocumentShares.tableMemo': 'Mémo',
    'userSettingsDocumentShares.tableCreationDate': 'Date de création',
    'userSettingsDocumentShares.tableExpiredDate': "Date d'expiration",
    'userSettingsDocumentShares.tableAction': 'Action',
    'userSettingsDocumentShares.noExpirationValue': 'illimité',
    'userSettingsDocumentShares.toastSuccess': 'Succès',
    'userSettingsDocumentShares.toastError': 'Erreur',
    'userSettingsDocumentShares.toastCopied': 'Copié',
    'userSettingsDocumentShares.deleteModalTitle':
      'Supprimer le lien de partage',
    'userSettingsDocumentShares.deleteConfirm':
      'Êtes-vous sûr de vouloir supprimer ce lien de partage ?',
    'userSettingsDocumentShares.submitButton': 'Confirmer',
    'userSettingsDocumentShares.heading': 'Partages de documents actuels',
    'userSettingsDocumentShares.description':
      'Ci-dessous se trouvent vos liens de partage de document actuellement actifs. Vous pouvez les partager ou les supprimer.',
    'userSettingsDocumentShares.listOfShares': 'Liste des partages',
    'userSettingsDocumentShares.addNewShare': 'Ajouter un partage',
    'userSettingsDocumentShares.emptyState':
      "Il n'y a pas encore de partages, vous pouvez en ajouter en cliquant sur le bouton « Ajouter un partage ».",

    // src/pages/UserSettings/Referrals.tsx
    'userSettingsReferrals.giftFriends': 'Offrez à vos amis',
    'userSettingsReferrals.andReceive': 'et recevez',
    'userSettingsReferrals.sendInvite':
      ". Invitez vos amis avec votre code d'invitation personnel.",
    'userSettingsReferrals.yourInvitationCode': "Votre code d'invitation",
    'userSettingsReferrals.orEnterReferral':
      'Ou saisissez votre code de parrainage pour gagner des pièces',
    'userSettingsReferrals.referralPlaceholder': 'Votre code de parrainage',
    'userSettingsReferrals.earnCoinsButton': 'Gagner des pièces',
    'userSettingsReferrals.toastSuccess': 'Succès',
    'userSettingsReferrals.toastError': 'Erreur',

    // src/pages/ProfileEdit.tsx
    'profileEdit.heading': 'Profil',
    'profileEdit.cancelButton': 'Annuler',
    'profileEdit.saveButton': 'Enregistrer',
    'profileEdit.firstNameLabel': 'Prénom',
    'profileEdit.firstNamePlaceholder': 'Prénom',
    'profileEdit.lastNameLabel': 'Nom',
    'profileEdit.lastNamePlaceholder': 'Nom',
    'profileEdit.aboutLabel': 'À propos',
    'profileEdit.aboutPlaceholder': 'À propos',
    'profileEdit.toastSuccess': 'Profil mis à jour avec succès',
    'profileEdit.toastError':
      "Une erreur s'est produite lors de l'enregistrement du profil",
  },
  es: {
    // src/pages/UserSettings/UserSettings.tsx
    'userSettingsPage.heading': 'Cuenta',
    'userSettingsPage.tabManageData': 'Gestionar datos',
    'userSettingsPage.tabVisibility': 'Visibilidad',
    'userSettingsPage.tabProfileShares': 'Perfiles compartidos',
    'userSettingsPage.tabDocumentShares': 'Documentos compartidos',
    'userSettingsPage.tabBlockedUsers': 'Usuarios bloqueados',
    'userSettingsPage.logoutButton': 'Cerrar sesión',

    // src/pages/UserSettings/BlockedUsers.tsx
    'userSettingsBlockedUsers.title': 'Usuarios que has bloqueado',

    // src/pages/UserSettings/ManageData.tsx
    'userSettingsManageData.downloadHeading': 'Descarga tus datos',
    'userSettingsManageData.downloadDescription':
      'Tus datos te pertenecen. Toca el botón de abajo para descargar una copia de tus datos.',
    'userSettingsManageData.downloadButton': 'Descargar mis datos',
    'userSettingsManageData.deleteHeading': 'Elimina tus datos',
    'userSettingsManageData.deleteDescription':
      'Usa esta opción solo si deseas eliminar permanentemente tu cuenta y tus datos de nuestro sistema.',
    'userSettingsManageData.deleteButton': 'Eliminar mi cuenta',
    'userSettingsManageData.modalTitle': 'Eliminar cuenta',
    'userSettingsManageData.modalConfirm':
      '¿Estás seguro de que quieres eliminar todos tus datos de la plataforma?',
    'userSettingsManageData.cancelButton': 'Cancelar',
    'userSettingsManageData.submitButton': 'Confirmar',
    'userSettingsManageData.toastSuccess': 'Éxito',
    'userSettingsManageData.toastError': 'Error',

    // src/pages/UserSettings/Visibility.tsx
    'userSettingsVisibility.profileVisibilityHeading':
      'Visibilidad del perfil',
    'userSettingsVisibility.radioOpenLabel': 'Abierto (predeterminado)',
    'userSettingsVisibility.profileOpenDescription':
      'Tu perfil puede ser visto por cualquier persona que siga tu enlace de perfil o código QR.',
    'userSettingsVisibility.radioRestrictedLabel': 'Restringido',
    'userSettingsVisibility.profileRestrictedDescription':
      'Solo los usuarios con tu permiso o un enlace seguro temporal pueden ver tu perfil.',
    'userSettingsVisibility.documentsVisibilityHeading':
      'Visibilidad de documentos',
    'userSettingsVisibility.radioFullLabel': 'Completo (predeterminado)',
    'userSettingsVisibility.documentsFullDescription':
      'Mostrar todos los documentos a quienes pueden ver tu perfil.',
    'userSettingsVisibility.radioIndividualLabel': 'Individual',
    'userSettingsVisibility.documentsIndividualDescription':
      'Debes compartir cada documento individualmente antes de que otras personas puedan verlos.',
    'userSettingsVisibility.toastSaved': 'Guardado',
    'userSettingsVisibility.toastError': 'Error',

    // src/pages/UserSettings/ProfileShares.tsx
    'userSettingsProfileShares.modalTitle':
      'Crear un enlace para compartir perfil',
    'userSettingsProfileShares.modalDescription':
      'Envía este enlace a tus contactos de confianza para que puedan acceder a tu perfil cuando estés en modo Restringido.',
    'userSettingsProfileShares.modalInfo':
      'Podrás eliminar este enlace en cualquier momento si cambias de opinión.',
    'userSettingsProfileShares.expirationLabel': 'Caducidad',
    'userSettingsProfileShares.expirationHint':
      'Si configuras esto, este enlace solo será válido durante el período de tiempo indicado.',
    'userSettingsProfileShares.optionNoExpiration': 'Sin caducidad',
    'userSettingsProfileShares.optionOneHour': '1 hora',
    'userSettingsProfileShares.optionOneDay': '1 día',
    'userSettingsProfileShares.optionOneWeek': '1 semana',
    'userSettingsProfileShares.optionOneMonth': '1 mes',
    'userSettingsProfileShares.memoLabel': 'Nota',
    'userSettingsProfileShares.memoHint':
      'Añade una nota opcional para recordar con quién compartiste esto.',
    'userSettingsProfileShares.memoPlaceholder': 'Añadir nota',
    'userSettingsProfileShares.cancelButton': 'Cancelar',
    'userSettingsProfileShares.continueButton': 'Continuar',
    'userSettingsProfileShares.tableMemo': 'Nota',
    'userSettingsProfileShares.tableCreationDate': 'Fecha de creación',
    'userSettingsProfileShares.tableExpiredDate': 'Fecha de caducidad',
    'userSettingsProfileShares.tableAction': 'Acción',
    'userSettingsProfileShares.noExpirationValue': 'ilimitado',
    'userSettingsProfileShares.toastSuccess': 'Éxito',
    'userSettingsProfileShares.toastError': 'Error',
    'userSettingsProfileShares.toastCopied': 'Copiado',
    'userSettingsProfileShares.deleteModalTitle':
      'Eliminar enlace de compartición',
    'userSettingsProfileShares.deleteConfirm':
      '¿Estás seguro de que quieres eliminar este enlace de compartición?',
    'userSettingsProfileShares.submitButton': 'Confirmar',
    'userSettingsProfileShares.heading': 'Perfiles compartidos actuales',
    'userSettingsProfileShares.description':
      'A continuación se muestran tus enlaces de perfil compartidos actualmente activos. Puedes compartirlos o eliminarlos.',
    'userSettingsProfileShares.listOfShares': 'Lista de comparticiones',
    'userSettingsProfileShares.addNewShare': 'Añadir compartición',
    'userSettingsProfileShares.emptyState':
      'Todavía no hay comparticiones, puedes añadir una haciendo clic en el botón "Añadir compartición".',

    // src/pages/UserSettings/DocumentShares.tsx
    'userSettingsDocumentShares.modalTitle':
      'Crear un enlace para compartir documento',
    'userSettingsDocumentShares.modalDescription':
      'Envía este enlace a tus contactos de confianza para que puedan acceder a tu perfil cuando estés en modo Restringido.',
    'userSettingsDocumentShares.modalInfo':
      'Podrás eliminar este enlace en cualquier momento si cambias de opinión.',
    'userSettingsDocumentShares.expirationLabel': 'Caducidad',
    'userSettingsDocumentShares.expirationHint':
      'Si configuras esto, este enlace solo será válido durante el período de tiempo indicado.',
    'userSettingsDocumentShares.optionNoExpiration': 'Sin caducidad',
    'userSettingsDocumentShares.optionOneHour': '1 hora',
    'userSettingsDocumentShares.optionOneDay': '1 día',
    'userSettingsDocumentShares.optionOneWeek': '1 semana',
    'userSettingsDocumentShares.optionOneMonth': '1 mes',
    'userSettingsDocumentShares.documentLabel': 'Documento',
    'userSettingsDocumentShares.optionChooseDocument': 'Elegir documento',
    'userSettingsDocumentShares.memoLabel': 'Nota',
    'userSettingsDocumentShares.memoHint':
      'Añade una nota opcional para recordar con quién compartiste esto.',
    'userSettingsDocumentShares.memoPlaceholder': 'Añadir nota',
    'userSettingsDocumentShares.cancelButton': 'Cancelar',
    'userSettingsDocumentShares.continueButton': 'Continuar',
    'userSettingsDocumentShares.tableDocumentName': 'Nombre del documento',
    'userSettingsDocumentShares.tableMemo': 'Nota',
    'userSettingsDocumentShares.tableCreationDate': 'Fecha de creación',
    'userSettingsDocumentShares.tableExpiredDate': 'Fecha de caducidad',
    'userSettingsDocumentShares.tableAction': 'Acción',
    'userSettingsDocumentShares.noExpirationValue': 'ilimitado',
    'userSettingsDocumentShares.toastSuccess': 'Éxito',
    'userSettingsDocumentShares.toastError': 'Error',
    'userSettingsDocumentShares.toastCopied': 'Copiado',
    'userSettingsDocumentShares.deleteModalTitle':
      'Eliminar enlace de compartición',
    'userSettingsDocumentShares.deleteConfirm':
      '¿Estás seguro de que quieres eliminar este enlace de compartición?',
    'userSettingsDocumentShares.submitButton': 'Confirmar',
    'userSettingsDocumentShares.heading': 'Documentos compartidos actuales',
    'userSettingsDocumentShares.description':
      'A continuación se muestran tus enlaces de documentos compartidos actualmente activos. Puedes compartirlos o eliminarlos.',
    'userSettingsDocumentShares.listOfShares': 'Lista de comparticiones',
    'userSettingsDocumentShares.addNewShare': 'Añadir compartición',
    'userSettingsDocumentShares.emptyState':
      'Todavía no hay comparticiones, puedes añadir una haciendo clic en el botón "Añadir compartición".',

    // src/pages/UserSettings/Referrals.tsx
    'userSettingsReferrals.giftFriends': 'Regala a tus amigos',
    'userSettingsReferrals.andReceive': 'y recibe',
    'userSettingsReferrals.sendInvite':
      '. Invita a tus amigos con tu código de invitación personal.',
    'userSettingsReferrals.yourInvitationCode': 'Tu código de invitación',
    'userSettingsReferrals.orEnterReferral':
      'O introduce tu código de referido para ganar monedas',
    'userSettingsReferrals.referralPlaceholder': 'Tu código de referido',
    'userSettingsReferrals.earnCoinsButton': 'Ganar monedas',
    'userSettingsReferrals.toastSuccess': 'Éxito',
    'userSettingsReferrals.toastError': 'Error',

    // src/pages/ProfileEdit.tsx
    'profileEdit.heading': 'Perfil',
    'profileEdit.cancelButton': 'Cancelar',
    'profileEdit.saveButton': 'Guardar',
    'profileEdit.firstNameLabel': 'Nombre',
    'profileEdit.firstNamePlaceholder': 'Nombre',
    'profileEdit.lastNameLabel': 'Apellido',
    'profileEdit.lastNamePlaceholder': 'Apellido',
    'profileEdit.aboutLabel': 'Acerca de',
    'profileEdit.aboutPlaceholder': 'Acerca de',
    'profileEdit.toastSuccess': 'Perfil actualizado correctamente',
    'profileEdit.toastError': 'Se produjo un error al guardar el perfil',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
