import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// AI Widget admin UI (legacy "AI Bots" tab -> AI Widget page) plus the Agent
// panels used both on that legacy page and the new /app/admin/agents area.
// Namespaced per source file (see comments below) - kept as its own
// dictionary since this is a large, self-contained area that's easiest to
// review/extend independently of common.ts.
export const aiWidget = {
  en: {
    // ActiveAgentSelector.tsx
    'aiWidgetActiveAgentSelector.label': 'Active agent for AI Widget:',
    'aiWidgetActiveAgentSelector.none': '- None -',
    'aiWidgetActiveAgentSelector.myAgents': 'My agents',
    'aiWidgetActiveAgentSelector.publicAgents': 'System / Public agents',
    'aiWidgetActiveAgentSelector.binding': 'Binding agent…',
    'aiWidgetActiveAgentSelector.manageAgents': 'Manage agents',
    'aiWidgetActiveAgentSelector.clearedToast': 'Cleared default agent',
    'aiWidgetActiveAgentSelector.bindChatWarn':
      'Bind a chat to AI Widget first (Web App tab)',
    'aiWidgetActiveAgentSelector.defaultAgentSetToast':
      'Default agent set to "{name}"',
    'aiWidgetActiveAgentSelector.failedPrefix': 'Failed:',

    // HeaderAIWidget.tsx
    'aiWidgetHeader.statusTitle': 'Status',
    'aiWidgetHeader.aiBotIsLabel': 'AI bot is:',
    'aiWidgetHeader.online': 'online',
    'aiWidgetHeader.offline': 'offline',
    'aiWidgetHeader.stop': 'stop',
    'aiWidgetHeader.start': 'start',
    'aiWidgetHeader.localContextTitle': 'Local context',
    'aiWidgetHeader.ragEnabled': 'RAG enabled {size} MB',
    'aiWidgetHeader.ragEmpty': 'RAG empty',
    'aiWidgetHeader.ragDisabled': 'RAG disabled',
    'aiWidgetHeader.disableButton': 'disabled',
    'aiWidgetHeader.enableButton': 'enable',
    'aiWidgetHeader.modelTitle': 'Model',

    // InviteAgentToChatModal.tsx
    'aiWidgetInviteAgent.title': 'Add bot to "{title}"',
    'aiWidgetInviteAgent.tabMine': 'My agents',
    'aiWidgetInviteAgent.tabPublic': 'Public agents',
    'aiWidgetInviteAgent.tabAddress': 'Paste address',
    'aiWidgetInviteAgent.noMineAgents':
      'You have no agents yet. Create one in the AI Bots tab.',
    'aiWidgetInviteAgent.noPublicAgents':
      'No public agents available on this server.',
    'aiWidgetInviteAgent.addressHelp':
      'Paste an Agent address (EOA-style). The agent owner must have set the agent to public or unlisted, otherwise the invite is rejected.',
    'aiWidgetInviteAgent.inviteButton': 'Invite',
    'aiWidgetInviteAgent.invitedToast': 'Invited to {title}',
    'aiWidgetInviteAgent.failedPrefix': 'Failed:',

    // Rag.tsx
    'aiWidgetRag.title': 'RAG (Retrieval Augmented Generation)',
    'aiWidgetRag.paragraph1':
      'This feature allows you to augment your LLM-powered AI agent chat bot with your own context data. Just index your website or upload documents that provide additional information e.g. your products and services.',
    'aiWidgetRag.paragraph2':
      'Your data will be converted into vector space embeddings used by your AI agent as its “external memory” when answering users queries.',
    'aiWidgetRag.paragraph3Prefix': 'This allows you to',
    'aiWidgetRag.paragraph3Bold':
      'create your own project-specific AI agents',
    'aiWidgetRag.paragraph3Suffix':
      'without being limited by the prompt context window size.',

    // TabAIWidget/TabAIWidgetCode.tsx
    'aiWidgetCode.title': 'Code',
    'aiWidgetCode.description':
      'Use this code to integrate widget into your website or external app.',
    'aiWidgetCode.htmlWidgetButton': 'HTML Widget',
    'aiWidgetCode.wordpressButton': 'Wordpress',
    'aiWidgetCode.personaLabel': 'Bot persona (from active Agent)',
    'aiWidgetCode.editInManageAgents': 'Edit in Manage agents',
    'aiWidgetCode.noAgentPrefix':
      'No Agent bound to this widget yet, the legacy AI bot will answer with a generic persona. Pick an Agent in the',
    'aiWidgetCode.noAgentSelectorLabel': 'Active agent for AI Widget',
    'aiWidgetCode.noAgentSuffix': 'selector above.',
    'aiWidgetCode.infoLinePrefix':
      'The widget pulls bot name, avatar, and greeting copy from the active Agent. The snippet below shows optional',
    'aiWidgetCode.infoLineMiddle': 'attributes you can paste into the',
    'aiWidgetCode.infoLineSuffix': 'tag to override any of them per embed.',
    'aiWidgetCode.insertBodyText':
      'Insert this code anywhere inside your <body> tag:',
    'aiWidgetCode.copied': 'Copied',
    'aiWidgetCode.copy': 'Copy',
    'aiWidgetCode.wordpressInsertPrefix':
      'Insert this bot ID in your Wordpress',
    'aiWidgetCode.wordpressInsertSuffix': ':',

    // TabAIWidget/TabAIWidgetDocument.tsx
    'aiWidgetDocuments.title': ' Upload documents (',
    'aiWidgetDocuments.ragFeature': 'RAG feature',
    'aiWidgetDocuments.paidPlansOnly': 'Available in paid plans',
    'aiWidgetDocuments.description':
      'Drag & Drop your documents here for the system to ingest data from there. Supported formats: TXT, CSV, JSON, DOC, PDF.',
    'aiWidgetDocuments.dropzoneHint': 'Drag & Drop or click to select files',
    'aiWidgetDocuments.uploadButton': 'Upload files',

    // TabAIWidget/TabAIWidgetPrompt.tsx
    'aiWidgetPrompt.title': 'Prompt',
    'aiWidgetPrompt.description':
      'Use to provide instructions on how the bot should behave. You may also copy&paste limited data on your specific business context the bot should be aware of.',
    'aiWidgetPrompt.placeholder': 'Enter prompt instructions here...',

    // WidgetConversationsPanel.tsx
    'aiWidgetConversations.heading': 'Widget conversations',
    'aiWidgetConversations.loading': 'Loading…',
    'aiWidgetConversations.totalSuffix': 'total',
    'aiWidgetConversations.exportAll': 'Export all',
    'aiWidgetConversations.exportAllTitle':
      'Export every conversation in this app as a CSV',
    'aiWidgetConversations.refresh': 'Refresh',
    'aiWidgetConversations.exportingCsvPrefix': 'Exporting CSV:',
    'aiWidgetConversations.loadErrorPrefix':
      "Couldn't load conversations:",
    'aiWidgetConversations.emptyState':
      'No widget conversations yet. They appear here once visitors start chatting via the embedded widget.',
    'aiWidgetConversations.selectedSuffix': 'selected',
    'aiWidgetConversations.exportSelected': 'Export selected',
    'aiWidgetConversations.deleteSelected': 'Delete selected',
    'aiWidgetConversations.selectAllOnPage': 'Select all on this page',
    'aiWidgetConversations.visitorHeader': 'Visitor',
    'aiWidgetConversations.startedHeader': 'Started',
    'aiWidgetConversations.lastActivityHeader': 'Last activity',
    'aiWidgetConversations.selectConversationPrefix': 'Select conversation',
    'aiWidgetConversations.open': 'Open',
    'aiWidgetConversations.paginationOf': 'of',
    'aiWidgetConversations.previous': 'Previous',
    'aiWidgetConversations.next': 'Next',
    'aiWidgetConversations.dialogTitle': 'Widget conversation',
    'aiWidgetConversations.visitorLabel': 'Visitor',
    'aiWidgetConversations.startedLabel': 'Started',
    'aiWidgetConversations.lastActivityLabel': 'Last activity',
    'aiWidgetConversations.roomJidLabel': 'Room JID',
    'aiWidgetConversations.messagesLabel': 'Messages',
    'aiWidgetConversations.mamUnavailable':
      'Message history is not available on this deployment, backend MAM_MYSQL_* env vars are not configured.',
    'aiWidgetConversations.loadMessagesErrorPrefix':
      "Couldn't load messages:",
    'aiWidgetConversations.noMessagesYet':
      'No messages in this conversation yet.',
    'aiWidgetConversations.visitorTag': 'visitor',
    'aiWidgetConversations.botTag': 'bot',
    'aiWidgetConversations.emptyBody': '(empty body)',
    'aiWidgetConversations.confirmDeleteTitleOne':
      'Delete {count} conversation?',
    'aiWidgetConversations.confirmDeleteTitleOther':
      'Delete {count} conversations?',
    'aiWidgetConversations.confirmDeleteBodyOne':
      'This permanently removes the selected conversation, message history, the chat record, and the underlying chat room. Visitors who return will start a fresh conversation.',
    'aiWidgetConversations.confirmDeleteBodyOther':
      'This permanently removes the selected conversations, message history, the chat record, and the underlying chat room. Visitors who return will start a fresh conversation.',
    'aiWidgetConversations.deleting': 'Deleting…',
    'aiWidgetConversations.cancel': 'Cancel',
    'aiWidgetConversations.delete': 'Delete',
    'aiWidgetConversations.fetchingList': 'Fetching conversation list…',
    'aiWidgetConversations.loadFailedFallback': 'Failed to load',
    'aiWidgetConversations.loadMessagesFailedFallback':
      'Failed to load messages',
    'aiWidgetConversations.exportFailedPrefix': 'Export failed:',
    'aiWidgetConversations.jidLabel': 'JID',
    'aiWidgetConversations.countryLabel': 'Country',
    'aiWidgetConversations.browserLabel': 'Browser',
    'aiWidgetConversations.osLabel': 'OS',
    'aiWidgetConversations.deviceLabel': 'Device',
    'aiWidgetConversations.firstSeenLabel': 'First seen',
    'aiWidgetConversations.desktopDefault': 'desktop',
    'aiWidgetConversations.metadataUnavailable':
      'Captured metadata is unavailable for visitors who started a conversation before this feature was rolled out.',

    // Agents/panels/AgentPanels.tsx
    'agentPanels.saved': 'Saved',
    'agentPanels.saveFailedPrefix': 'Save failed:',
    'agentPanels.selectImageFile': 'Please select an image file',
    'agentPanels.avatarUploaded': 'Avatar uploaded',
    'agentPanels.uploadFailedPrefix': 'Upload failed:',
    'agentPanels.confirmRemoveAvatar': "Remove this agent's avatar?",
    'agentPanels.avatarCleared': 'Avatar cleared',
    'agentPanels.clearFailedPrefix': 'Clear failed:',
    'agentPanels.displayNameLabel': 'Display name',
    'agentPanels.avatarLabel': 'Avatar',
    'agentPanels.noAvatar': 'no avatar',
    'agentPanels.remove': 'Remove',
    'agentPanels.uploading': 'Uploading...',
    'agentPanels.avatarUrlAdvancedLabel': 'Avatar URL (advanced)',
    'agentPanels.bioLabel': 'Bio',
    'agentPanels.responseModeLabel': 'Response mode',
    'agentPanels.responseModeAlways': 'Always',
    'agentPanels.responseModeMentioned': 'Mentioned only',
    'agentPanels.responseModeSmart': 'Smart (LLM gate)',
    'agentPanels.responseModeProbability': 'Probability',
    'agentPanels.probabilityLabel': 'Probability ({pct}%)',
    'agentPanels.cooldownLabel':
      'Cooldown (seconds between replies in the same room)',
    'agentPanels.savePersona': 'Save persona',
    'agentPanels.templatesLabel': 'Templates:',
    'agentPanels.contextSaved': 'Context saved',
    'agentPanels.saveContext': 'Save context',
    'agentPanels.webIndexDescription':
      "Crawl a website and store content as embeddings under this agent's RAG namespace.",
    'agentPanels.failedToLoadUrlsPrefix': 'Failed to load indexed URLs:',
    'agentPanels.couldNotLoadDocsListPrefix': 'Could not load docs list:',
    'agentPanels.noAppPicked':
      'No app picked, open an app in admin first or pick one below.',
    'agentPanels.scopeAppLabel': 'Scope app:',
    'agentPanels.pickAnApp': '(pick an app)',
    'agentPanels.originSuffix': ' (origin)',
    'agentPanels.followLinks': 'follow links',
    'agentPanels.crawling': 'Crawling...',
    'agentPanels.crawl': 'Crawl',
    'agentPanels.crawlQueued':
      'Crawl started. Indexed pages appear here once it finishes - reload the list in a minute.',
    'agentPanels.crawlFailedPrefix': 'Crawl failed:',
    'agentPanels.confirmRecrawlIndexed':
      '{url} is already indexed. Crawl it again and replace the stored copy?',
    'agentPanels.indexedBytesPrefix': 'Indexed bytes:',
    'agentPanels.indexedUrlsSuffixOne': 'indexed URL in this app',
    'agentPanels.indexedUrlsSuffixOther': 'indexed URLs in this app',
    'agentPanels.paginationRange': 'Showing {from}-{to} of {total}',
    'agentPanels.previousPage': 'Previous',
    'agentPanels.nextPage': 'Next',
    'agentPanels.urlHeader': 'URL',
    'agentPanels.sizeHeader': 'Size',
    'agentPanels.updatedHeader': 'Updated',
    'agentPanels.loading': 'Loading...',
    'agentPanels.noUrlsIndexed': 'No URLs indexed for this app yet.',
    'agentPanels.viaPrefix': 'via',
    'agentPanels.reindex': 'Reindex',
    'agentPanels.reindexQueued': 'Reindex queued',
    'agentPanels.reindexFailedPrefix': 'Reindex failed:',
    'agentPanels.confirmRemoveFromIndex': 'Remove "{name}" from the index?',
    'agentPanels.removed': 'Removed',
    'agentPanels.removeFailedPrefix': 'Remove failed:',
    'agentPanels.selectedCount': '{n} selected',
    'agentPanels.removeSelected': 'Remove selected',
    'agentPanels.confirmRemoveSelected':
      'Remove {n} selected URLs from the index?',
    'agentPanels.removedSelected': 'Removed {n} URLs',
    'agentPanels.selectAllOnPage': 'Select all URLs on this page',
    'agentPanels.selectRow': 'Select {url}',
    'agentPanels.viewMarkdown': 'View',
    'agentPanels.markdownTitle': 'Indexed content',
    'agentPanels.markdownEmpty': 'No content is stored for this URL.',
    'agentPanels.markdownLoadFailedPrefix': 'Could not load content:',
    'agentPanels.markdownBytes': '{n} bytes of markdown',
    'agentPanels.closeDialog': 'Close',
    'agentPanels.docsIndexDescription':
      'Upload PDFs, DOCX, MD, TXT to index under this agent.',
    'agentPanels.uploadingParsingEmbedding':
      'Uploading + parsing + embedding...',
    'agentPanels.uploadedFilesToast': 'Uploaded {n} file(s)',
    'agentPanels.fileHeader': 'File',
    'agentPanels.uploadedHeader': 'Uploaded',
    'agentPanels.noFilesIndexed': 'No files indexed for this app yet.',
    'agentPanels.soulMdDescriptionPrefix':
      "SOUL.MD: the agent's evolving identity. The agent itself can request updates (Phase 2 wires a tool-call); for now you can edit it as the operator. Last update:",
    'agentPanels.never': 'never',
    'agentPanels.notApplicable': 'n/a',
    'agentPanels.soulMdSaved': 'SOUL.MD saved',
    'agentPanels.failedPrefix': 'Failed:',
    'agentPanels.saveSoulMd': 'Save SOUL.MD',
    'agentPanels.heartbeatDescription':
      'Heartbeat lets the agent engage proactively (e.g. once per day, after N min of inactivity, on a cron). Phase 1 stores the config; the cron worker that actually fires events is delivered in Phase 2.',
    'agentPanels.enabledLabel': 'Enabled',
    'agentPanels.scheduleLabel': 'Schedule (cron, interval, or keyword)',
    'agentPanels.heartbeatPromptLabel': 'Heartbeat prompt',
    'agentPanels.heartbeatSaved': 'Heartbeat saved',
    'agentPanels.saveHeartbeat': 'Save heartbeat',
    'agentPanels.none': 'none',
    'agentPanels.testSentToast': 'Test sent to "{title}"',
    'agentPanels.sentFailedPrefix': 'Sent failed:',
    'agentPanels.testFailedPrefix': 'Test failed:',
    'agentPanels.test': 'Test',
    'agentPanels.testTooltip':
      'Send a system test message into this room only',
    'agentPanels.confirmRemoveFromRoom':
      'Remove "{name}" from "{title}"? The bot stays running and can be re-invited later.',
    'agentPanels.agentFallback': 'agent',
    'agentPanels.leftToast': 'Left "{title}"',
    'agentPanels.leaveFailedPrefix': 'Leave failed:',
    'agentPanels.leave': 'Leave',
    'agentPanels.leaveTooltip':
      'Remove this BotInstance from this room (does not stop the bot)',
    'agentPanels.diagNotLoaded': 'Not loaded yet',
    'agentPanels.diagNoXmppClient':
      'No XmppClient process for this bot in ai-service',
    'agentPanels.diagSpawnedNotOnlinePrefix': 'Spawned but not online',
    'agentPanels.diagOnlineNotInRoom': 'Online but not in any MUC room',
    'agentPanels.diagOnlineInMuc': 'Online and in MUC',
    'agentPanels.botOnTitle':
      'ai-service has spawned an XmppClient for this BotInstance, bot is connected and will participate in the rooms below.',
    'agentPanels.botOffTitle':
      "BotInstance is stopped, XmppClient is torn down. Rooms are still listed (persisted) but the bot is not actually in them and won't speak. Use the agent header Start to re-spawn.",
    'agentPanels.inspectDisabledTooltip':
      "Inspect is disabled for agents you don't own. Chat content in this bot's rooms belongs to its owner.",
    'agentPanels.inspectDisabled': 'Inspect disabled',
    'agentPanels.hide': 'Hide',
    'agentPanels.inspect': 'Inspect',
    'agentPanels.refreshing': 'Refreshing...',
    'agentPanels.refresh': 'Refresh',
    'agentPanels.aiServiceErrorPrefix': 'ai-service error:',
    'agentPanels.inMemoryHeading': 'In-memory (ai-service runtime)',
    'agentPanels.spawnedLabel': 'Spawned',
    'agentPanels.onlineLabel': 'Online',
    'agentPanels.joinedRoomsXmppLabel': 'Joined rooms (XMPP)',
    'agentPanels.pendingRoomsLabel': 'Pending rooms',
    'agentPanels.responseModeLabelShort': 'Response mode',
    'agentPanels.ragLabel': 'RAG',
    'agentPanels.cooldownSecLabel': 'Cooldown (s)',
    'agentPanels.promptLengthLabel': 'Prompt length',
    'agentPanels.lastErrorLabel': 'Last error',
    'agentPanels.defaultFallback': 'default',
    'agentPanels.xmppJoinedRoomsLabel': 'XMPP joined rooms:',
    'agentPanels.lastConversationsHeading': 'Last conversations',
    'agentPanels.noneRecordedYet':
      "None recorded yet. If the bot is online + in the room but you've sent messages and see nothing here, the stanza handler in ai-service is not seeing the messages, check ai-service logs and ejabberd MUC config.",
    'agentPanels.chatsIndexDescription':
      'Per-App embodiments of this Agent and the rooms each is in. Click "Inspect" on a row to see live ai-service runtime state (online? in-room? last error?) and the last few message/response pairs, useful for diagnosing "the bot doesn\'t respond".',
    'agentPanels.appHeader': 'App',
    'agentPanels.botInAppHeader': 'Bot in app',
    'agentPanels.botInAppTooltip':
      "Bot lifecycle in this app: 'on' = ai-service has spawned an XmppClient and the bot will participate in the rooms below; 'off' = teardown, the bot won't speak in this app even though rooms are still listed.",
    'agentPanels.roomsJoinedHeader': 'Rooms joined (with per-room actions)',
    'agentPanels.lastActiveHeader': 'Last active',
    'agentPanels.notDeployedYet': 'Not deployed to any App yet.',
    'agentPanels.inviteToDefaultRoomHeading':
      'Invite to a default room of this app',
    'agentPanels.invitedToast': 'Invited to {title}',
    'agentPanels.inviteFailedPrefix': 'Invite failed:',
  },
  fr: {
    // ActiveAgentSelector.tsx
    'aiWidgetActiveAgentSelector.label': 'Agent actif pour le widget IA :',
    'aiWidgetActiveAgentSelector.none': '- Aucun -',
    'aiWidgetActiveAgentSelector.myAgents': 'Mes agents',
    'aiWidgetActiveAgentSelector.publicAgents': 'Agents système / publics',
    'aiWidgetActiveAgentSelector.binding':
      "Association de l'agent en cours…",
    'aiWidgetActiveAgentSelector.manageAgents': 'Gérer les agents',
    'aiWidgetActiveAgentSelector.clearedToast': 'Agent par défaut effacé',
    'aiWidgetActiveAgentSelector.bindChatWarn':
      "Associez d'abord une discussion au widget IA (onglet Application web)",
    'aiWidgetActiveAgentSelector.defaultAgentSetToast':
      'Agent par défaut défini sur « {name} »',
    'aiWidgetActiveAgentSelector.failedPrefix': 'Échec :',

    // HeaderAIWidget.tsx
    'aiWidgetHeader.statusTitle': 'Statut',
    'aiWidgetHeader.aiBotIsLabel': 'Le bot IA est :',
    'aiWidgetHeader.online': 'en ligne',
    'aiWidgetHeader.offline': 'hors ligne',
    'aiWidgetHeader.stop': 'arrêter',
    'aiWidgetHeader.start': 'démarrer',
    'aiWidgetHeader.localContextTitle': 'Contexte local',
    'aiWidgetHeader.ragEnabled': 'RAG activé {size} Mo',
    'aiWidgetHeader.ragEmpty': 'RAG vide',
    'aiWidgetHeader.ragDisabled': 'RAG désactivé',
    'aiWidgetHeader.disableButton': 'désactivé',
    'aiWidgetHeader.enableButton': 'activer',
    'aiWidgetHeader.modelTitle': 'Modèle',

    // InviteAgentToChatModal.tsx
    'aiWidgetInviteAgent.title': 'Ajouter un bot à « {title} »',
    'aiWidgetInviteAgent.tabMine': 'Mes agents',
    'aiWidgetInviteAgent.tabPublic': 'Agents publics',
    'aiWidgetInviteAgent.tabAddress': 'Coller une adresse',
    'aiWidgetInviteAgent.noMineAgents':
      "Vous n'avez pas encore d'agents. Créez-en un dans l'onglet Bots IA.",
    'aiWidgetInviteAgent.noPublicAgents':
      'Aucun agent public disponible sur ce serveur.',
    'aiWidgetInviteAgent.addressHelp':
      "Collez une adresse d'agent (type EOA). Le propriétaire de l'agent doit l'avoir rendu public ou non répertorié, sinon l'invitation est refusée.",
    'aiWidgetInviteAgent.inviteButton': 'Inviter',
    'aiWidgetInviteAgent.invitedToast': 'Invité dans {title}',
    'aiWidgetInviteAgent.failedPrefix': 'Échec :',

    // Rag.tsx
    'aiWidgetRag.title': 'RAG (génération augmentée par récupération)',
    'aiWidgetRag.paragraph1':
      "Cette fonctionnalité vous permet d'enrichir votre chatbot IA basé sur un LLM avec vos propres données contextuelles. Il vous suffit d'indexer votre site web ou de téléverser des documents apportant des informations complémentaires, par exemple sur vos produits et services.",
    'aiWidgetRag.paragraph2':
      'Vos données seront converties en embeddings vectoriels utilisés par votre agent IA comme « mémoire externe » pour répondre aux requêtes des utilisateurs.',
    'aiWidgetRag.paragraph3Prefix': 'Cela vous permet de',
    'aiWidgetRag.paragraph3Bold':
      'créer vos propres agents IA spécifiques à votre projet',
    'aiWidgetRag.paragraph3Suffix':
      'sans être limité par la taille de la fenêtre de contexte du prompt.',

    // TabAIWidget/TabAIWidgetCode.tsx
    'aiWidgetCode.title': 'Code',
    'aiWidgetCode.description':
      'Utilisez ce code pour intégrer le widget à votre site web ou à une application externe.',
    'aiWidgetCode.htmlWidgetButton': 'Widget HTML',
    'aiWidgetCode.wordpressButton': 'Wordpress',
    'aiWidgetCode.personaLabel': "Persona du bot (à partir de l'agent actif)",
    'aiWidgetCode.editInManageAgents': 'Modifier dans Gérer les agents',
    'aiWidgetCode.noAgentPrefix':
      "Aucun agent n'est associé à ce widget pour le moment, le bot IA hérité répondra avec une persona générique. Choisissez un agent dans le",
    'aiWidgetCode.noAgentSelectorLabel': 'Agent actif pour le widget IA',
    'aiWidgetCode.noAgentSuffix': 'sélecteur ci-dessus.',
    'aiWidgetCode.infoLinePrefix':
      "Le widget récupère le nom du bot, l'avatar et le texte d'accueil depuis l'agent actif. L'extrait ci-dessous affiche les attributs optionnels",
    'aiWidgetCode.infoLineMiddle': 'que vous pouvez coller dans la balise',
    'aiWidgetCode.infoLineSuffix':
      'pour les remplacer individuellement par intégration.',
    'aiWidgetCode.insertBodyText':
      "Insérez ce code n'importe où dans votre balise <body> :",
    'aiWidgetCode.copied': 'Copié',
    'aiWidgetCode.copy': 'Copier',
    'aiWidgetCode.wordpressInsertPrefix':
      'Insérez cet identifiant de bot dans les paramètres de votre Wordpress',
    'aiWidgetCode.wordpressInsertSuffix': ' :',

    // TabAIWidget/TabAIWidgetDocument.tsx
    'aiWidgetDocuments.title': ' Ajouter des documents (',
    'aiWidgetDocuments.ragFeature': 'fonctionnalité RAG',
    'aiWidgetDocuments.paidPlansOnly': 'Disponible dans les plans payants',
    'aiWidgetDocuments.description':
      "Glissez-déposez vos documents ici pour que le système en extraie les données. Formats pris en charge : TXT, CSV, JSON, DOC, PDF.",
    'aiWidgetDocuments.dropzoneHint':
      'Glissez-déposez ou cliquez pour sélectionner des fichiers',
    'aiWidgetDocuments.uploadButton': 'Téléverser les fichiers',

    // TabAIWidget/TabAIWidgetPrompt.tsx
    'aiWidgetPrompt.title': 'Prompt',
    'aiWidgetPrompt.description':
      'Utilisez ce champ pour indiquer comment le bot doit se comporter. Vous pouvez également copier-coller des données limitées sur le contexte spécifique de votre activité dont le bot doit avoir connaissance.',
    'aiWidgetPrompt.placeholder': 'Saisissez les instructions du prompt ici...',

    // WidgetConversationsPanel.tsx
    'aiWidgetConversations.heading': 'Conversations du widget',
    'aiWidgetConversations.loading': 'Chargement…',
    'aiWidgetConversations.totalSuffix': 'au total',
    'aiWidgetConversations.exportAll': 'Tout exporter',
    'aiWidgetConversations.exportAllTitle':
      'Exporter toutes les conversations de cette application au format CSV',
    'aiWidgetConversations.refresh': 'Actualiser',
    'aiWidgetConversations.exportingCsvPrefix': 'Export du CSV en cours:',
    'aiWidgetConversations.loadErrorPrefix':
      'Impossible de charger les conversations :',
    'aiWidgetConversations.emptyState':
      'Aucune conversation de widget pour le moment. Elles apparaîtront ici dès que des visiteurs commenceront à discuter via le widget intégré.',
    'aiWidgetConversations.selectedSuffix': 'sélectionné(s)',
    'aiWidgetConversations.exportSelected': 'Exporter la sélection',
    'aiWidgetConversations.deleteSelected': 'Supprimer la sélection',
    'aiWidgetConversations.selectAllOnPage':
      'Tout sélectionner sur cette page',
    'aiWidgetConversations.visitorHeader': 'Visiteur',
    'aiWidgetConversations.startedHeader': 'Démarrée le',
    'aiWidgetConversations.lastActivityHeader': 'Dernière activité',
    'aiWidgetConversations.selectConversationPrefix':
      'Sélectionner la conversation',
    'aiWidgetConversations.open': 'Ouvrir',
    'aiWidgetConversations.paginationOf': 'sur',
    'aiWidgetConversations.previous': 'Précédent',
    'aiWidgetConversations.next': 'Suivant',
    'aiWidgetConversations.dialogTitle': 'Conversation du widget',
    'aiWidgetConversations.visitorLabel': 'Visiteur',
    'aiWidgetConversations.startedLabel': 'Démarrée',
    'aiWidgetConversations.lastActivityLabel': 'Dernière activité',
    'aiWidgetConversations.roomJidLabel': 'JID du salon',
    'aiWidgetConversations.messagesLabel': 'Messages',
    'aiWidgetConversations.mamUnavailable':
      "L'historique des messages n'est pas disponible sur ce déploiement, les variables d'environnement backend MAM_MYSQL_* ne sont pas configurées.",
    'aiWidgetConversations.loadMessagesErrorPrefix':
      'Impossible de charger les messages :',
    'aiWidgetConversations.noMessagesYet':
      'Aucun message dans cette conversation pour le moment.',
    'aiWidgetConversations.visitorTag': 'visiteur',
    'aiWidgetConversations.botTag': 'bot',
    'aiWidgetConversations.emptyBody': '(message vide)',
    'aiWidgetConversations.confirmDeleteTitleOne':
      'Supprimer {count} conversation ?',
    'aiWidgetConversations.confirmDeleteTitleOther':
      'Supprimer {count} conversations ?',
    'aiWidgetConversations.confirmDeleteBodyOne':
      "Cela supprime définitivement la conversation sélectionnée : l'historique des messages, l'enregistrement de la discussion et le salon de discussion sous-jacent. Les visiteurs qui reviennent démarreront une nouvelle conversation.",
    'aiWidgetConversations.confirmDeleteBodyOther':
      "Cela supprime définitivement les conversations sélectionnées : l'historique des messages, l'enregistrement de la discussion et le salon de discussion sous-jacent. Les visiteurs qui reviennent démarreront une nouvelle conversation.",
    'aiWidgetConversations.deleting': 'Suppression…',
    'aiWidgetConversations.cancel': 'Annuler',
    'aiWidgetConversations.delete': 'Supprimer',
    'aiWidgetConversations.fetchingList':
      'Récupération de la liste des conversations…',
    'aiWidgetConversations.loadFailedFallback': 'Échec du chargement',
    'aiWidgetConversations.loadMessagesFailedFallback':
      'Échec du chargement des messages',
    'aiWidgetConversations.exportFailedPrefix': "Échec de l'export :",
    'aiWidgetConversations.jidLabel': 'JID',
    'aiWidgetConversations.countryLabel': 'Pays',
    'aiWidgetConversations.browserLabel': 'Navigateur',
    'aiWidgetConversations.osLabel': 'OS',
    'aiWidgetConversations.deviceLabel': 'Appareil',
    'aiWidgetConversations.firstSeenLabel': 'Première visite',
    'aiWidgetConversations.desktopDefault': 'ordinateur de bureau',
    'aiWidgetConversations.metadataUnavailable':
      "Les métadonnées ne sont pas disponibles pour les visiteurs ayant démarré une conversation avant le déploiement de cette fonctionnalité.",

    // Agents/panels/AgentPanels.tsx
    'agentPanels.saved': 'Enregistré',
    'agentPanels.saveFailedPrefix': "Échec de l'enregistrement :",
    'agentPanels.selectImageFile': 'Veuillez sélectionner un fichier image',
    'agentPanels.avatarUploaded': 'Avatar téléversé',
    'agentPanels.uploadFailedPrefix': "Échec du téléversement :",
    'agentPanels.confirmRemoveAvatar': "Supprimer l'avatar de cet agent ?",
    'agentPanels.avatarCleared': 'Avatar supprimé',
    'agentPanels.clearFailedPrefix': 'Échec de la suppression :',
    'agentPanels.displayNameLabel': "Nom d'affichage",
    'agentPanels.avatarLabel': 'Avatar',
    'agentPanels.noAvatar': 'aucun avatar',
    'agentPanels.remove': 'Supprimer',
    'agentPanels.uploading': 'Téléversement...',
    'agentPanels.avatarUrlAdvancedLabel': "URL de l'avatar (avancé)",
    'agentPanels.bioLabel': 'Bio',
    'agentPanels.responseModeLabel': 'Mode de réponse',
    'agentPanels.responseModeAlways': 'Toujours',
    'agentPanels.responseModeMentioned': 'Uniquement si mentionné',
    'agentPanels.responseModeSmart': 'Intelligent (filtre LLM)',
    'agentPanels.responseModeProbability': 'Probabilité',
    'agentPanels.probabilityLabel': 'Probabilité ({pct} %)',
    'agentPanels.cooldownLabel':
      'Délai de récupération (secondes entre les réponses dans le même salon)',
    'agentPanels.savePersona': 'Enregistrer la persona',
    'agentPanels.templatesLabel': 'Modèles :',
    'agentPanels.contextSaved': 'Contexte enregistré',
    'agentPanels.saveContext': 'Enregistrer le contexte',
    'agentPanels.webIndexDescription':
      "Explorez un site web et stockez son contenu sous forme d'embeddings dans l'espace RAG de cet agent.",
    'agentPanels.failedToLoadUrlsPrefix':
      'Échec du chargement des URL indexées :',
    'agentPanels.couldNotLoadDocsListPrefix':
      'Impossible de charger la liste des documents :',
    'agentPanels.noAppPicked':
      "Aucune application sélectionnée, ouvrez d'abord une application dans l'administration ou choisissez-en une ci-dessous.",
    'agentPanels.scopeAppLabel': 'Application ciblée :',
    'agentPanels.pickAnApp': '(choisir une application)',
    'agentPanels.originSuffix': ' (origine)',
    'agentPanels.followLinks': 'suivre les liens',
    'agentPanels.crawling': 'Exploration en cours...',
    'agentPanels.crawl': 'Explorer',
    'agentPanels.crawlQueued':
      "Exploration lancée. Les pages indexées apparaîtront ici une fois terminée - rechargez la liste dans une minute.",
    'agentPanels.crawlFailedPrefix': "Échec de l'exploration :",
    'agentPanels.confirmRecrawlIndexed':
      '{url} est déjà indexée. Explorer à nouveau et remplacer la copie enregistrée ?',
    'agentPanels.indexedBytesPrefix': 'Octets indexés :',
    'agentPanels.indexedUrlsSuffixOne': 'URL indexée dans cette application',
    'agentPanels.indexedUrlsSuffixOther':
      'URL indexées dans cette application',
    'agentPanels.paginationRange': 'Affichage de {from} à {to} sur {total}',
    'agentPanels.previousPage': 'Précédent',
    'agentPanels.nextPage': 'Suivant',
    'agentPanels.urlHeader': 'URL',
    'agentPanels.sizeHeader': 'Taille',
    'agentPanels.updatedHeader': 'Mis à jour',
    'agentPanels.loading': 'Chargement...',
    'agentPanels.noUrlsIndexed':
      'Aucune URL indexée pour cette application pour le moment.',
    'agentPanels.viaPrefix': 'via',
    'agentPanels.reindex': 'Réindexer',
    'agentPanels.reindexQueued': "Réindexation mise en file d'attente",
    'agentPanels.reindexFailedPrefix': 'Échec de la réindexation :',
    'agentPanels.confirmRemoveFromIndex':
      'Supprimer « {name} » de l’index ?',
    'agentPanels.removed': 'Supprimé',
    'agentPanels.removeFailedPrefix': 'Échec de la suppression :',
    'agentPanels.selectedCount': '{n} sélectionnées',
    'agentPanels.removeSelected': 'Supprimer la sélection',
    'agentPanels.confirmRemoveSelected':
      "Supprimer les {n} URL sélectionnées de l'index ?",
    'agentPanels.removedSelected': '{n} URL supprimées',
    'agentPanels.selectAllOnPage': 'Sélectionner toutes les URL de cette page',
    'agentPanels.selectRow': 'Sélectionner {url}',
    'agentPanels.viewMarkdown': 'Voir',
    'agentPanels.markdownTitle': 'Contenu indexé',
    'agentPanels.markdownEmpty': "Aucun contenu n'est stocké pour cette URL.",
    'agentPanels.markdownLoadFailedPrefix': 'Impossible de charger le contenu :',
    'agentPanels.markdownBytes': '{n} octets de markdown',
    'agentPanels.closeDialog': 'Fermer',
    'agentPanels.docsIndexDescription':
      'Téléversez des fichiers PDF, DOCX, MD, TXT à indexer pour cet agent.',
    'agentPanels.uploadingParsingEmbedding':
      "Téléversement + analyse + génération des embeddings...",
    'agentPanels.uploadedFilesToast': '{n} fichier(s) téléversé(s)',
    'agentPanels.fileHeader': 'Fichier',
    'agentPanels.uploadedHeader': 'Téléversé',
    'agentPanels.noFilesIndexed':
      'Aucun fichier indexé pour cette application pour le moment.',
    'agentPanels.soulMdDescriptionPrefix':
      "SOUL.MD : l'identité évolutive de l'agent. L'agent lui-même pourra demander des mises à jour (la phase 2 connectera un appel d'outil) ; pour l'instant, vous pouvez le modifier en tant qu'opérateur. Dernière mise à jour :",
    'agentPanels.never': 'jamais',
    'agentPanels.notApplicable': 'n/d',
    'agentPanels.soulMdSaved': 'SOUL.MD enregistré',
    'agentPanels.failedPrefix': 'Échec :',
    'agentPanels.saveSoulMd': 'Enregistrer SOUL.MD',
    'agentPanels.heartbeatDescription':
      "Le battement de cœur (heartbeat) permet à l'agent d'engager la conversation de façon proactive (par ex. une fois par jour, après N minutes d'inactivité, selon une planification cron). La phase 1 se limite à stocker la configuration ; le worker cron qui déclenche réellement les événements sera livré en phase 2.",
    'agentPanels.enabledLabel': 'Activé',
    'agentPanels.scheduleLabel': 'Planification (cron, intervalle ou mot-clé)',
    'agentPanels.heartbeatPromptLabel': 'Prompt du heartbeat',
    'agentPanels.heartbeatSaved': 'Heartbeat enregistré',
    'agentPanels.saveHeartbeat': 'Enregistrer le heartbeat',
    'agentPanels.none': 'aucun',
    'agentPanels.testSentToast': 'Test envoyé à « {title} »',
    'agentPanels.sentFailedPrefix': "Échec de l'envoi :",
    'agentPanels.testFailedPrefix': 'Échec du test :',
    'agentPanels.test': 'Tester',
    'agentPanels.testTooltip':
      'Envoyer un message système de test uniquement dans ce salon',
    'agentPanels.confirmRemoveFromRoom':
      'Retirer « {name} » de « {title} » ? Le bot continue de fonctionner et pourra être réinvité plus tard.',
    'agentPanels.agentFallback': 'agent',
    'agentPanels.leftToast': 'A quitté « {title} »',
    'agentPanels.leaveFailedPrefix': 'Échec du retrait :',
    'agentPanels.leave': 'Quitter',
    'agentPanels.leaveTooltip':
      "Retirer cette instance de bot de ce salon (ne l'arrête pas)",
    'agentPanels.diagNotLoaded': 'Pas encore chargé',
    'agentPanels.diagNoXmppClient':
      'Aucun processus XmppClient pour ce bot dans ai-service',
    'agentPanels.diagSpawnedNotOnlinePrefix': 'Démarré mais hors ligne',
    'agentPanels.diagOnlineNotInRoom':
      'En ligne mais absent de tout salon MUC',
    'agentPanels.diagOnlineInMuc': 'En ligne et dans le MUC',
    'agentPanels.botOnTitle':
      'ai-service a démarré un XmppClient pour cette instance de bot, le bot est connecté et participera aux salons ci-dessous.',
    'agentPanels.botOffTitle':
      "L'instance de bot est arrêtée, le XmppClient a été détruit. Les salons restent listés (persistants) mais le bot n'y est pas réellement présent et ne parlera pas. Utilisez le bouton Démarrer en haut de l'agent pour le relancer.",
    'agentPanels.inspectDisabledTooltip':
      "L'inspection est désactivée pour les agents dont vous n'êtes pas propriétaire. Le contenu des discussions dans les salons de ce bot appartient à son propriétaire.",
    'agentPanels.inspectDisabled': 'Inspection désactivée',
    'agentPanels.hide': 'Masquer',
    'agentPanels.inspect': 'Inspecter',
    'agentPanels.refreshing': 'Actualisation...',
    'agentPanels.refresh': 'Actualiser',
    'agentPanels.aiServiceErrorPrefix': 'erreur ai-service :',
    'agentPanels.inMemoryHeading': 'En mémoire (exécution ai-service)',
    'agentPanels.spawnedLabel': 'Démarré',
    'agentPanels.onlineLabel': 'En ligne',
    'agentPanels.joinedRoomsXmppLabel': 'Salons rejoints (XMPP)',
    'agentPanels.pendingRoomsLabel': 'Salons en attente',
    'agentPanels.responseModeLabelShort': 'Mode de réponse',
    'agentPanels.ragLabel': 'RAG',
    'agentPanels.cooldownSecLabel': 'Délai (s)',
    'agentPanels.promptLengthLabel': 'Longueur du prompt',
    'agentPanels.lastErrorLabel': 'Dernière erreur',
    'agentPanels.defaultFallback': 'par défaut',
    'agentPanels.xmppJoinedRoomsLabel': 'Salons XMPP rejoints :',
    'agentPanels.lastConversationsHeading': 'Dernières conversations',
    'agentPanels.noneRecordedYet':
      "Aucune conversation enregistrée pour le moment. Si le bot est en ligne et présent dans le salon mais que vous avez envoyé des messages sans rien voir apparaître ici, le gestionnaire de stanzas d'ai-service ne reçoit pas les messages, vérifiez les journaux d'ai-service et la configuration MUC d'ejabberd.",
    'agentPanels.chatsIndexDescription':
      'Incarnations par application de cet agent et les salons dans lesquels chacune se trouve. Cliquez sur « Inspecter » sur une ligne pour voir l’état d’exécution ai-service en direct (en ligne ? dans le salon ? dernière erreur ?) ainsi que les derniers échanges message/réponse, utile pour diagnostiquer « le bot ne répond pas ».',
    'agentPanels.appHeader': 'Application',
    'agentPanels.botInAppHeader': "Bot dans l'application",
    'agentPanels.botInAppTooltip':
      "Cycle de vie du bot dans cette application : « on » = ai-service a démarré un XmppClient et le bot participera aux salons ci-dessous ; « off » = arrêt, le bot ne parlera pas dans cette application même si les salons sont encore listés.",
    'agentPanels.roomsJoinedHeader': 'Salons rejoints (avec actions par salon)',
    'agentPanels.lastActiveHeader': 'Dernière activité',
    'agentPanels.notDeployedYet': "Pas encore déployé sur aucune application.",
    'agentPanels.inviteToDefaultRoomHeading':
      'Inviter dans un salon par défaut de cette application',
    'agentPanels.invitedToast': 'Invité dans {title}',
    'agentPanels.inviteFailedPrefix': "Échec de l'invitation :",
  },
  es: {
    // ActiveAgentSelector.tsx
    'aiWidgetActiveAgentSelector.label':
      'Agente activo para el widget de IA:',
    'aiWidgetActiveAgentSelector.none': '- Ninguno -',
    'aiWidgetActiveAgentSelector.myAgents': 'Mis agentes',
    'aiWidgetActiveAgentSelector.publicAgents':
      'Agentes del sistema / públicos',
    'aiWidgetActiveAgentSelector.binding': 'Vinculando agente…',
    'aiWidgetActiveAgentSelector.manageAgents': 'Gestionar agentes',
    'aiWidgetActiveAgentSelector.clearedToast': 'Agente predeterminado borrado',
    'aiWidgetActiveAgentSelector.bindChatWarn':
      'Vincula primero un chat al widget de IA (pestaña Aplicación web)',
    'aiWidgetActiveAgentSelector.defaultAgentSetToast':
      'Agente predeterminado establecido en "{name}"',
    'aiWidgetActiveAgentSelector.failedPrefix': 'Error:',

    // HeaderAIWidget.tsx
    'aiWidgetHeader.statusTitle': 'Estado',
    'aiWidgetHeader.aiBotIsLabel': 'El bot de IA está:',
    'aiWidgetHeader.online': 'en línea',
    'aiWidgetHeader.offline': 'desconectado',
    'aiWidgetHeader.stop': 'detener',
    'aiWidgetHeader.start': 'iniciar',
    'aiWidgetHeader.localContextTitle': 'Contexto local',
    'aiWidgetHeader.ragEnabled': 'RAG habilitado {size} MB',
    'aiWidgetHeader.ragEmpty': 'RAG vacío',
    'aiWidgetHeader.ragDisabled': 'RAG deshabilitado',
    'aiWidgetHeader.disableButton': 'deshabilitado',
    'aiWidgetHeader.enableButton': 'habilitar',
    'aiWidgetHeader.modelTitle': 'Modelo',

    // InviteAgentToChatModal.tsx
    'aiWidgetInviteAgent.title': 'Agregar bot a "{title}"',
    'aiWidgetInviteAgent.tabMine': 'Mis agentes',
    'aiWidgetInviteAgent.tabPublic': 'Agentes públicos',
    'aiWidgetInviteAgent.tabAddress': 'Pegar dirección',
    'aiWidgetInviteAgent.noMineAgents':
      'Aún no tienes agentes. Crea uno en la pestaña de bots de IA.',
    'aiWidgetInviteAgent.noPublicAgents':
      'No hay agentes públicos disponibles en este servidor.',
    'aiWidgetInviteAgent.addressHelp':
      'Pega una dirección de agente (estilo EOA). El propietario del agente debe haberlo configurado como público o no listado; de lo contrario, la invitación será rechazada.',
    'aiWidgetInviteAgent.inviteButton': 'Invitar',
    'aiWidgetInviteAgent.invitedToast': 'Invitado a {title}',
    'aiWidgetInviteAgent.failedPrefix': 'Error:',

    // Rag.tsx
    'aiWidgetRag.title': 'RAG (generación aumentada por recuperación)',
    'aiWidgetRag.paragraph1':
      'Esta función te permite complementar tu chatbot de IA basado en un LLM con tus propios datos de contexto. Solo tienes que indexar tu sitio web o subir documentos que aporten información adicional, por ejemplo sobre tus productos y servicios.',
    'aiWidgetRag.paragraph2':
      'Tus datos se convertirán en embeddings vectoriales que tu agente de IA utilizará como "memoria externa" al responder las consultas de los usuarios.',
    'aiWidgetRag.paragraph3Prefix': 'Esto te permite',
    'aiWidgetRag.paragraph3Bold':
      'crear tus propios agentes de IA específicos para el proyecto',
    'aiWidgetRag.paragraph3Suffix':
      'sin estar limitado por el tamaño de la ventana de contexto del prompt.',

    // TabAIWidget/TabAIWidgetCode.tsx
    'aiWidgetCode.title': 'Código',
    'aiWidgetCode.description':
      'Usa este código para integrar el widget en tu sitio web o aplicación externa.',
    'aiWidgetCode.htmlWidgetButton': 'Widget HTML',
    'aiWidgetCode.wordpressButton': 'Wordpress',
    'aiWidgetCode.personaLabel': 'Persona del bot (del agente activo)',
    'aiWidgetCode.editInManageAgents': 'Editar en Gestionar agentes',
    'aiWidgetCode.noAgentPrefix':
      'Aún no hay ningún agente vinculado a este widget: el bot de IA heredado responderá con una persona genérica. Elige un agente en el',
    'aiWidgetCode.noAgentSelectorLabel': 'Agente activo para el widget de IA',
    'aiWidgetCode.noAgentSuffix': 'selector de arriba.',
    'aiWidgetCode.infoLinePrefix':
      'El widget obtiene el nombre del bot, el avatar y el texto de bienvenida del agente activo. El fragmento de abajo muestra los atributos opcionales',
    'aiWidgetCode.infoLineMiddle': 'que puedes pegar en la etiqueta',
    'aiWidgetCode.infoLineSuffix':
      'para anular cualquiera de ellos por instalación.',
    'aiWidgetCode.insertBodyText':
      'Inserta este código en cualquier parte dentro de tu etiqueta <body>:',
    'aiWidgetCode.copied': 'Copiado',
    'aiWidgetCode.copy': 'Copiar',
    'aiWidgetCode.wordpressInsertPrefix':
      'Inserta este ID de bot en la configuración de tu Wordpress',
    'aiWidgetCode.wordpressInsertSuffix': ':',

    // TabAIWidget/TabAIWidgetDocument.tsx
    'aiWidgetDocuments.title': ' Subir documentos (',
    'aiWidgetDocuments.ragFeature': 'función RAG',
    'aiWidgetDocuments.paidPlansOnly': 'Disponible en planes de pago',
    'aiWidgetDocuments.description':
      'Arrastra y suelta tus documentos aquí para que el sistema extraiga los datos. Formatos admitidos: TXT, CSV, JSON, DOC, PDF.',
    'aiWidgetDocuments.dropzoneHint':
      'Arrastra y suelta o haz clic para seleccionar archivos',
    'aiWidgetDocuments.uploadButton': 'Subir archivos',

    // TabAIWidget/TabAIWidgetPrompt.tsx
    'aiWidgetPrompt.title': 'Prompt',
    'aiWidgetPrompt.description':
      'Úsalo para indicar cómo debe comportarse el bot. También puedes copiar y pegar datos limitados sobre el contexto específico de tu negocio que el bot debe conocer.',
    'aiWidgetPrompt.placeholder':
      'Escribe aquí las instrucciones del prompt...',

    // WidgetConversationsPanel.tsx
    'aiWidgetConversations.heading': 'Conversaciones del widget',
    'aiWidgetConversations.loading': 'Cargando…',
    'aiWidgetConversations.totalSuffix': 'en total',
    'aiWidgetConversations.exportAll': 'Exportar todo',
    'aiWidgetConversations.exportAllTitle':
      'Exportar todas las conversaciones de esta aplicación como CSV',
    'aiWidgetConversations.refresh': 'Actualizar',
    'aiWidgetConversations.exportingCsvPrefix': 'Exportando CSV:',
    'aiWidgetConversations.loadErrorPrefix':
      'No se pudieron cargar las conversaciones:',
    'aiWidgetConversations.emptyState':
      'Aún no hay conversaciones del widget. Aparecerán aquí en cuanto los visitantes empiecen a chatear a través del widget incrustado.',
    'aiWidgetConversations.selectedSuffix': 'seleccionado(s)',
    'aiWidgetConversations.exportSelected': 'Exportar seleccionados',
    'aiWidgetConversations.deleteSelected': 'Eliminar seleccionados',
    'aiWidgetConversations.selectAllOnPage':
      'Seleccionar todo en esta página',
    'aiWidgetConversations.visitorHeader': 'Visitante',
    'aiWidgetConversations.startedHeader': 'Iniciada',
    'aiWidgetConversations.lastActivityHeader': 'Última actividad',
    'aiWidgetConversations.selectConversationPrefix':
      'Seleccionar conversación',
    'aiWidgetConversations.open': 'Abrir',
    'aiWidgetConversations.paginationOf': 'de',
    'aiWidgetConversations.previous': 'Anterior',
    'aiWidgetConversations.next': 'Siguiente',
    'aiWidgetConversations.dialogTitle': 'Conversación del widget',
    'aiWidgetConversations.visitorLabel': 'Visitante',
    'aiWidgetConversations.startedLabel': 'Iniciada',
    'aiWidgetConversations.lastActivityLabel': 'Última actividad',
    'aiWidgetConversations.roomJidLabel': 'JID de la sala',
    'aiWidgetConversations.messagesLabel': 'Mensajes',
    'aiWidgetConversations.mamUnavailable':
      'El historial de mensajes no está disponible en esta instalación: las variables de entorno del backend MAM_MYSQL_* no están configuradas.',
    'aiWidgetConversations.loadMessagesErrorPrefix':
      'No se pudieron cargar los mensajes:',
    'aiWidgetConversations.noMessagesYet':
      'Aún no hay mensajes en esta conversación.',
    'aiWidgetConversations.visitorTag': 'visitante',
    'aiWidgetConversations.botTag': 'bot',
    'aiWidgetConversations.emptyBody': '(cuerpo vacío)',
    'aiWidgetConversations.confirmDeleteTitleOne':
      '¿Eliminar {count} conversación?',
    'aiWidgetConversations.confirmDeleteTitleOther':
      '¿Eliminar {count} conversaciones?',
    'aiWidgetConversations.confirmDeleteBodyOne':
      'Esto elimina permanentemente la conversación seleccionada: el historial de mensajes, el registro del chat y la sala de chat subyacente. Los visitantes que regresen comenzarán una nueva conversación.',
    'aiWidgetConversations.confirmDeleteBodyOther':
      'Esto elimina permanentemente las conversaciones seleccionadas: el historial de mensajes, el registro del chat y la sala de chat subyacente. Los visitantes que regresen comenzarán una nueva conversación.',
    'aiWidgetConversations.deleting': 'Eliminando…',
    'aiWidgetConversations.cancel': 'Cancelar',
    'aiWidgetConversations.delete': 'Eliminar',
    'aiWidgetConversations.fetchingList':
      'Obteniendo la lista de conversaciones…',
    'aiWidgetConversations.loadFailedFallback': 'Error al cargar',
    'aiWidgetConversations.loadMessagesFailedFallback':
      'Error al cargar los mensajes',
    'aiWidgetConversations.exportFailedPrefix': 'Error al exportar:',
    'aiWidgetConversations.jidLabel': 'JID',
    'aiWidgetConversations.countryLabel': 'País',
    'aiWidgetConversations.browserLabel': 'Navegador',
    'aiWidgetConversations.osLabel': 'SO',
    'aiWidgetConversations.deviceLabel': 'Dispositivo',
    'aiWidgetConversations.firstSeenLabel': 'Primera vez visto',
    'aiWidgetConversations.desktopDefault': 'escritorio',
    'aiWidgetConversations.metadataUnavailable':
      'Los metadatos capturados no están disponibles para los visitantes que iniciaron una conversación antes de que se implementara esta función.',

    // Agents/panels/AgentPanels.tsx
    'agentPanels.saved': 'Guardado',
    'agentPanels.saveFailedPrefix': 'Error al guardar:',
    'agentPanels.selectImageFile': 'Selecciona un archivo de imagen',
    'agentPanels.avatarUploaded': 'Avatar subido',
    'agentPanels.uploadFailedPrefix': 'Error al subir:',
    'agentPanels.confirmRemoveAvatar':
      '¿Eliminar el avatar de este agente?',
    'agentPanels.avatarCleared': 'Avatar eliminado',
    'agentPanels.clearFailedPrefix': 'Error al eliminar:',
    'agentPanels.displayNameLabel': 'Nombre visible',
    'agentPanels.avatarLabel': 'Avatar',
    'agentPanels.noAvatar': 'sin avatar',
    'agentPanels.remove': 'Eliminar',
    'agentPanels.uploading': 'Subiendo...',
    'agentPanels.avatarUrlAdvancedLabel': 'URL del avatar (avanzado)',
    'agentPanels.bioLabel': 'Biografía',
    'agentPanels.responseModeLabel': 'Modo de respuesta',
    'agentPanels.responseModeAlways': 'Siempre',
    'agentPanels.responseModeMentioned': 'Solo si se le menciona',
    'agentPanels.responseModeSmart': 'Inteligente (filtro LLM)',
    'agentPanels.responseModeProbability': 'Probabilidad',
    'agentPanels.probabilityLabel': 'Probabilidad ({pct}%)',
    'agentPanels.cooldownLabel':
      'Tiempo de espera (segundos entre respuestas en la misma sala)',
    'agentPanels.savePersona': 'Guardar persona',
    'agentPanels.templatesLabel': 'Plantillas:',
    'agentPanels.contextSaved': 'Contexto guardado',
    'agentPanels.saveContext': 'Guardar contexto',
    'agentPanels.webIndexDescription':
      'Rastrea un sitio web y almacena su contenido como embeddings en el espacio RAG de este agente.',
    'agentPanels.failedToLoadUrlsPrefix':
      'Error al cargar las URL indexadas:',
    'agentPanels.couldNotLoadDocsListPrefix':
      'No se pudo cargar la lista de documentos:',
    'agentPanels.noAppPicked':
      'No se ha seleccionado ninguna aplicación: abre una aplicación en el panel de administración o elige una a continuación.',
    'agentPanels.scopeAppLabel': 'Aplicación de referencia:',
    'agentPanels.pickAnApp': '(elige una aplicación)',
    'agentPanels.originSuffix': ' (origen)',
    'agentPanels.followLinks': 'seguir enlaces',
    'agentPanels.crawling': 'Rastreando...',
    'agentPanels.crawl': 'Rastrear',
    'agentPanels.crawlQueued':
      'Rastreo iniciado. Las páginas indexadas aparecerán aquí cuando termine: recarga la lista en un minuto.',
    'agentPanels.crawlFailedPrefix': 'Error al rastrear:',
    'agentPanels.confirmRecrawlIndexed':
      '{url} ya está indexada. ¿Rastrearla de nuevo y reemplazar la copia guardada?',
    'agentPanels.indexedBytesPrefix': 'Bytes indexados:',
    'agentPanels.indexedUrlsSuffixOne': 'URL indexada en esta aplicación',
    'agentPanels.indexedUrlsSuffixOther':
      'URL indexadas en esta aplicación',
    'agentPanels.paginationRange': 'Mostrando {from}-{to} de {total}',
    'agentPanels.previousPage': 'Anterior',
    'agentPanels.nextPage': 'Siguiente',
    'agentPanels.urlHeader': 'URL',
    'agentPanels.sizeHeader': 'Tamaño',
    'agentPanels.updatedHeader': 'Actualizado',
    'agentPanels.loading': 'Cargando...',
    'agentPanels.noUrlsIndexed':
      'Aún no hay URL indexadas para esta aplicación.',
    'agentPanels.viaPrefix': 'a través de',
    'agentPanels.reindex': 'Reindexar',
    'agentPanels.reindexQueued': 'Reindexación en cola',
    'agentPanels.reindexFailedPrefix': 'Error al reindexar:',
    'agentPanels.confirmRemoveFromIndex': '¿Eliminar "{name}" del índice?',
    'agentPanels.removed': 'Eliminado',
    'agentPanels.removeFailedPrefix': 'Error al eliminar:',
    'agentPanels.selectedCount': '{n} seleccionadas',
    'agentPanels.removeSelected': 'Eliminar seleccionadas',
    'agentPanels.confirmRemoveSelected':
      '¿Eliminar del índice las {n} URL seleccionadas?',
    'agentPanels.removedSelected': '{n} URL eliminadas',
    'agentPanels.selectAllOnPage': 'Seleccionar todas las URL de esta página',
    'agentPanels.selectRow': 'Seleccionar {url}',
    'agentPanels.viewMarkdown': 'Ver',
    'agentPanels.markdownTitle': 'Contenido indexado',
    'agentPanels.markdownEmpty': 'No hay contenido almacenado para esta URL.',
    'agentPanels.markdownLoadFailedPrefix': 'No se pudo cargar el contenido:',
    'agentPanels.markdownBytes': '{n} bytes de markdown',
    'agentPanels.closeDialog': 'Cerrar',
    'agentPanels.docsIndexDescription':
      'Sube archivos PDF, DOCX, MD, TXT para indexarlos en este agente.',
    'agentPanels.uploadingParsingEmbedding':
      'Subiendo + analizando + generando embeddings...',
    'agentPanels.uploadedFilesToast': '{n} archivo(s) subido(s)',
    'agentPanels.fileHeader': 'Archivo',
    'agentPanels.uploadedHeader': 'Subido',
    'agentPanels.noFilesIndexed':
      'Aún no hay archivos indexados para esta aplicación.',
    'agentPanels.soulMdDescriptionPrefix':
      'SOUL.MD: la identidad en evolución del agente. El propio agente podrá solicitar actualizaciones (la fase 2 conectará una llamada a herramienta); por ahora puedes editarlo como operador. Última actualización:',
    'agentPanels.never': 'nunca',
    'agentPanels.notApplicable': 'n/d',
    'agentPanels.soulMdSaved': 'SOUL.MD guardado',
    'agentPanels.failedPrefix': 'Error:',
    'agentPanels.saveSoulMd': 'Guardar SOUL.MD',
    'agentPanels.heartbeatDescription':
      'El "heartbeat" permite que el agente inicie la interacción de forma proactiva (por ejemplo, una vez al día, tras N minutos de inactividad, según una programación cron). La fase 1 solo almacena la configuración; el worker cron que realmente dispara los eventos se entregará en la fase 2.',
    'agentPanels.enabledLabel': 'Habilitado',
    'agentPanels.scheduleLabel': 'Programación (cron, intervalo o palabra clave)',
    'agentPanels.heartbeatPromptLabel': 'Prompt del heartbeat',
    'agentPanels.heartbeatSaved': 'Heartbeat guardado',
    'agentPanels.saveHeartbeat': 'Guardar heartbeat',
    'agentPanels.none': 'ninguno',
    'agentPanels.testSentToast': 'Prueba enviada a "{title}"',
    'agentPanels.sentFailedPrefix': 'Error al enviar:',
    'agentPanels.testFailedPrefix': 'Error en la prueba:',
    'agentPanels.test': 'Probar',
    'agentPanels.testTooltip':
      'Enviar un mensaje de prueba del sistema solo a esta sala',
    'agentPanels.confirmRemoveFromRoom':
      '¿Quitar a "{name}" de "{title}"? El bot sigue funcionando y puede volver a invitarse más tarde.',
    'agentPanels.agentFallback': 'agente',
    'agentPanels.leftToast': 'Salió de "{title}"',
    'agentPanels.leaveFailedPrefix': 'Error al salir:',
    'agentPanels.leave': 'Salir',
    'agentPanels.leaveTooltip':
      'Quitar esta instancia de bot de esta sala (no detiene al bot)',
    'agentPanels.diagNotLoaded': 'Aún no cargado',
    'agentPanels.diagNoXmppClient':
      'No hay proceso XmppClient para este bot en ai-service',
    'agentPanels.diagSpawnedNotOnlinePrefix': 'Iniciado pero no en línea',
    'agentPanels.diagOnlineNotInRoom':
      'En línea pero no está en ninguna sala MUC',
    'agentPanels.diagOnlineInMuc': 'En línea y en el MUC',
    'agentPanels.botOnTitle':
      'ai-service ha iniciado un XmppClient para esta instancia de bot: el bot está conectado y participará en las salas indicadas abajo.',
    'agentPanels.botOffTitle':
      'La instancia de bot está detenida: el XmppClient se ha cerrado. Las salas se siguen mostrando (persistidas), pero el bot no está realmente en ellas y no hablará. Usa el botón Iniciar en la cabecera del agente para reiniciarlo.',
    'agentPanels.inspectDisabledTooltip':
      'La inspección está deshabilitada para agentes que no te pertenecen. El contenido de chat en las salas de este bot pertenece a su propietario.',
    'agentPanels.inspectDisabled': 'Inspección deshabilitada',
    'agentPanels.hide': 'Ocultar',
    'agentPanels.inspect': 'Inspeccionar',
    'agentPanels.refreshing': 'Actualizando...',
    'agentPanels.refresh': 'Actualizar',
    'agentPanels.aiServiceErrorPrefix': 'error de ai-service:',
    'agentPanels.inMemoryHeading': 'En memoria (tiempo de ejecución de ai-service)',
    'agentPanels.spawnedLabel': 'Iniciado',
    'agentPanels.onlineLabel': 'En línea',
    'agentPanels.joinedRoomsXmppLabel': 'Salas unidas (XMPP)',
    'agentPanels.pendingRoomsLabel': 'Salas pendientes',
    'agentPanels.responseModeLabelShort': 'Modo de respuesta',
    'agentPanels.ragLabel': 'RAG',
    'agentPanels.cooldownSecLabel': 'Tiempo de espera (s)',
    'agentPanels.promptLengthLabel': 'Longitud del prompt',
    'agentPanels.lastErrorLabel': 'Último error',
    'agentPanels.defaultFallback': 'predeterminado',
    'agentPanels.xmppJoinedRoomsLabel': 'Salas XMPP unidas:',
    'agentPanels.lastConversationsHeading': 'Últimas conversaciones',
    'agentPanels.noneRecordedYet':
      'Aún no hay conversaciones registradas. Si el bot está en línea y en la sala, pero has enviado mensajes y no ves nada aquí, el manejador de stanzas en ai-service no está recibiendo los mensajes: revisa los registros de ai-service y la configuración de MUC de ejabberd.',
    'agentPanels.chatsIndexDescription':
      'Instancias por aplicación de este agente y las salas en las que se encuentra cada una. Haz clic en "Inspeccionar" en una fila para ver el estado en vivo de ai-service (¿en línea? ¿en la sala? ¿último error?) y los últimos pares de mensaje/respuesta; útil para diagnosticar por qué "el bot no responde".',
    'agentPanels.appHeader': 'Aplicación',
    'agentPanels.botInAppHeader': 'Bot en la aplicación',
    'agentPanels.botInAppTooltip':
      "Ciclo de vida del bot en esta aplicación: 'on' = ai-service ha iniciado un XmppClient y el bot participará en las salas indicadas abajo; 'off' = detenido, el bot no hablará en esta aplicación aunque las salas sigan apareciendo.",
    'agentPanels.roomsJoinedHeader': 'Salas unidas (con acciones por sala)',
    'agentPanels.lastActiveHeader': 'Última actividad',
    'agentPanels.notDeployedYet':
      'Aún no se ha implementado en ninguna aplicación.',
    'agentPanels.inviteToDefaultRoomHeading':
      'Invitar a una sala predeterminada de esta aplicación',
    'agentPanels.invitedToast': 'Invitado a {title}',
    'agentPanels.inviteFailedPrefix': 'Error al invitar:',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
