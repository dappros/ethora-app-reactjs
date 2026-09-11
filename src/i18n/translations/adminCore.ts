import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Admin/back-office surfaces: Admin shell (support footer), Apps list +
// per-App shell, Agents list + per-Agent settings, Billing, App Statistics,
// and App Users. Namespaced per source file (adminShell / adminApps /
// adminApp / adminAgents / adminBilling / appStatistics / appUsers /
// agentSettings) so keys never collide with other areas of the app that
// live in their own sibling files under src/i18n/translations/.
//
// A few strings that are also used as internal identifiers (tab names
// matched against URL search params, time-period values switched on in
// date-math, etc.) are intentionally NOT swapped at the data-source level -
// only the rendered label is looked up through these keys via a small
// lookup map in the component, so persisted/compared values stay in their
// original English form and behaviour is unchanged.
export const adminCore = {
  en: {
    // Admin.tsx - shared support footer shown under every admin sub-page.
    'adminShell.needAssistance': 'Need assistance?',
    'adminShell.helpSupportPage': 'Help & Support page',
    'adminShell.or': 'or',
    'adminShell.bookACall': 'Book a Call',

    // AdminApps.tsx
    'adminApps.title': 'Apps',
    'adminApps.tabActive': 'Active',
    'adminApps.tabArchived': 'Archived',
    'adminApps.sortDisplayName': 'Display Name',
    'adminApps.sortUsers': 'Users',
    'adminApps.sortSessions': 'Sessions',
    'adminApps.sortApi': 'API',
    'adminApps.sortAi': 'AI',
    'adminApps.sortFiles': 'Files',
    'adminApps.sortTransactions': 'Transactions',
    'adminApps.sortDate': 'Date',
    'adminApps.sortChats': 'Chats',
    'adminApps.createApp': 'Create App',
    'adminApps.emptyArchived':
      'No archived apps. Archived apps appear here so you can restore them or permanently delete their data.',
    'adminApps.addAnotherApp': 'Add another app',
    'adminApps.addAnotherAppDesc':
      'Start a fresh app, or bring one in from a JSON / ZIP bundle.',
    'adminApps.importFromBundle': 'or import from a bundle',
    'adminApps.importTitle':
      'Import an app from a previously-exported JSON or ZIP bundle',

    // AdminApp.tsx - per-App segmented nav.
    'adminApp.tabUsers': 'Users',
    'adminApp.tabSettings': 'Settings',
    'adminApp.tabStatistics': 'Statistics',
    'adminApp.tabChats': 'Chats',

    // AdminAgents.tsx
    'adminAgents.title': 'Agents',
    'adminAgents.filterPlaceholder': 'Filter (name, address, app, bio)',
    'adminAgents.importAgent': 'Import Agent',
    'adminAgents.importAgentTitle':
      'Import an agent from a previously-exported JSON or ZIP bundle',
    'adminAgents.newAgent': 'New Agent',
    'adminAgents.description':
      'Agents are owned by your account and can be deployed into any of your Apps.',
    'adminAgents.showLabel': 'Show:',
    'adminAgents.myAgents': 'My agents',
    'adminAgents.publicAgents': 'Public agents',
    'adminAgents.privateOtherTenants': 'Private (other tenants)',
    'adminAgents.superadminBadge': 'superadmin',
    'adminAgents.loading': 'Loading...',
    'adminAgents.myAgentsDesc':
      'Created by you. You can edit, deploy across your Apps, change visibility, or delete.',
    'adminAgents.publicAgentsTitle': 'Public agents (from other tenants)',
    'adminAgents.publicAgentsDesc':
      'Marked public by their owners on this server. Read-only, clone to your agents to customise.',
    'adminAgents.privateOtherDesc':
      'Superadmin-only view of private agents owned by other tenants. Read-only.',
    'adminAgents.emptyOwned':
      'You haven\'t created any agents yet. Click "+ New Agent" above.',
    'adminAgents.emptyPublic': 'No public agents from other tenants right now.',
    'adminAgents.emptyPrivateOther':
      'No private agents from other tenants right now.',
    'adminAgents.agentSingular': 'agent',
    'adminAgents.agentPlural': 'agents',
    'adminAgents.showing': 'Showing',
    'adminAgents.of': 'of',
    'adminAgents.showAll': 'show all',
    'adminAgents.importAgentHelperText':
      "Pick a JSON or ZIP file exported from another Ethora environment, or paste the JSON directly. The new agent will be created under your account with a fresh address, set to 'private' visibility.",
    'adminAgents.createModalTitle': 'Create new Agent',
    'adminAgents.displayNameLabel': 'Display name',
    'adminAgents.bioLabel': 'Bio (short)',
    'adminAgents.initialPromptLabel': 'Initial prompt',
    'adminAgents.visibilityLabel': 'Visibility',
    'adminAgents.visibilityPrivate': 'Private',
    'adminAgents.visibilityUnlistedInviteByAddress':
      'Unlisted (invite by address)',
    'adminAgents.visibilityPublic': 'Public',
    'adminAgents.publicVisibilityWarningTitle': 'Public visibility:',
    'adminAgents.publicVisibilityWarningBody':
      'this agent will appear in the "Public agents" section for every other tenant on this Ethora server. They can view its persona, prompt, and clone it as their own. Pick Public only when the agent is intended to be universally useful (e.g. a generic Support Agent or a published persona for the community). For agents you\'re building for your own brand, business, or website, leave this as Private.',
    'adminAgents.cancel': 'Cancel',
    'adminAgents.creating': 'Creating...',
    'adminAgents.create': 'Create',
    'adminAgents.updatedLabel': 'Updated: ',
    'adminAgents.createdLabel': 'Created: ',
    'adminAgents.ragLabel': 'RAG: ',
    'adminAgents.deployedLabel': 'Deployed: ',
    'adminAgents.appSingular': 'app',
    'adminAgents.appPlural': 'apps',
    'adminAgents.edit': 'Edit',
    'adminAgents.view': 'View',
    'adminAgents.cloneToMyAgents': 'Clone to my agents',
    'adminAgents.exportJson': 'Export JSON',
    'adminAgents.exportZip': 'Export ZIP',
    'adminAgents.delete': 'Delete',
    'adminAgents.deleteConfirmQuestion': 'Delete',
    'adminAgents.deleteConfirmDetail': 'Disables all its BotInstances.',
    'adminAgents.agentDeletedToast': 'Agent deleted',
    'adminAgents.deleteFailedPrefix': 'Delete failed:',
    'adminAgents.clonedToastPrefix': 'Cloned',
    'adminAgents.clonedToastSuffix': 'to your agents',
    'adminAgents.cloneFailedPrefix': 'Clone failed:',
    'adminAgents.exportedToastPrefix': 'Exported',
    'adminAgents.exportFailedPrefix': 'Export failed:',
    'adminAgents.loadAgentsFailedPrefix': 'Failed to load agents:',
    'adminAgents.loadPrivateAgentsFailedPrefix':
      'Failed to load private agents:',
    'adminAgents.createFailedPrefix': 'Create failed:',

    // AdminBilling.tsx
    'adminBilling.title': 'Billing',
    'adminBilling.freePlanHeading': "You're on a Free plan",
    'adminBilling.freePlanBody':
      "You're welcome to use our generous Free plan for as long as it fits your project.",
    'adminBilling.enterpriseHeading':
      'Need a dedicated server, enterprise-grade SLA, or server-side customizations?',
    'adminBilling.enterpriseBody':
      "Let's talk through your requirements and find the right fit.",
    'adminBilling.bookACall': 'Book a Call',

    // AppStatistics.tsx
    'appStatistics.tabUsers': 'Users',
    'appStatistics.tabSessions': 'Sessions',
    'appStatistics.tabChats': 'Chats',
    'appStatistics.tabApiCalls': 'API calls',
    'appStatistics.tabAssets': 'Assets',
    'appStatistics.tabTransactions': 'Transactions',
    'appStatistics.tabFiles': 'Files',
    'appStatistics.period24h': '24 hours',
    'appStatistics.period7d': '7 days',
    'appStatistics.period30d': '30 days',
    'appStatistics.periodSelect': 'Select period',
    'appStatistics.heading': 'Statistics',
    'appStatistics.exportCsv': 'Export CSV',
    'appStatistics.cancel': 'Cancel',
    'appStatistics.apply': 'Apply',
    'appStatistics.forPrefix': 'For',
    'appStatistics.downloadAlt': 'Download',

    // AppUsers.tsx
    'appUsers.title': 'Users',
    'appUsers.tabActive': 'Active',
    'appUsers.tabArchived': 'Archived',
    'appUsers.sortCreationDate': 'Creation Date',
    'appUsers.sortFirstName': 'First Name',
    'appUsers.sortLastName': 'Last Name',
    'appUsers.sortEmail': 'Email',
    'appUsers.addUser': 'Add User',
    'appUsers.emptyState':
      "There are no users yet, or you can add them by clicking the 'Add User' button",
    'appUsers.colFirstName': 'First Name',
    'appUsers.colLastName': 'Last Name',
    'appUsers.colEmail': 'Email',
    'appUsers.colTags': 'Tags',
    'appUsers.colCreationSeenDate': 'Creation Date/Seen Date',
    'appUsers.colAuthMethod': 'Auth method',
    'appUsers.colAttribution': 'Attribution',
    'appUsers.colActions': 'Actions',
    'appUsers.restore': 'Restore',
    'appUsers.restoreRowTitle':
      'Restore this user (clears archive status, login re-enabled)',
    'appUsers.permissionsTitle': 'Permissions',
    'appUsers.paginationTo': 'to',
    'appUsers.paginationOf': 'of',
    'appUsers.showLabel': 'show',
    'appUsers.usersWord': 'users',
    'appUsers.selectedPrefix': 'Selected',
    'appUsers.manageTags': 'Manage Tags',
    'appUsers.resetPassword': 'Reset Password',
    'appUsers.archive': 'Archive',
    'appUsers.archiveTitle':
      'Archive these users (reversible). Login is blocked but data is retained.',
    'appUsers.hardDelete': 'Hard delete',
    'appUsers.hardDeleteTitle': 'Permanently delete (irreversible)',
    'appUsers.tagsModalTitle': 'Tags',
    'appUsers.addTagsSubtext': 'Add Tags',
    'appUsers.tagsPlaceholder': 'Tags',
    'appUsers.cancel': 'Cancel',
    'appUsers.submit': 'Submit',
    'appUsers.passwordResetTitle': 'Password Reset',
    'appUsers.passwordResetConfirmPrefix':
      'Are you sure you want to force a password reset for',
    'appUsers.userWordSingular': 'user',
    'appUsers.userWordPlural': 'users',
    'appUsers.archiveConfirmTitlePrefix': 'Archive',
    'appUsers.archiveConfirmMessage':
      'These accounts will be hidden and their owners will not be able to log in, but all of their data (chat history, files, memberships) is retained. You can restore them later from the Archived tab.',
    'appUsers.hardDeleteConfirmTitlePrefix': 'Permanently delete',
    'appUsers.hardDeleteConfirmMessage':
      "This irreversibly deletes the selected users along with their wallets, files, XMPP accounts, chat memberships, and any rooms they own (along with those rooms' messages). This cannot be undone.",
    'appUsers.hardDeleteConfirmLabel': 'Yes, hard delete',
    'appUsers.tagsAppliedToast': 'Tags applied successfully!',
    'appUsers.userCreatedToast': 'User created successfully!',
    'appUsers.passwordResetToast': 'Password reset successfully!',
    'appUsers.userCapWord': 'User',
    'appUsers.usersCapWord': 'Users',
    'appUsers.archivedSuccessSuffix': 'archived successfully',
    'appUsers.deletedPermanentlySuffix': 'permanently deleted',
    'appUsers.restoredSuccessSuffix': 'restored successfully',
    'appUsers.archiveFailedPrefix': 'Archive failed:',
    'appUsers.hardDeleteFailedPrefix': 'Hard delete failed:',
    'appUsers.userRestoredToast': 'User restored',
    'appUsers.restoreFailedPrefix': 'Restore failed:',

    // AgentSettings.tsx
    'agentSettings.loadingAgent': 'Loading agent...',
    'agentSettings.loadAgentFailedPrefix': 'Failed to load agent:',
    'agentSettings.agentNotFound': 'Agent not found.',
    'agentSettings.readOnlyTitle': 'Read-only.',
    'agentSettings.readOnlyBodyMain':
      "You're viewing an agent owned by another tenant",
    'agentSettings.publicParenthetical': ' (public)',
    'agentSettings.readOnlyBodyRest':
      '. Editing, deleting, and inspecting per-room runtime state are disabled.',
    'agentSettings.readOnlyCloneHint':
      'Use the Clone to my agents action on the Agents list page to create your own editable copy.',
    'agentSettings.visibilityHeading': 'Visibility',
    'agentSettings.visibilityDescription':
      'Controls who can see this agent on this Ethora server.',
    'agentSettings.visibilityPrivateLabel': 'Private',
    'agentSettings.visibilityUnlistedLabel': 'Unlisted',
    'agentSettings.visibilityPublicLabel': 'Public',
    'agentSettings.visibilityPrivateDesc':
      'Only you can see this agent. Recommended for agents built for your own business, app, or website.',
    'agentSettings.visibilityUnlistedDesc':
      "Not listed publicly, but discoverable by other tenants who know the agent's address. Useful for sharing with specific partners without making it broadcast-visible.",
    'agentSettings.visibilityPublicDesc':
      'Listed for every tenant on this Ethora server. They can view the persona and clone it. Pick this only when the agent is intended to be universally useful (e.g. a generic Support Agent or a published persona for the community).',
    'agentSettings.visibilityNotEditableMain':
      "You're viewing an agent owned by another tenant. Only the owner can change its visibility.",
    'agentSettings.visibilityNotEditableCloneHint':
      'Use Clone to my agents on the Agents list to create your own editable copy.',
    'agentSettings.superadminModerationTitle': 'Superadmin moderation:',
    'agentSettings.superadminModerationBody':
      "you can flip this agent's visibility on behalf of its owner. Use this to take down public agents that contain spam, abuse, or otherwise breach platform policy. Setting Private immediately removes it from every other tenant's Public agents list. Owner-facing notifications are not sent, coordinate out-of-band when appropriate.",
    'agentSettings.visibilitySetToastPrefix': 'Visibility set to',
    'agentSettings.failedPrefix': 'Failed:',
    'agentSettings.backToAgents': 'Agents',
    'agentSettings.stop': 'Stop',
    'agentSettings.start': 'Start',
    'agentSettings.botStatusToastPrefix': 'Bot',
    'agentSettings.statusOn': 'on',
    'agentSettings.statusOff': 'off',
    'agentSettings.toggleStatusTitlePrefix':
      "Toggle status of this Agent's BotInstance in app",
    'agentSettings.sectionIdentity': 'Identity',
    'agentSettings.sectionKnowledge': 'Knowledge',
    'agentSettings.sectionBehaviour': 'Behaviour',
    'agentSettings.sectionActivity': 'Activity',
    'agentSettings.sectionSharing': 'Sharing',
    'agentSettings.tabPersona': 'Persona',
    'agentSettings.tabContext': 'Context',
    'agentSettings.tabWebIndex': 'Web Index',
    'agentSettings.tabDocsIndex': 'Docs Index',
    'agentSettings.tabSoulMd': 'SOUL.MD',
    'agentSettings.tabHeartbeat': 'Heartbeat',
    'agentSettings.tabFlows': 'Flows',
    'agentSettings.tabChatsIndex': 'Chats Index',
    'agentSettings.tabVisibility': 'Visibility',
  },
  fr: {
    'adminShell.needAssistance': "Besoin d'aide ?",
    'adminShell.helpSupportPage': "Page d'aide et de support",
    'adminShell.or': 'ou',
    'adminShell.bookACall': 'Réserver un appel',

    'adminApps.title': 'Applications',
    'adminApps.tabActive': 'Actives',
    'adminApps.tabArchived': 'Archivées',
    'adminApps.sortDisplayName': "Nom d'affichage",
    'adminApps.sortUsers': 'Utilisateurs',
    'adminApps.sortSessions': 'Sessions',
    'adminApps.sortApi': 'API',
    'adminApps.sortAi': 'IA',
    'adminApps.sortFiles': 'Fichiers',
    'adminApps.sortTransactions': 'Transactions',
    'adminApps.sortDate': 'Date',
    'adminApps.sortChats': 'Discussions',
    'adminApps.createApp': 'Créer une application',
    'adminApps.emptyArchived':
      'Aucune application archivée. Les applications archivées apparaissent ici afin que vous puissiez les restaurer ou supprimer définitivement leurs données.',
    'adminApps.addAnotherApp': 'Ajouter une autre application',
    'adminApps.addAnotherAppDesc':
      "Créez une nouvelle application, ou importez-en une à partir d'un fichier JSON / ZIP.",
    'adminApps.importFromBundle': 'ou importer depuis un fichier',
    'adminApps.importTitle':
      "Importer une application à partir d'un fichier JSON ou ZIP précédemment exporté",

    'adminApp.tabUsers': 'Utilisateurs',
    'adminApp.tabSettings': 'Paramètres',
    'adminApp.tabStatistics': 'Statistiques',
    'adminApp.tabChats': 'Discussions',

    'adminAgents.title': 'Agents',
    'adminAgents.filterPlaceholder': 'Filtrer (nom, adresse, application, bio)',
    'adminAgents.importAgent': 'Importer un agent',
    'adminAgents.importAgentTitle':
      "Importer un agent à partir d'un fichier JSON ou ZIP précédemment exporté",
    'adminAgents.newAgent': 'Nouvel agent',
    'adminAgents.description':
      "Les agents appartiennent à votre compte et peuvent être déployés dans n'importe laquelle de vos applications.",
    'adminAgents.showLabel': 'Afficher :',
    'adminAgents.myAgents': 'Mes agents',
    'adminAgents.publicAgents': 'Agents publics',
    'adminAgents.privateOtherTenants': 'Privés (autres organisations)',
    'adminAgents.superadminBadge': 'super-administrateur',
    'adminAgents.loading': 'Chargement...',
    'adminAgents.myAgentsDesc':
      'Créés par vous. Vous pouvez les modifier, les déployer sur vos applications, changer leur visibilité ou les supprimer.',
    'adminAgents.publicAgentsTitle': "Agents publics (d'autres organisations)",
    'adminAgents.publicAgentsDesc':
      'Rendus publics par leurs propriétaires sur ce serveur. Lecture seule : clonez-les dans vos agents pour les personnaliser.',
    'adminAgents.privateOtherDesc':
      "Vue réservée aux super-administrateurs des agents privés appartenant à d'autres organisations. Lecture seule.",
    'adminAgents.emptyOwned':
      "Vous n'avez pas encore créé d'agent. Cliquez sur « + Nouvel agent » ci-dessus.",
    'adminAgents.emptyPublic':
      "Aucun agent public provenant d'autres organisations pour le moment.",
    'adminAgents.emptyPrivateOther':
      "Aucun agent privé provenant d'autres organisations pour le moment.",
    'adminAgents.agentSingular': 'agent',
    'adminAgents.agentPlural': 'agents',
    'adminAgents.showing': 'Affichage de',
    'adminAgents.of': 'sur',
    'adminAgents.showAll': 'tout afficher',
    'adminAgents.importAgentHelperText':
      'Choisissez un fichier JSON ou ZIP exporté depuis un autre environnement Ethora, ou collez directement le JSON. Le nouvel agent sera créé sous votre compte avec une nouvelle adresse, en visibilité « privée ».',
    'adminAgents.createModalTitle': 'Créer un nouvel agent',
    'adminAgents.displayNameLabel': "Nom d'affichage",
    'adminAgents.bioLabel': 'Bio (courte)',
    'adminAgents.initialPromptLabel': 'Prompt initial',
    'adminAgents.visibilityLabel': 'Visibilité',
    'adminAgents.visibilityPrivate': 'Privé',
    'adminAgents.visibilityUnlistedInviteByAddress':
      'Non répertorié (invitation par adresse)',
    'adminAgents.visibilityPublic': 'Public',
    'adminAgents.publicVisibilityWarningTitle': 'Visibilité publique :',
    'adminAgents.publicVisibilityWarningBody':
      "cet agent apparaîtra dans la section « Agents publics » pour toutes les autres organisations de ce serveur Ethora. Elles pourront consulter sa personnalité, son prompt, et le cloner pour leur propre usage. Choisissez Public uniquement lorsque l'agent est destiné à être utile de façon universelle (par exemple, un agent de support générique ou une personnalité publiée pour la communauté). Pour les agents que vous créez pour votre propre marque, entreprise ou site web, laissez-le en Privé.",
    'adminAgents.cancel': 'Annuler',
    'adminAgents.creating': 'Création...',
    'adminAgents.create': 'Créer',
    'adminAgents.updatedLabel': 'Mis à jour : ',
    'adminAgents.createdLabel': 'Créé : ',
    'adminAgents.ragLabel': 'RAG : ',
    'adminAgents.deployedLabel': 'Déployé : ',
    'adminAgents.appSingular': 'application',
    'adminAgents.appPlural': 'applications',
    'adminAgents.edit': 'Modifier',
    'adminAgents.view': 'Voir',
    'adminAgents.cloneToMyAgents': 'Cloner dans mes agents',
    'adminAgents.exportJson': 'Exporter en JSON',
    'adminAgents.exportZip': 'Exporter en ZIP',
    'adminAgents.delete': 'Supprimer',
    'adminAgents.deleteConfirmQuestion': 'Supprimer',
    'adminAgents.deleteConfirmDetail': 'Désactive toutes ses instances de bot.',
    'adminAgents.agentDeletedToast': 'Agent supprimé',
    'adminAgents.deleteFailedPrefix': 'Échec de la suppression :',
    'adminAgents.clonedToastPrefix': 'Cloné',
    'adminAgents.clonedToastSuffix': 'dans vos agents',
    'adminAgents.cloneFailedPrefix': 'Échec du clonage :',
    'adminAgents.exportedToastPrefix': 'Exporté',
    'adminAgents.exportFailedPrefix': "Échec de l'export :",
    'adminAgents.loadAgentsFailedPrefix':
      'Échec du chargement des agents :',
    'adminAgents.loadPrivateAgentsFailedPrefix':
      'Échec du chargement des agents privés :',
    'adminAgents.createFailedPrefix': 'Échec de la création :',

    'adminBilling.title': 'Facturation',
    'adminBilling.freePlanHeading': 'Vous êtes sur un plan gratuit',
    'adminBilling.freePlanBody':
      "Vous pouvez utiliser notre généreux plan gratuit aussi longtemps qu'il convient à votre projet.",
    'adminBilling.enterpriseHeading':
      "Besoin d'un serveur dédié, d'un SLA de niveau entreprise ou de personnalisations côté serveur ?",
    'adminBilling.enterpriseBody':
      'Discutons de vos besoins pour trouver la solution la plus adaptée.',
    'adminBilling.bookACall': 'Réserver un appel',

    'appStatistics.tabUsers': 'Utilisateurs',
    'appStatistics.tabSessions': 'Sessions',
    'appStatistics.tabChats': 'Discussions',
    'appStatistics.tabApiCalls': 'Appels API',
    'appStatistics.tabAssets': 'Actifs',
    'appStatistics.tabTransactions': 'Transactions',
    'appStatistics.tabFiles': 'Fichiers',
    'appStatistics.period24h': '24 heures',
    'appStatistics.period7d': '7 jours',
    'appStatistics.period30d': '30 jours',
    'appStatistics.periodSelect': 'Sélectionner une période',
    'appStatistics.heading': 'Statistiques',
    'appStatistics.exportCsv': 'Exporter en CSV',
    'appStatistics.cancel': 'Annuler',
    'appStatistics.apply': 'Appliquer',
    'appStatistics.forPrefix': 'Pour',
    'appStatistics.downloadAlt': 'Télécharger',

    'appUsers.title': 'Utilisateurs',
    'appUsers.tabActive': 'Actifs',
    'appUsers.tabArchived': 'Archivés',
    'appUsers.sortCreationDate': 'Date de création',
    'appUsers.sortFirstName': 'Prénom',
    'appUsers.sortLastName': 'Nom',
    'appUsers.sortEmail': 'E-mail',
    'appUsers.addUser': 'Ajouter un utilisateur',
    'appUsers.emptyState':
      "Il n'y a pas encore d'utilisateurs. Vous pouvez en ajouter en cliquant sur le bouton « Ajouter un utilisateur »",
    'appUsers.colFirstName': 'Prénom',
    'appUsers.colLastName': 'Nom',
    'appUsers.colEmail': 'E-mail',
    'appUsers.colTags': 'Étiquettes',
    'appUsers.colCreationSeenDate':
      'Date de création / Dernière connexion',
    'appUsers.colAuthMethod': "Méthode d'authentification",
    'appUsers.colAttribution': 'Attribution',
    'appUsers.colActions': 'Actions',
    'appUsers.restore': 'Restaurer',
    'appUsers.restoreRowTitle':
      "Restaurer cet utilisateur (annule l'archivage, la connexion est réactivée)",
    'appUsers.permissionsTitle': 'Autorisations',
    'appUsers.paginationTo': 'à',
    'appUsers.paginationOf': 'sur',
    'appUsers.showLabel': 'afficher',
    'appUsers.usersWord': 'utilisateurs',
    'appUsers.selectedPrefix': 'Sélection :',
    'appUsers.manageTags': 'Gérer les étiquettes',
    'appUsers.resetPassword': 'Réinitialiser le mot de passe',
    'appUsers.archive': 'Archiver',
    'appUsers.archiveTitle':
      'Archiver ces utilisateurs (réversible). La connexion est bloquée mais les données sont conservées.',
    'appUsers.hardDelete': 'Suppression définitive',
    'appUsers.hardDeleteTitle': 'Supprimer définitivement (irréversible)',
    'appUsers.tagsModalTitle': 'Étiquettes',
    'appUsers.addTagsSubtext': 'Ajouter des étiquettes',
    'appUsers.tagsPlaceholder': 'Étiquettes',
    'appUsers.cancel': 'Annuler',
    'appUsers.submit': 'Valider',
    'appUsers.passwordResetTitle': 'Réinitialisation du mot de passe',
    'appUsers.passwordResetConfirmPrefix':
      'Voulez-vous vraiment forcer la réinitialisation du mot de passe pour',
    'appUsers.userWordSingular': 'utilisateur',
    'appUsers.userWordPlural': 'utilisateurs',
    'appUsers.archiveConfirmTitlePrefix': 'Archiver',
    'appUsers.archiveConfirmMessage':
      "Ces comptes seront masqués et leurs propriétaires ne pourront plus se connecter, mais toutes leurs données (historique des discussions, fichiers, adhésions) seront conservées. Vous pourrez les restaurer plus tard depuis l'onglet Archivées.",
    'appUsers.hardDeleteConfirmTitlePrefix': 'Supprimer définitivement',
    'appUsers.hardDeleteConfirmMessage':
      "Cette action supprime de manière irréversible les utilisateurs sélectionnés ainsi que leurs portefeuilles, fichiers, comptes XMPP, adhésions aux discussions et les salons dont ils sont propriétaires (avec les messages de ces salons). Cette action est irréversible.",
    'appUsers.hardDeleteConfirmLabel': 'Oui, supprimer définitivement',
    'appUsers.tagsAppliedToast': 'Étiquettes appliquées avec succès !',
    'appUsers.userCreatedToast': 'Utilisateur créé avec succès !',
    'appUsers.passwordResetToast': 'Mot de passe réinitialisé avec succès !',
    'appUsers.userCapWord': 'Utilisateur',
    'appUsers.usersCapWord': 'Utilisateurs',
    'appUsers.archivedSuccessSuffix': 'archivé(s) avec succès',
    'appUsers.deletedPermanentlySuffix': 'supprimé(s) définitivement',
    'appUsers.restoredSuccessSuffix': 'restauré(s) avec succès',
    'appUsers.archiveFailedPrefix': "Échec de l'archivage :",
    'appUsers.hardDeleteFailedPrefix':
      'Échec de la suppression définitive :',
    'appUsers.userRestoredToast': 'Utilisateur restauré',
    'appUsers.restoreFailedPrefix': 'Échec de la restauration :',

    'agentSettings.loadingAgent': "Chargement de l'agent...",
    'agentSettings.loadAgentFailedPrefix': "Échec du chargement de l'agent :",
    'agentSettings.agentNotFound': 'Agent introuvable.',
    'agentSettings.readOnlyTitle': 'Lecture seule.',
    'agentSettings.readOnlyBodyMain':
      'Vous consultez un agent appartenant à une autre organisation',
    'agentSettings.publicParenthetical': ' (public)',
    'agentSettings.readOnlyBodyRest':
      ". La modification, la suppression et l'inspection de l'état d'exécution par salon sont désactivées.",
    'agentSettings.readOnlyCloneHint':
      "Utilisez l'action « Cloner dans mes agents » sur la page de liste des agents pour créer votre propre copie modifiable.",
    'agentSettings.visibilityHeading': 'Visibilité',
    'agentSettings.visibilityDescription':
      'Détermine qui peut voir cet agent sur ce serveur Ethora.',
    'agentSettings.visibilityPrivateLabel': 'Privé',
    'agentSettings.visibilityUnlistedLabel': 'Non répertorié',
    'agentSettings.visibilityPublicLabel': 'Public',
    'agentSettings.visibilityPrivateDesc':
      'Vous seul pouvez voir cet agent. Recommandé pour les agents conçus pour votre propre entreprise, application ou site web.',
    'agentSettings.visibilityUnlistedDesc':
      "Non répertorié publiquement, mais accessible aux autres organisations qui connaissent l'adresse de l'agent. Utile pour le partager avec des partenaires spécifiques sans le rendre visible publiquement.",
    'agentSettings.visibilityPublicDesc':
      "Répertorié pour toutes les organisations de ce serveur Ethora. Elles peuvent consulter la personnalité de l'agent et le cloner. Ne choisissez cette option que si l'agent est destiné à être utile de façon universelle (par exemple, un agent de support générique ou une personnalité publiée pour la communauté).",
    'agentSettings.visibilityNotEditableMain':
      'Vous consultez un agent appartenant à une autre organisation. Seul le propriétaire peut modifier sa visibilité.',
    'agentSettings.visibilityNotEditableCloneHint':
      'Utilisez « Cloner dans mes agents » sur la liste des agents pour créer votre propre copie modifiable.',
    'agentSettings.superadminModerationTitle':
      'Modération super-administrateur :',
    'agentSettings.superadminModerationBody':
      "vous pouvez modifier la visibilité de cet agent au nom de son propriétaire. Utilisez cette fonction pour retirer les agents publics contenant du spam, des abus ou enfreignant autrement la politique de la plateforme. Le passage en Privé le retire immédiatement de la liste des agents publics de toutes les autres organisations. Aucune notification n'est envoyée au propriétaire ; coordonnez-vous en dehors de la plateforme si nécessaire.",
    'agentSettings.visibilitySetToastPrefix': 'Visibilité définie sur',
    'agentSettings.failedPrefix': 'Échec :',
    'agentSettings.backToAgents': 'Agents',
    'agentSettings.stop': 'Arrêter',
    'agentSettings.start': 'Démarrer',
    'agentSettings.botStatusToastPrefix': 'Bot',
    'agentSettings.statusOn': 'activé',
    'agentSettings.statusOff': 'désactivé',
    'agentSettings.toggleStatusTitlePrefix':
      "Basculer l'état de l'instance de bot de cet agent dans l'application",
    'agentSettings.sectionIdentity': 'Identité',
    'agentSettings.sectionKnowledge': 'Connaissances',
    'agentSettings.sectionBehaviour': 'Comportement',
    'agentSettings.sectionActivity': 'Activité',
    'agentSettings.sectionSharing': 'Partage',
    'agentSettings.tabPersona': 'Personnalité',
    'agentSettings.tabContext': 'Contexte',
    'agentSettings.tabWebIndex': 'Index Web',
    'agentSettings.tabDocsIndex': 'Index Documents',
    'agentSettings.tabSoulMd': 'SOUL.MD',
    'agentSettings.tabHeartbeat': 'Signal de vie',
    'agentSettings.tabFlows': 'Parcours',
    'agentSettings.tabChatsIndex': 'Index des discussions',
    'agentSettings.tabVisibility': 'Visibilité',
  },
  es: {
    'adminShell.needAssistance': '¿Necesitas ayuda?',
    'adminShell.helpSupportPage': 'Página de ayuda y soporte',
    'adminShell.or': 'o',
    'adminShell.bookACall': 'Reservar una llamada',

    'adminApps.title': 'Aplicaciones',
    'adminApps.tabActive': 'Activas',
    'adminApps.tabArchived': 'Archivadas',
    'adminApps.sortDisplayName': 'Nombre visible',
    'adminApps.sortUsers': 'Usuarios',
    'adminApps.sortSessions': 'Sesiones',
    'adminApps.sortApi': 'API',
    'adminApps.sortAi': 'IA',
    'adminApps.sortFiles': 'Archivos',
    'adminApps.sortTransactions': 'Transacciones',
    'adminApps.sortDate': 'Fecha',
    'adminApps.sortChats': 'Chats',
    'adminApps.createApp': 'Crear aplicación',
    'adminApps.emptyArchived':
      'No hay aplicaciones archivadas. Las aplicaciones archivadas aparecen aquí para que puedas restaurarlas o eliminar sus datos de forma permanente.',
    'adminApps.addAnotherApp': 'Añadir otra aplicación',
    'adminApps.addAnotherAppDesc':
      'Crea una aplicación nueva o importa una desde un archivo JSON / ZIP.',
    'adminApps.importFromBundle': 'o importar desde un archivo',
    'adminApps.importTitle':
      'Importar una aplicación desde un archivo JSON o ZIP exportado previamente',

    'adminApp.tabUsers': 'Usuarios',
    'adminApp.tabSettings': 'Configuración',
    'adminApp.tabStatistics': 'Estadísticas',
    'adminApp.tabChats': 'Chats',

    'adminAgents.title': 'Agentes',
    'adminAgents.filterPlaceholder':
      'Filtrar (nombre, dirección, aplicación, biografía)',
    'adminAgents.importAgent': 'Importar agente',
    'adminAgents.importAgentTitle':
      'Importar un agente desde un archivo JSON o ZIP exportado previamente',
    'adminAgents.newAgent': 'Nuevo agente',
    'adminAgents.description':
      'Los agentes pertenecen a tu cuenta y se pueden implementar en cualquiera de tus aplicaciones.',
    'adminAgents.showLabel': 'Mostrar:',
    'adminAgents.myAgents': 'Mis agentes',
    'adminAgents.publicAgents': 'Agentes públicos',
    'adminAgents.privateOtherTenants': 'Privados (otras organizaciones)',
    'adminAgents.superadminBadge': 'superadministrador',
    'adminAgents.loading': 'Cargando...',
    'adminAgents.myAgentsDesc':
      'Creados por ti. Puedes editarlos, implementarlos en tus aplicaciones, cambiar su visibilidad o eliminarlos.',
    'adminAgents.publicAgentsTitle': 'Agentes públicos (de otras organizaciones)',
    'adminAgents.publicAgentsDesc':
      'Marcados como públicos por sus propietarios en este servidor. Son de solo lectura: clónalos en tus agentes para personalizarlos.',
    'adminAgents.privateOtherDesc':
      'Vista exclusiva para superadministradores de los agentes privados de otras organizaciones. Solo lectura.',
    'adminAgents.emptyOwned':
      'Todavía no has creado ningún agente. Haz clic en «+ Nuevo agente» arriba.',
    'adminAgents.emptyPublic':
      'Por ahora no hay agentes públicos de otras organizaciones.',
    'adminAgents.emptyPrivateOther':
      'Por ahora no hay agentes privados de otras organizaciones.',
    'adminAgents.agentSingular': 'agente',
    'adminAgents.agentPlural': 'agentes',
    'adminAgents.showing': 'Mostrando',
    'adminAgents.of': 'de',
    'adminAgents.showAll': 'mostrar todo',
    'adminAgents.importAgentHelperText':
      'Elige un archivo JSON o ZIP exportado desde otro entorno de Ethora, o pega el JSON directamente. El nuevo agente se creará en tu cuenta con una dirección nueva, con visibilidad «privada».',
    'adminAgents.createModalTitle': 'Crear nuevo agente',
    'adminAgents.displayNameLabel': 'Nombre visible',
    'adminAgents.bioLabel': 'Biografía (breve)',
    'adminAgents.initialPromptLabel': 'Prompt inicial',
    'adminAgents.visibilityLabel': 'Visibilidad',
    'adminAgents.visibilityPrivate': 'Privado',
    'adminAgents.visibilityUnlistedInviteByAddress':
      'No listado (invitación por dirección)',
    'adminAgents.visibilityPublic': 'Público',
    'adminAgents.publicVisibilityWarningTitle': 'Visibilidad pública:',
    'adminAgents.publicVisibilityWarningBody':
      'este agente aparecerá en la sección «Agentes públicos» para todas las demás organizaciones de este servidor Ethora. Podrán ver su personalidad, su prompt y clonarlo para su propio uso. Elige Público solo cuando el agente esté pensado para ser útil de forma universal (por ejemplo, un agente de soporte genérico o una personalidad publicada para la comunidad). Para los agentes que crees para tu propia marca, empresa o sitio web, déjalo en Privado.',
    'adminAgents.cancel': 'Cancelar',
    'adminAgents.creating': 'Creando...',
    'adminAgents.create': 'Crear',
    'adminAgents.updatedLabel': 'Actualizado: ',
    'adminAgents.createdLabel': 'Creado: ',
    'adminAgents.ragLabel': 'RAG: ',
    'adminAgents.deployedLabel': 'Implementado: ',
    'adminAgents.appSingular': 'aplicación',
    'adminAgents.appPlural': 'aplicaciones',
    'adminAgents.edit': 'Editar',
    'adminAgents.view': 'Ver',
    'adminAgents.cloneToMyAgents': 'Clonar en mis agentes',
    'adminAgents.exportJson': 'Exportar JSON',
    'adminAgents.exportZip': 'Exportar ZIP',
    'adminAgents.delete': 'Eliminar',
    'adminAgents.deleteConfirmQuestion': 'Eliminar',
    'adminAgents.deleteConfirmDetail':
      'Desactiva todas sus instancias de bot.',
    'adminAgents.agentDeletedToast': 'Agente eliminado',
    'adminAgents.deleteFailedPrefix': 'Error al eliminar:',
    'adminAgents.clonedToastPrefix': 'Clonado',
    'adminAgents.clonedToastSuffix': 'en tus agentes',
    'adminAgents.cloneFailedPrefix': 'Error al clonar:',
    'adminAgents.exportedToastPrefix': 'Exportado',
    'adminAgents.exportFailedPrefix': 'Error al exportar:',
    'adminAgents.loadAgentsFailedPrefix': 'Error al cargar los agentes:',
    'adminAgents.loadPrivateAgentsFailedPrefix':
      'Error al cargar los agentes privados:',
    'adminAgents.createFailedPrefix': 'Error al crear:',

    'adminBilling.title': 'Facturación',
    'adminBilling.freePlanHeading': 'Estás en un plan gratuito',
    'adminBilling.freePlanBody':
      'Puedes usar nuestro generoso plan gratuito durante todo el tiempo que se ajuste a tu proyecto.',
    'adminBilling.enterpriseHeading':
      '¿Necesitas un servidor dedicado, un SLA de nivel empresarial o personalizaciones del lado del servidor?',
    'adminBilling.enterpriseBody':
      'Hablemos de tus necesidades para encontrar la solución adecuada.',
    'adminBilling.bookACall': 'Reservar una llamada',

    'appStatistics.tabUsers': 'Usuarios',
    'appStatistics.tabSessions': 'Sesiones',
    'appStatistics.tabChats': 'Chats',
    'appStatistics.tabApiCalls': 'Llamadas a la API',
    'appStatistics.tabAssets': 'Activos',
    'appStatistics.tabTransactions': 'Transacciones',
    'appStatistics.tabFiles': 'Archivos',
    'appStatistics.period24h': '24 horas',
    'appStatistics.period7d': '7 días',
    'appStatistics.period30d': '30 días',
    'appStatistics.periodSelect': 'Seleccionar período',
    'appStatistics.heading': 'Estadísticas',
    'appStatistics.exportCsv': 'Exportar CSV',
    'appStatistics.cancel': 'Cancelar',
    'appStatistics.apply': 'Aplicar',
    'appStatistics.forPrefix': 'Para',
    'appStatistics.downloadAlt': 'Descargar',

    'appUsers.title': 'Usuarios',
    'appUsers.tabActive': 'Activos',
    'appUsers.tabArchived': 'Archivados',
    'appUsers.sortCreationDate': 'Fecha de creación',
    'appUsers.sortFirstName': 'Nombre',
    'appUsers.sortLastName': 'Apellido',
    'appUsers.sortEmail': 'Correo electrónico',
    'appUsers.addUser': 'Añadir usuario',
    'appUsers.emptyState':
      'Todavía no hay usuarios. Puedes añadirlos haciendo clic en el botón «Añadir usuario»',
    'appUsers.colFirstName': 'Nombre',
    'appUsers.colLastName': 'Apellido',
    'appUsers.colEmail': 'Correo electrónico',
    'appUsers.colTags': 'Etiquetas',
    'appUsers.colCreationSeenDate': 'Fecha de creación/Última conexión',
    'appUsers.colAuthMethod': 'Método de autenticación',
    'appUsers.colAttribution': 'Atribución',
    'appUsers.colActions': 'Acciones',
    'appUsers.restore': 'Restaurar',
    'appUsers.restoreRowTitle':
      'Restaurar este usuario (anula el archivado, se reactiva el inicio de sesión)',
    'appUsers.permissionsTitle': 'Permisos',
    'appUsers.paginationTo': 'a',
    'appUsers.paginationOf': 'de',
    'appUsers.showLabel': 'mostrar',
    'appUsers.usersWord': 'usuarios',
    'appUsers.selectedPrefix': 'Selección:',
    'appUsers.manageTags': 'Gestionar etiquetas',
    'appUsers.resetPassword': 'Restablecer contraseña',
    'appUsers.archive': 'Archivar',
    'appUsers.archiveTitle':
      'Archivar estos usuarios (reversible). El inicio de sesión se bloquea, pero los datos se conservan.',
    'appUsers.hardDelete': 'Eliminación permanente',
    'appUsers.hardDeleteTitle': 'Eliminar permanentemente (irreversible)',
    'appUsers.tagsModalTitle': 'Etiquetas',
    'appUsers.addTagsSubtext': 'Añadir etiquetas',
    'appUsers.tagsPlaceholder': 'Etiquetas',
    'appUsers.cancel': 'Cancelar',
    'appUsers.submit': 'Enviar',
    'appUsers.passwordResetTitle': 'Restablecimiento de contraseña',
    'appUsers.passwordResetConfirmPrefix':
      '¿Seguro que quieres forzar el restablecimiento de contraseña para',
    'appUsers.userWordSingular': 'usuario',
    'appUsers.userWordPlural': 'usuarios',
    'appUsers.archiveConfirmTitlePrefix': 'Archivar',
    'appUsers.archiveConfirmMessage':
      'Estas cuentas quedarán ocultas y sus propietarios no podrán iniciar sesión, pero todos sus datos (historial de chats, archivos, membresías) se conservarán. Podrás restaurarlas más adelante desde la pestaña Archivados.',
    'appUsers.hardDeleteConfirmTitlePrefix': 'Eliminar permanentemente',
    'appUsers.hardDeleteConfirmMessage':
      'Esta acción elimina de forma irreversible a los usuarios seleccionados junto con sus carteras, archivos, cuentas XMPP, membresías de chat y cualquier sala de la que sean propietarios (junto con los mensajes de esas salas). Esta acción no se puede deshacer.',
    'appUsers.hardDeleteConfirmLabel': 'Sí, eliminar permanentemente',
    'appUsers.tagsAppliedToast': '¡Etiquetas aplicadas correctamente!',
    'appUsers.userCreatedToast': '¡Usuario creado correctamente!',
    'appUsers.passwordResetToast': '¡Contraseña restablecida correctamente!',
    'appUsers.userCapWord': 'Usuario',
    'appUsers.usersCapWord': 'Usuarios',
    'appUsers.archivedSuccessSuffix': 'archivado(s) correctamente',
    'appUsers.deletedPermanentlySuffix': 'eliminado(s) permanentemente',
    'appUsers.restoredSuccessSuffix': 'restaurado(s) correctamente',
    'appUsers.archiveFailedPrefix': 'Error al archivar:',
    'appUsers.hardDeleteFailedPrefix': 'Error al eliminar permanentemente:',
    'appUsers.userRestoredToast': 'Usuario restaurado',
    'appUsers.restoreFailedPrefix': 'Error al restaurar:',

    'agentSettings.loadingAgent': 'Cargando agente...',
    'agentSettings.loadAgentFailedPrefix': 'Error al cargar el agente:',
    'agentSettings.agentNotFound': 'Agente no encontrado.',
    'agentSettings.readOnlyTitle': 'Solo lectura.',
    'agentSettings.readOnlyBodyMain':
      'Estás viendo un agente que pertenece a otra organización',
    'agentSettings.publicParenthetical': ' (público)',
    'agentSettings.readOnlyBodyRest':
      '. La edición, eliminación e inspección del estado de ejecución por sala están deshabilitadas.',
    'agentSettings.readOnlyCloneHint':
      'Usa la acción «Clonar en mis agentes» en la página de lista de agentes para crear tu propia copia editable.',
    'agentSettings.visibilityHeading': 'Visibilidad',
    'agentSettings.visibilityDescription':
      'Determina quién puede ver este agente en este servidor Ethora.',
    'agentSettings.visibilityPrivateLabel': 'Privado',
    'agentSettings.visibilityUnlistedLabel': 'No listado',
    'agentSettings.visibilityPublicLabel': 'Público',
    'agentSettings.visibilityPrivateDesc':
      'Solo tú puedes ver este agente. Recomendado para agentes creados para tu propia empresa, aplicación o sitio web.',
    'agentSettings.visibilityUnlistedDesc':
      'No aparece en listados públicos, pero otras organizaciones que conozcan la dirección del agente pueden encontrarlo. Útil para compartirlo con socios específicos sin hacerlo visible públicamente.',
    'agentSettings.visibilityPublicDesc':
      'Listado para todas las organizaciones de este servidor Ethora. Pueden ver la personalidad del agente y clonarlo. Elige esta opción solo si el agente está pensado para ser útil de forma universal (por ejemplo, un agente de soporte genérico o una personalidad publicada para la comunidad).',
    'agentSettings.visibilityNotEditableMain':
      'Estás viendo un agente que pertenece a otra organización. Solo el propietario puede cambiar su visibilidad.',
    'agentSettings.visibilityNotEditableCloneHint':
      'Usa «Clonar en mis agentes» en la lista de agentes para crear tu propia copia editable.',
    'agentSettings.superadminModerationTitle':
      'Moderación de superadministrador:',
    'agentSettings.superadminModerationBody':
      'puedes cambiar la visibilidad de este agente en nombre de su propietario. Usa esta opción para retirar agentes públicos que contengan spam, abuso o que infrinjan de otro modo la política de la plataforma. Al establecerlo como Privado, se elimina de inmediato de la lista de agentes públicos de todas las demás organizaciones. No se envían notificaciones al propietario; coordínate fuera de la plataforma cuando sea necesario.',
    'agentSettings.visibilitySetToastPrefix': 'Visibilidad establecida en',
    'agentSettings.failedPrefix': 'Error:',
    'agentSettings.backToAgents': 'Agentes',
    'agentSettings.stop': 'Detener',
    'agentSettings.start': 'Iniciar',
    'agentSettings.botStatusToastPrefix': 'Bot',
    'agentSettings.statusOn': 'activado',
    'agentSettings.statusOff': 'desactivado',
    'agentSettings.toggleStatusTitlePrefix':
      'Cambiar el estado de la instancia de bot de este agente en la aplicación',
    'agentSettings.sectionIdentity': 'Identidad',
    'agentSettings.sectionKnowledge': 'Conocimiento',
    'agentSettings.sectionBehaviour': 'Comportamiento',
    'agentSettings.sectionActivity': 'Actividad',
    'agentSettings.sectionSharing': 'Compartir',
    'agentSettings.tabPersona': 'Personalidad',
    'agentSettings.tabContext': 'Contexto',
    'agentSettings.tabWebIndex': 'Índice web',
    'agentSettings.tabDocsIndex': 'Índice de documentos',
    'agentSettings.tabSoulMd': 'SOUL.MD',
    'agentSettings.tabHeartbeat': 'Latido',
    'agentSettings.tabFlows': 'Flujos',
    'agentSettings.tabChatsIndex': 'Índice de chats',
    'agentSettings.tabVisibility': 'Visibilidad',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
