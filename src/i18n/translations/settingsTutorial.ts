import type { UiLanguageCode } from '../../constants/languageOptionsConstants';

// Onboarding/tutorial modal flow (src/components/modal/SettingsTutorialModal/**).
// Namespaced per source file: stepStartTutorial.* (StepStartTutorial.tsx),
// dataTutorial.* (DataTutorial.tsx - shared step/question data consumed by
// several components), settingTutorialModal.* (SettingTutorialModal.tsx),
// answerStep.* (components/AnswerStep.tsx), questionsStepDefault.*
// (components/QuestionsStepDefault.tsx), stepChooseTutorial.*
// (components/StepChooseTutorial.tsx), hubspotForm.* (components/HubspotForm.tsx).
export const settingsTutorial = {
  en: {
    'stepStartTutorial.heading': 'Choose Your Path',
    'stepStartTutorial.subheading':
      'Select one of the three approaches to continue with your personalized experience.',

    'dataTutorial.chat.title': 'Chat',
    'dataTutorial.chat.description':
      'Build or integrate instant messaging experience.',
    'dataTutorial.ai.title': 'AI',
    'dataTutorial.ai.description':
      'Deploy AI agent for your visitors or your team.',
    'dataTutorial.demo.title': 'Demo',
    'dataTutorial.demo.description': 'Book a demo with Ethora team.',

    'dataTutorial.chat.one.title': 'New web app',
    'dataTutorial.chat.one.time': '(no code, 5 min)',
    'dataTutorial.chat.one.description':
      'Launch your own web app with unique URL address, logo and colours without leaving the admin panel. Manage Chat rooms, on-board Users and AI agents if required.',
    'dataTutorial.chat.two.title': 'New iOS/Android React Native app',
    'dataTutorial.chat.two.time': '(low code, 30 min)',
    'dataTutorial.chat.two.description':
      'Build your own iOS or Android app using our open-source engine. Manage Chat rooms, on-board Users and AI agents if required.',
    'dataTutorial.chat.three.title': 'Existing app integration',
    'dataTutorial.chat.three.time': '(days)',
    'dataTutorial.chat.three.description':
      'Add chat into your existing apps using Ethora SDK: NPM chat component, Swift SPM library, Javascript iframe widget, API, Chat Protocol and Bots Framework.',

    'dataTutorial.ai.one.title': 'AI widget (copy & paste)',
    'dataTutorial.ai.one.time': '(low code, 10 min)',
    'dataTutorial.ai.one.description':
      'Get a Javascript to add AI agent into your website or test it right here in the admin panel. Index your website or upload documents to train your project specific AI agent.',
    'dataTutorial.ai.one.answerDescription':
      "Use the opportunity to give your AI widget a branded look, specify a convenient and memorable name, and set the path to a local avatar so the widget fits perfectly into your project’s design. After configuring everything, simply copy the generated code and paste it at the end of the <body> tag, and your personalized AI assistant will be fully ready to work in your application or on your website. Fast, simple, and without any extra steps.",
    'dataTutorial.ai.two.title': 'AI widget (WP plugin)',
    'dataTutorial.ai.two.time': '(low code, 15 min)',
    'dataTutorial.ai.two.description':
      'Download and install our Wordpress plugin to launch AI agent for your website. Index your website or upload documents via admin panel to manage context.',
    'dataTutorial.ai.two.answerDescription':
      "Use this section to define your bot’s personality and interaction style. Here, you can describe in detail how the assistant should respond to users, what tasks it should perform, and what tone of communication it should maintain. If needed, you can also add important context about your business so the bot understands the specifics of your products and works as accurately and effectively as possible.",
    'dataTutorial.ai.three.title': 'AI web app',
    'dataTutorial.ai.three.time': '(no code, 15 min)',
    'dataTutorial.ai.three.description':
      'Launch your own AI agent app with your unique URL, logo and branding. Index your website or upload documents to make your AI agent efficient for your use case.',
    'dataTutorial.ai.three.answerTakeUserTo': 'Take user to',
    'dataTutorial.ai.three.answerBotLinkLabel': 'Ai bot',
    'dataTutorial.ai.three.answerTab': 'tab',

    'dataTutorial.answerTimeDefault': '5–15 minutes',

    'settingTutorialModal.chatList.title': 'Chat',
    'settingTutorialModal.chatList.subtitle':
      'Build or integrate instant messaging experience.',
    'settingTutorialModal.aiList.title': 'AI',
    'settingTutorialModal.aiList.subtitle':
      'Deploy AI agent for your visitors or your team.',

    'answerStep.answerLabel': 'Answer:',
    'answerStep.imageAlt': 'Demo animation',
    'answerStep.timeLabel': 'Time: ',
    'answerStep.complexityLabel': 'Complexity: ',

    'questionsStepDefault.title': 'Choose a Chat Setting',
    'questionsStepDefault.description': 'I want to..',

    'stepChooseTutorial.noQuestions': 'No questions available',
    'stepChooseTutorial.goStart': 'GO START',
    'stepChooseTutorial.imageAlt': 'Demo animation',

    'hubspotForm.notConfiguredError':
      "Online booking isn't configured on this install. Email hello@ethora.com and we'll schedule a call.",
    'hubspotForm.recaptchaError':
      'Online booking is temporarily unavailable. Please email hello@ethora.com or message us on the forum and we will schedule a call.',
    'hubspotForm.genericError':
      'Sorry, we could not submit your request. Please email hello@ethora.com instead.',
    'hubspotForm.networkError':
      'Network error - please email hello@ethora.com instead.',
    'hubspotForm.successTitle': "Thanks - we'll be in touch!",
    'hubspotForm.successBody':
      'Our team will reach out shortly to schedule a call. In the meantime feel free to keep exploring.',
    'hubspotForm.firstNamePlaceholder': 'First name',
    'hubspotForm.lastNamePlaceholder': 'Last name',
    'hubspotForm.emailPlaceholder': 'Email',
    'hubspotForm.companyPlaceholder': 'Company',
    'hubspotForm.messagePlaceholder':
      'What would you like to discuss? (optional)',
    'hubspotForm.emailLinkText': 'Email hello@ethora.com',
    'hubspotForm.sendingButton': 'Sending...',
    'hubspotForm.submitButton': 'Request a call',
  },
  fr: {
    'stepStartTutorial.heading': 'Choisissez votre parcours',
    'stepStartTutorial.subheading':
      "Sélectionnez l'une des trois approches pour poursuivre votre expérience personnalisée.",

    'dataTutorial.chat.title': 'Chat',
    'dataTutorial.chat.description':
      'Créez ou intégrez une expérience de messagerie instantanée.',
    'dataTutorial.ai.title': 'IA',
    'dataTutorial.ai.description':
      'Déployez un agent IA pour vos visiteurs ou votre équipe.',
    'dataTutorial.demo.title': 'Démo',
    'dataTutorial.demo.description': "Réservez une démo avec l'équipe Ethora.",

    'dataTutorial.chat.one.title': 'Nouvelle application web',
    'dataTutorial.chat.one.time': '(no code, 5 min)',
    'dataTutorial.chat.one.description':
      "Lancez votre propre application web avec une URL, un logo et des couleurs uniques, sans quitter le panneau d'administration. Gérez les salons de discussion, intégrez des utilisateurs et des agents IA si nécessaire.",
    'dataTutorial.chat.two.title':
      'Nouvelle application iOS/Android React Native',
    'dataTutorial.chat.two.time': '(low code, 30 min)',
    'dataTutorial.chat.two.description':
      'Créez votre propre application iOS ou Android grâce à notre moteur open source. Gérez les salons de discussion, intégrez des utilisateurs et des agents IA si nécessaire.',
    'dataTutorial.chat.three.title':
      'Intégration à une application existante',
    'dataTutorial.chat.three.time': '(jours)',
    'dataTutorial.chat.three.description':
      'Ajoutez le chat à vos applications existantes grâce au SDK Ethora : composant chat NPM, bibliothèque Swift SPM, widget Javascript en iframe, API, protocole de chat et framework de bots.',

    'dataTutorial.ai.one.title': 'Widget IA (copier-coller)',
    'dataTutorial.ai.one.time': '(low code, 10 min)',
    'dataTutorial.ai.one.description':
      "Obtenez un script Javascript pour ajouter un agent IA à votre site web, ou testez-le directement dans le panneau d'administration. Indexez votre site ou téléversez des documents pour entraîner votre agent IA sur mesure.",
    'dataTutorial.ai.one.answerDescription':
      "Profitez-en pour donner à votre widget IA une image de marque : indiquez un nom pratique et facile à retenir, puis définissez le chemin d'un avatar local afin que le widget s'intègre parfaitement au design de votre projet. Une fois la configuration terminée, il vous suffit de copier le code généré et de le coller juste avant la fermeture de la balise <body> : votre assistant IA personnalisé sera alors pleinement opérationnel dans votre application ou sur votre site web. Rapide, simple, et sans étape superflue.",
    'dataTutorial.ai.two.title': 'Widget IA (plugin WordPress)',
    'dataTutorial.ai.two.time': '(low code, 15 min)',
    'dataTutorial.ai.two.description':
      "Téléchargez et installez notre plugin WordPress pour lancer un agent IA sur votre site web. Indexez votre site ou téléversez des documents via le panneau d'administration pour gérer le contexte.",
    'dataTutorial.ai.two.answerDescription':
      "Utilisez cette section pour définir la personnalité et le style d'interaction de votre bot. Vous pouvez y décrire en détail comment l'assistant doit répondre aux utilisateurs, quelles tâches il doit accomplir et quel ton de communication il doit adopter. Si besoin, ajoutez également des informations importantes sur votre activité afin que le bot comprenne les spécificités de vos produits et travaille de la manière la plus précise et efficace possible.",
    'dataTutorial.ai.three.title': 'Application web IA',
    'dataTutorial.ai.three.time': '(no code, 15 min)',
    'dataTutorial.ai.three.description':
      "Lancez votre propre application d'agent IA avec une URL, un logo et une identité de marque uniques. Indexez votre site ou téléversez des documents pour rendre votre agent IA efficace pour votre cas d'usage.",
    'dataTutorial.ai.three.answerTakeUserTo':
      "Emmener l'utilisateur vers l'onglet",
    'dataTutorial.ai.three.answerBotLinkLabel': 'Bot IA',
    'dataTutorial.ai.three.answerTab': '',

    'dataTutorial.answerTimeDefault': '5 à 15 minutes',

    'settingTutorialModal.chatList.title': 'Chat',
    'settingTutorialModal.chatList.subtitle':
      'Créez ou intégrez une expérience de messagerie instantanée.',
    'settingTutorialModal.aiList.title': 'IA',
    'settingTutorialModal.aiList.subtitle':
      'Déployez un agent IA pour vos visiteurs ou votre équipe.',

    'answerStep.answerLabel': 'Réponse :',
    'answerStep.imageAlt': 'Animation de démonstration',
    'answerStep.timeLabel': 'Durée : ',
    'answerStep.complexityLabel': 'Complexité : ',

    'questionsStepDefault.title': 'Choisissez un paramètre de chat',
    'questionsStepDefault.description': 'Je veux..',

    'stepChooseTutorial.noQuestions': 'Aucune question disponible',
    'stepChooseTutorial.goStart': 'COMMENCER',
    'stepChooseTutorial.imageAlt': 'Animation de démonstration',

    'hubspotForm.notConfiguredError':
      "La réservation en ligne n'est pas configurée sur cette installation. Envoyez un e-mail à hello@ethora.com et nous planifierons un appel.",
    'hubspotForm.recaptchaError':
      "La réservation en ligne est temporairement indisponible. Merci d'envoyer un e-mail à hello@ethora.com ou de nous contacter sur le forum, nous planifierons un appel.",
    'hubspotForm.genericError':
      "Désolé, nous n'avons pas pu envoyer votre demande. Merci d'envoyer un e-mail à hello@ethora.com à la place.",
    'hubspotForm.networkError':
      "Erreur réseau : merci d'envoyer un e-mail à hello@ethora.com à la place.",
    'hubspotForm.successTitle': 'Merci, nous vous recontacterons bientôt !',
    'hubspotForm.successBody':
      "Notre équipe vous contactera prochainement pour planifier un appel. En attendant, n'hésitez pas à continuer votre exploration.",
    'hubspotForm.firstNamePlaceholder': 'Prénom',
    'hubspotForm.lastNamePlaceholder': 'Nom',
    'hubspotForm.emailPlaceholder': 'E-mail',
    'hubspotForm.companyPlaceholder': 'Entreprise',
    'hubspotForm.messagePlaceholder':
      'De quoi souhaitez-vous parler ? (facultatif)',
    'hubspotForm.emailLinkText': 'Envoyer un e-mail à hello@ethora.com',
    'hubspotForm.sendingButton': 'Envoi en cours...',
    'hubspotForm.submitButton': 'Demander un appel',
  },
  es: {
    'stepStartTutorial.heading': 'Elige tu camino',
    'stepStartTutorial.subheading':
      'Selecciona uno de los tres enfoques para continuar con tu experiencia personalizada.',

    'dataTutorial.chat.title': 'Chat',
    'dataTutorial.chat.description':
      'Crea o integra una experiencia de mensajería instantánea.',
    'dataTutorial.ai.title': 'IA',
    'dataTutorial.ai.description':
      'Despliega un agente de IA para tus visitantes o tu equipo.',
    'dataTutorial.demo.title': 'Demo',
    'dataTutorial.demo.description': 'Reserva una demo con el equipo de Ethora.',

    'dataTutorial.chat.one.title': 'Nueva aplicación web',
    'dataTutorial.chat.one.time': '(sin código, 5 min)',
    'dataTutorial.chat.one.description':
      'Lanza tu propia aplicación web con una URL, un logotipo y unos colores únicos, sin salir del panel de administración. Gestiona salas de chat e incorpora usuarios y agentes de IA si es necesario.',
    'dataTutorial.chat.two.title':
      'Nueva aplicación iOS/Android con React Native',
    'dataTutorial.chat.two.time': '(low code, 30 min)',
    'dataTutorial.chat.two.description':
      'Crea tu propia aplicación iOS o Android con nuestro motor de código abierto. Gestiona salas de chat e incorpora usuarios y agentes de IA si es necesario.',
    'dataTutorial.chat.three.title': 'Integración en una aplicación existente',
    'dataTutorial.chat.three.time': '(días)',
    'dataTutorial.chat.three.description':
      'Añade chat a tus aplicaciones existentes con el SDK de Ethora: componente de chat NPM, biblioteca Swift SPM, widget de Javascript en iframe, API, protocolo de chat y framework de bots.',

    'dataTutorial.ai.one.title': 'Widget de IA (copiar y pegar)',
    'dataTutorial.ai.one.time': '(low code, 10 min)',
    'dataTutorial.ai.one.description':
      'Obtén un script de Javascript para añadir un agente de IA a tu sitio web, o pruébalo directamente en el panel de administración. Indexa tu sitio o sube documentos para entrenar tu agente de IA a medida.',
    'dataTutorial.ai.one.answerDescription':
      'Aprovecha la ocasión para dar a tu widget de IA una imagen de marca: indica un nombre práctico y fácil de recordar, y define la ruta a un avatar local para que el widget encaje perfectamente con el diseño de tu proyecto. Una vez configurado todo, simplemente copia el código generado y pégalo justo antes del cierre de la etiqueta <body>: tu asistente de IA personalizado estará entonces totalmente listo para funcionar en tu aplicación o en tu sitio web. Rápido, sencillo y sin pasos adicionales.',
    'dataTutorial.ai.two.title': 'Widget de IA (plugin de WordPress)',
    'dataTutorial.ai.two.time': '(low code, 15 min)',
    'dataTutorial.ai.two.description':
      'Descarga e instala nuestro plugin de WordPress para lanzar un agente de IA en tu sitio web. Indexa tu sitio o sube documentos a través del panel de administración para gestionar el contexto.',
    'dataTutorial.ai.two.answerDescription':
      'Utiliza esta sección para definir la personalidad y el estilo de interacción de tu bot. Aquí puedes describir con detalle cómo debe responder el asistente a los usuarios, qué tareas debe realizar y qué tono de comunicación debe mantener. Si lo necesitas, añade también información importante sobre tu negocio para que el bot entienda las particularidades de tus productos y trabaje de la forma más precisa y eficaz posible.',
    'dataTutorial.ai.three.title': 'Aplicación web de IA',
    'dataTutorial.ai.three.time': '(no code, 15 min)',
    'dataTutorial.ai.three.description':
      'Lanza tu propia aplicación de agente de IA con una URL, un logotipo y una identidad de marca únicos. Indexa tu sitio o sube documentos para que tu agente de IA sea eficaz en tu caso de uso.',
    'dataTutorial.ai.three.answerTakeUserTo': 'Llevar al usuario a la pestaña',
    'dataTutorial.ai.three.answerBotLinkLabel': 'Bot de IA',
    'dataTutorial.ai.three.answerTab': '',

    'dataTutorial.answerTimeDefault': '5 a 15 minutos',

    'settingTutorialModal.chatList.title': 'Chat',
    'settingTutorialModal.chatList.subtitle':
      'Crea o integra una experiencia de mensajería instantánea.',
    'settingTutorialModal.aiList.title': 'IA',
    'settingTutorialModal.aiList.subtitle':
      'Despliega un agente de IA para tus visitantes o tu equipo.',

    'answerStep.answerLabel': 'Respuesta:',
    'answerStep.imageAlt': 'Animación de demostración',
    'answerStep.timeLabel': 'Tiempo: ',
    'answerStep.complexityLabel': 'Complejidad: ',

    'questionsStepDefault.title': 'Elige una configuración de chat',
    'questionsStepDefault.description': 'Quiero..',

    'stepChooseTutorial.noQuestions': 'No hay preguntas disponibles',
    'stepChooseTutorial.goStart': 'EMPEZAR',
    'stepChooseTutorial.imageAlt': 'Animación de demostración',

    'hubspotForm.notConfiguredError':
      'La reserva en línea no está configurada en esta instalación. Escribe a hello@ethora.com y programaremos una llamada.',
    'hubspotForm.recaptchaError':
      'La reserva en línea no está disponible temporalmente. Escribe a hello@ethora.com o contáctanos en el foro y programaremos una llamada.',
    'hubspotForm.genericError':
      'Lo sentimos, no hemos podido enviar tu solicitud. Escribe a hello@ethora.com en su lugar.',
    'hubspotForm.networkError':
      'Error de red: escribe a hello@ethora.com en su lugar.',
    'hubspotForm.successTitle': 'Gracias, ¡nos pondremos en contacto pronto!',
    'hubspotForm.successBody':
      'Nuestro equipo se pondrá en contacto contigo en breve para programar una llamada. Mientras tanto, siéntete libre de seguir explorando.',
    'hubspotForm.firstNamePlaceholder': 'Nombre',
    'hubspotForm.lastNamePlaceholder': 'Apellidos',
    'hubspotForm.emailPlaceholder': 'Correo electrónico',
    'hubspotForm.companyPlaceholder': 'Empresa',
    'hubspotForm.messagePlaceholder':
      '¿De qué te gustaría hablar? (opcional)',
    'hubspotForm.emailLinkText': 'Escribir a hello@ethora.com',
    'hubspotForm.sendingButton': 'Enviando...',
    'hubspotForm.submitButton': 'Solicitar una llamada',
  },
} satisfies Record<UiLanguageCode, Record<string, string>>;
