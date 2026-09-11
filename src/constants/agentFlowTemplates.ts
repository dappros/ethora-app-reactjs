// Ethora.com platform, copyright: Dappros Ltd (c) 2026, all rights reserved
//
// Starter scripts for the Agent Flows tab. Each is a complete, valid flows
// document an operator can paste, save, and then edit. The authoring format is
// documented next to the compiler (ethora-backend/services/api/src/modules/
// agents/flows/compileFlows.js) and in the ai README; keep these in step with
// it. Reserved key `start` is the opening menu.

export type AgentFlowTemplate = {
  id: string
  label: string
  yaml: string
}

export const agentFlowTemplates: AgentFlowTemplate[] = [
  {
    id: 'opening-menu',
    label: 'Opening menu',
    yaml: `version: 1
flows:
  start:
    steps:
      - say: "Hi! I'm your assistant. What can I help you with today?"
        buttons:
          - { label: "Ask a question", end: true }
          - { label: "Talk to a human", goto: contact }

  contact:
    description: "Take contact details so a person can follow up"
    trigger: { phrases: ["talk to a human", "speak to someone", "contact"] }
    steps:
      - ask: "Sure. What's your name?"
        id: name
      - ask: "And the best email to reach you at?"
        id: email
        type: email
        retry: "That doesn't look like an email address. Could you check it?"
      - say: "Thanks {name}, someone will email you at {email} shortly."
      - end: true
`,
  },
  {
    id: 'appointment',
    label: 'Appointment request',
    yaml: `version: 1
flows:
  start:
    steps:
      - say: "Welcome! How can I help you today?"
        buttons:
          - { label: "Request appointment", goto: appointment }
          - { label: "Opening hours", end: true }
          - { label: "Something else", end: true }

  appointment:
    description: "Collect an appointment request (location, reason, contact)"
    trigger: { phrases: ["appointment", "book a visit", "see a doctor"] }
    steps:
      - ask: "Which location suits you best?"
        id: location
        options: [Downtown, Westside, Online]
      - ask: "What is the visit about?"
        id: reason
        options: [Routine check-up, New symptoms, Follow-up, Other]
      - ask: "Do you have a preferred date? (e.g. 2026-10-05)"
        id: date
        type: date
        required: false
        retry: "Please give a date like 2026-10-05, or say 'skip'."
      - ask: "What's the best phone number to reach you?"
        id: phone
        type: phone
        retry: "That doesn't look like a phone number. Could you check it?"
      - say: "Thanks! We'll call {phone} to confirm a {reason} visit at {location}."
        when: location != Online
      - say: "Thanks! We'll call {phone} with a video link for your {reason} visit."
        when: location == Online
      - end: true
`,
  },
  {
    id: 'lead-capture',
    label: 'Lead capture',
    yaml: `version: 1
flows:
  start:
    steps:
      - say: "Hi there! Want a quick quote, or do you have a question?"
        buttons:
          - { label: "Get a quote", goto: quote }
          - { label: "I have a question", end: true }

  quote:
    description: "Qualify a lead and collect contact details for a quote"
    trigger: { phrases: ["quote", "pricing", "how much"] }
    steps:
      - ask: "What size is your team?"
        id: team_size
        options: ["1-10", "11-50", "51-200", "200+"]
      - ask: "What's your work email?"
        id: email
        type: email
      - ask: "Anything specific you'd like the quote to cover?"
        id: notes
        required: false
      - say: "Thanks! A quote for a {team_size} team is on its way to {email}."
      - end: true
`,
  },
  {
    id: 'intake',
    label: 'Intake questionnaire',
    yaml: `version: 1
flows:
  intake:
    description: "New patient intake questionnaire"
    trigger: { phrases: ["intake", "new patient", "register"] }
    steps:
      - say: "Let's get you registered. This takes about a minute; you can type 'cancel' at any time."
      - ask: "Your full name?"
        id: name
      - ask: "Date of birth? (yyyy-mm-dd)"
        id: dob
        type: date
      - ask: "Do you have any allergies?"
        id: allergies
        options: [No, Yes]
      - ask: "Please list them."
        id: allergy_list
        when: allergies == Yes
      - ask: "Are you currently taking any medication?"
        id: medication
        options: [No, Yes]
      - ask: "Which ones?"
        id: medication_list
        when: medication == Yes
      - say: "Thank you, {name}. Your intake is complete; a member of staff will review it before your visit."
      - end: true
`,
  },
  {
    id: 'feedback',
    label: 'Feedback survey',
    yaml: `version: 1
flows:
  feedback:
    description: "Short satisfaction survey"
    trigger: { phrases: ["feedback", "survey", "rate"] }
    steps:
      - ask: "How would you rate your experience today?"
        id: rating
        options: ["1", "2", "3", "4", "5"]
      - ask: "What could we do better?"
        id: improve
        required: false
        when: rating != 5
      - ask: "What did you like most?"
        id: liked
        required: false
        when: rating == 5
      - say: "Thanks for the feedback!"
      - end: true
`,
  },
]
