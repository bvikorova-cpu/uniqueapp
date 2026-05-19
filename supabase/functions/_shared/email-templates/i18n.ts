/// <reference types="npm:@types/react@18.3.1" />

// Supported languages mirror the in-app i18n config.
export const SUPPORTED_EMAIL_LANGS = [
  'en', 'sk', 'cs', 'de', 'es', 'fr', 'it', 'hu', 'ru', 'ja', 'ko', 'zh',
] as const

export type EmailLang = typeof SUPPORTED_EMAIL_LANGS[number]

export type EmailKey =
  | 'signup'
  | 'invite'
  | 'magiclink'
  | 'recovery'
  | 'email_change'
  | 'reauthentication'

export interface EmailStrings {
  subject: string
  preview: string
  heading: string
  intro: string        // shown as the main body text (no links)
  recipientLabel?: string
  button?: string
  codePrompt?: string  // reauthentication: "Use the code below"
  emailChangeIntro?: string // email_change: includes {oldEmail} -> {newEmail}
  emailChangeClick?: string
  footer: string
  signature: string
}

type AllStrings = Record<EmailKey, EmailStrings>

const SITE = 'Unique'

const en: AllStrings = {
  signup: {
    subject: 'Confirm your email',
    preview: `Welcome to ${SITE} — confirm your email`,
    heading: `Welcome to ${SITE} ✨`,
    intro: `Thanks for joining ${SITE}! Please confirm your email address to unlock your account.`,
    recipientLabel: 'Email',
    button: 'Confirm Email',
    footer: "If you didn't create an account, you can safely ignore this email.",
    signature: `— The ${SITE} Team`,
  },
  invite: {
    subject: "You've been invited",
    preview: `You're invited to join ${SITE}`,
    heading: "You're invited 💌",
    intro: `You've been invited to join ${SITE}. Accept your invitation to get started.`,
    button: 'Accept Invitation',
    footer: "If you weren't expecting this invitation, you can safely ignore it.",
    signature: `— The ${SITE} Team`,
  },
  magiclink: {
    subject: 'Your login link',
    preview: `Your ${SITE} login link`,
    heading: 'Your login link 🪄',
    intro: `Tap the button below to sign in to ${SITE}. This link is valid for a short time.`,
    button: 'Sign In',
    footer: "If you didn't request this link, you can safely ignore this email.",
    signature: `— The ${SITE} Team`,
  },
  recovery: {
    subject: 'Reset your password',
    preview: `Reset your ${SITE} password`,
    heading: 'Reset your password 🔐',
    intro: `We received a request to reset the password for your ${SITE} account. Tap the button below to set a new one.`,
    button: 'Reset Password',
    footer: "If you didn't request a password reset, you can safely ignore this email.",
    signature: `— The ${SITE} Team`,
  },
  email_change: {
    subject: 'Confirm your new email',
    preview: `Confirm your ${SITE} email change`,
    heading: 'Confirm your email change ✉️',
    intro: `You requested to change your ${SITE} email address.`,
    emailChangeIntro: 'From {oldEmail} to {newEmail}.',
    emailChangeClick: 'Click the button below to confirm this change:',
    button: 'Confirm Email Change',
    footer: "If you didn't request this change, please contact support immediately.",
    signature: `— The ${SITE} Team`,
  },
  reauthentication: {
    subject: 'Your verification code',
    preview: `Your ${SITE} verification code`,
    heading: 'Confirm reauthentication 🔒',
    intro: 'Use the code below to confirm your identity:',
    codePrompt: 'Use the code below to confirm your identity:',
    footer: "If you didn't request this code, you can safely ignore this email.",
    signature: `— The ${SITE} Team`,
  },
}

const sk: AllStrings = {
  signup: {
    subject: 'Potvrď svoj e-mail',
    preview: `Vitaj v ${SITE} — potvrď svoj e-mail`,
    heading: `Vitaj v ${SITE} ✨`,
    intro: `Ďakujeme, že si sa pridal/a do ${SITE}! Potvrď svoju e-mailovú adresu a odomkni účet.`,
    recipientLabel: 'E-mail',
    button: 'Potvrdiť e-mail',
    footer: 'Ak si si účet nevytvoril/a, tento e-mail môžeš ignorovať.',
    signature: `— Tím ${SITE}`,
  },
  invite: {
    subject: 'Máš pozvánku',
    preview: `Pozývame ťa do ${SITE}`,
    heading: 'Máš pozvánku 💌',
    intro: `Bol/a si pozvaný/á do ${SITE}. Prijmi pozvánku a začni.`,
    button: 'Prijať pozvánku',
    footer: 'Ak si pozvánku nečakal/a, môžeš tento e-mail ignorovať.',
    signature: `— Tím ${SITE}`,
  },
  magiclink: {
    subject: 'Tvoj prihlasovací odkaz',
    preview: `Tvoj ${SITE} prihlasovací odkaz`,
    heading: 'Tvoj prihlasovací odkaz 🪄',
    intro: `Kliknutím na tlačidlo sa prihlásiš do ${SITE}. Odkaz je platný len krátky čas.`,
    button: 'Prihlásiť sa',
    footer: 'Ak si o odkaz nepožiadal/a, tento e-mail môžeš ignorovať.',
    signature: `— Tím ${SITE}`,
  },
  recovery: {
    subject: 'Obnov svoje heslo',
    preview: `Obnov si heslo v ${SITE}`,
    heading: 'Obnov svoje heslo 🔐',
    intro: `Prijali sme žiadosť o obnovenie hesla pre tvoj ${SITE} účet. Klikni na tlačidlo a nastav nové.`,
    button: 'Obnoviť heslo',
    footer: 'Ak si o obnovu hesla nepožiadal/a, tento e-mail môžeš ignorovať.',
    signature: `— Tím ${SITE}`,
  },
  email_change: {
    subject: 'Potvrď nový e-mail',
    preview: `Potvrď zmenu e-mailu v ${SITE}`,
    heading: 'Potvrď zmenu e-mailu ✉️',
    intro: `Požiadal/a si o zmenu e-mailovej adresy v ${SITE}.`,
    emailChangeIntro: 'Z {oldEmail} na {newEmail}.',
    emailChangeClick: 'Kliknutím na tlačidlo zmenu potvrdíš:',
    button: 'Potvrdiť zmenu e-mailu',
    footer: 'Ak si o túto zmenu nepožiadal/a, ihneď kontaktuj podporu.',
    signature: `— Tím ${SITE}`,
  },
  reauthentication: {
    subject: 'Tvoj overovací kód',
    preview: `Tvoj ${SITE} overovací kód`,
    heading: 'Potvrď opätovné prihlásenie 🔒',
    intro: 'Použi nižšie uvedený kód na potvrdenie identity:',
    codePrompt: 'Použi nižšie uvedený kód na potvrdenie identity:',
    footer: 'Ak si o kód nepožiadal/a, tento e-mail môžeš ignorovať.',
    signature: `— Tím ${SITE}`,
  },
}

const cs: AllStrings = {
  signup: {
    subject: 'Potvrď svůj e-mail',
    preview: `Vítej v ${SITE} — potvrď svůj e-mail`,
    heading: `Vítej v ${SITE} ✨`,
    intro: `Děkujeme, že ses připojil/a k ${SITE}! Potvrď svou e-mailovou adresu a odemkni účet.`,
    recipientLabel: 'E-mail',
    button: 'Potvrdit e-mail',
    footer: 'Pokud sis účet nevytvořil/a, můžeš tento e-mail ignorovat.',
    signature: `— Tým ${SITE}`,
  },
  invite: {
    subject: 'Máš pozvánku',
    preview: `Zveme tě do ${SITE}`,
    heading: 'Máš pozvánku 💌',
    intro: `Byl/a jsi pozván/a do ${SITE}. Přijmi pozvánku a začni.`,
    button: 'Přijmout pozvánku',
    footer: 'Pokud jsi pozvánku nečekal/a, můžeš tento e-mail ignorovat.',
    signature: `— Tým ${SITE}`,
  },
  magiclink: {
    subject: 'Tvůj přihlašovací odkaz',
    preview: `Tvůj ${SITE} přihlašovací odkaz`,
    heading: 'Tvůj přihlašovací odkaz 🪄',
    intro: `Kliknutím na tlačítko se přihlásíš do ${SITE}. Odkaz je platný jen krátkou dobu.`,
    button: 'Přihlásit se',
    footer: 'Pokud jsi o odkaz nežádal/a, můžeš tento e-mail ignorovat.',
    signature: `— Tým ${SITE}`,
  },
  recovery: {
    subject: 'Obnov si heslo',
    preview: `Obnov si heslo v ${SITE}`,
    heading: 'Obnov si heslo 🔐',
    intro: `Přijali jsme žádost o obnovení hesla pro tvůj ${SITE} účet. Klikni na tlačítko a nastav si nové.`,
    button: 'Obnovit heslo',
    footer: 'Pokud jsi o obnovení hesla nežádal/a, můžeš tento e-mail ignorovat.',
    signature: `— Tým ${SITE}`,
  },
  email_change: {
    subject: 'Potvrď nový e-mail',
    preview: `Potvrď změnu e-mailu v ${SITE}`,
    heading: 'Potvrď změnu e-mailu ✉️',
    intro: `Požádal/a jsi o změnu e-mailové adresy v ${SITE}.`,
    emailChangeIntro: 'Z {oldEmail} na {newEmail}.',
    emailChangeClick: 'Kliknutím na tlačítko změnu potvrdíš:',
    button: 'Potvrdit změnu e-mailu',
    footer: 'Pokud jsi o tuto změnu nežádal/a, ihned kontaktuj podporu.',
    signature: `— Tým ${SITE}`,
  },
  reauthentication: {
    subject: 'Tvůj ověřovací kód',
    preview: `Tvůj ${SITE} ověřovací kód`,
    heading: 'Potvrď opětovné přihlášení 🔒',
    intro: 'Použij níže uvedený kód k potvrzení identity:',
    codePrompt: 'Použij níže uvedený kód k potvrzení identity:',
    footer: 'Pokud jsi o kód nežádal/a, můžeš tento e-mail ignorovat.',
    signature: `— Tým ${SITE}`,
  },
}

const de: AllStrings = {
  signup: {
    subject: 'Bestätige deine E-Mail',
    preview: `Willkommen bei ${SITE} — bestätige deine E-Mail`,
    heading: `Willkommen bei ${SITE} ✨`,
    intro: `Danke, dass du ${SITE} beigetreten bist! Bitte bestätige deine E-Mail-Adresse, um dein Konto freizuschalten.`,
    recipientLabel: 'E-Mail',
    button: 'E-Mail bestätigen',
    footer: 'Wenn du kein Konto erstellt hast, kannst du diese E-Mail ignorieren.',
    signature: `— Das ${SITE} Team`,
  },
  invite: {
    subject: 'Du wurdest eingeladen',
    preview: `Du bist eingeladen, ${SITE} beizutreten`,
    heading: 'Du bist eingeladen 💌',
    intro: `Du wurdest eingeladen, ${SITE} beizutreten. Nimm die Einladung an, um loszulegen.`,
    button: 'Einladung annehmen',
    footer: 'Wenn du diese Einladung nicht erwartet hast, kannst du sie ignorieren.',
    signature: `— Das ${SITE} Team`,
  },
  magiclink: {
    subject: 'Dein Login-Link',
    preview: `Dein ${SITE} Login-Link`,
    heading: 'Dein Login-Link 🪄',
    intro: `Tippe auf den Button unten, um dich bei ${SITE} anzumelden. Dieser Link ist nur kurze Zeit gültig.`,
    button: 'Anmelden',
    footer: 'Wenn du diesen Link nicht angefordert hast, kannst du diese E-Mail ignorieren.',
    signature: `— Das ${SITE} Team`,
  },
  recovery: {
    subject: 'Passwort zurücksetzen',
    preview: `Setze dein ${SITE} Passwort zurück`,
    heading: 'Passwort zurücksetzen 🔐',
    intro: `Wir haben eine Anfrage zum Zurücksetzen deines ${SITE} Passworts erhalten. Tippe auf den Button, um ein neues festzulegen.`,
    button: 'Passwort zurücksetzen',
    footer: 'Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren.',
    signature: `— Das ${SITE} Team`,
  },
  email_change: {
    subject: 'Bestätige deine neue E-Mail',
    preview: `Bestätige deine ${SITE} E-Mail-Änderung`,
    heading: 'Bestätige die E-Mail-Änderung ✉️',
    intro: `Du hast eine Änderung deiner ${SITE} E-Mail-Adresse beantragt.`,
    emailChangeIntro: 'Von {oldEmail} zu {newEmail}.',
    emailChangeClick: 'Klicke auf den Button, um die Änderung zu bestätigen:',
    button: 'E-Mail-Änderung bestätigen',
    footer: 'Wenn du das nicht beantragt hast, kontaktiere bitte sofort den Support.',
    signature: `— Das ${SITE} Team`,
  },
  reauthentication: {
    subject: 'Dein Verifizierungscode',
    preview: `Dein ${SITE} Verifizierungscode`,
    heading: 'Erneute Authentifizierung 🔒',
    intro: 'Verwende den folgenden Code, um deine Identität zu bestätigen:',
    codePrompt: 'Verwende den folgenden Code, um deine Identität zu bestätigen:',
    footer: 'Wenn du diesen Code nicht angefordert hast, kannst du diese E-Mail ignorieren.',
    signature: `— Das ${SITE} Team`,
  },
}

const es: AllStrings = {
  signup: {
    subject: 'Confirma tu correo',
    preview: `Te damos la bienvenida a ${SITE} — confirma tu correo`,
    heading: `Bienvenido/a a ${SITE} ✨`,
    intro: `¡Gracias por unirte a ${SITE}! Confirma tu dirección de correo para desbloquear tu cuenta.`,
    recipientLabel: 'Correo',
    button: 'Confirmar correo',
    footer: 'Si no creaste una cuenta, puedes ignorar este correo.',
    signature: `— El equipo de ${SITE}`,
  },
  invite: {
    subject: 'Has sido invitado',
    preview: `Estás invitado a unirte a ${SITE}`,
    heading: 'Estás invitado 💌',
    intro: `Has sido invitado a unirte a ${SITE}. Acepta tu invitación para comenzar.`,
    button: 'Aceptar invitación',
    footer: 'Si no esperabas esta invitación, puedes ignorarla.',
    signature: `— El equipo de ${SITE}`,
  },
  magiclink: {
    subject: 'Tu enlace de acceso',
    preview: `Tu enlace de acceso a ${SITE}`,
    heading: 'Tu enlace de acceso 🪄',
    intro: `Toca el botón para iniciar sesión en ${SITE}. Este enlace es válido por poco tiempo.`,
    button: 'Iniciar sesión',
    footer: 'Si no solicitaste este enlace, puedes ignorar este correo.',
    signature: `— El equipo de ${SITE}`,
  },
  recovery: {
    subject: 'Restablece tu contraseña',
    preview: `Restablece tu contraseña de ${SITE}`,
    heading: 'Restablece tu contraseña 🔐',
    intro: `Recibimos una solicitud para restablecer la contraseña de tu cuenta de ${SITE}. Toca el botón para crear una nueva.`,
    button: 'Restablecer contraseña',
    footer: 'Si no solicitaste esto, puedes ignorar este correo.',
    signature: `— El equipo de ${SITE}`,
  },
  email_change: {
    subject: 'Confirma tu nuevo correo',
    preview: `Confirma el cambio de correo en ${SITE}`,
    heading: 'Confirma el cambio de correo ✉️',
    intro: `Solicitaste cambiar tu correo en ${SITE}.`,
    emailChangeIntro: 'De {oldEmail} a {newEmail}.',
    emailChangeClick: 'Haz clic en el botón para confirmar el cambio:',
    button: 'Confirmar cambio',
    footer: 'Si no solicitaste este cambio, contacta con soporte de inmediato.',
    signature: `— El equipo de ${SITE}`,
  },
  reauthentication: {
    subject: 'Tu código de verificación',
    preview: `Tu código de verificación de ${SITE}`,
    heading: 'Confirma la reautenticación 🔒',
    intro: 'Usa el código siguiente para confirmar tu identidad:',
    codePrompt: 'Usa el código siguiente para confirmar tu identidad:',
    footer: 'Si no solicitaste este código, puedes ignorar este correo.',
    signature: `— El equipo de ${SITE}`,
  },
}

const fr: AllStrings = {
  signup: {
    subject: 'Confirme ton e-mail',
    preview: `Bienvenue sur ${SITE} — confirme ton e-mail`,
    heading: `Bienvenue sur ${SITE} ✨`,
    intro: `Merci d'avoir rejoint ${SITE} ! Confirme ton adresse e-mail pour débloquer ton compte.`,
    recipientLabel: 'E-mail',
    button: "Confirmer l'e-mail",
    footer: "Si tu n'as pas créé de compte, tu peux ignorer cet e-mail.",
    signature: `— L'équipe ${SITE}`,
  },
  invite: {
    subject: 'Tu as été invité',
    preview: `Tu es invité à rejoindre ${SITE}`,
    heading: 'Tu es invité 💌',
    intro: `Tu as été invité à rejoindre ${SITE}. Accepte l'invitation pour commencer.`,
    button: "Accepter l'invitation",
    footer: "Si tu n'attendais pas cette invitation, tu peux l'ignorer.",
    signature: `— L'équipe ${SITE}`,
  },
  magiclink: {
    subject: 'Ton lien de connexion',
    preview: `Ton lien de connexion ${SITE}`,
    heading: 'Ton lien de connexion 🪄',
    intro: `Clique sur le bouton pour te connecter à ${SITE}. Ce lien est valable peu de temps.`,
    button: 'Se connecter',
    footer: "Si tu n'as pas demandé ce lien, tu peux ignorer cet e-mail.",
    signature: `— L'équipe ${SITE}`,
  },
  recovery: {
    subject: 'Réinitialise ton mot de passe',
    preview: `Réinitialise ton mot de passe ${SITE}`,
    heading: 'Réinitialise ton mot de passe 🔐',
    intro: `Nous avons reçu une demande de réinitialisation de mot de passe pour ton compte ${SITE}. Clique sur le bouton pour en créer un nouveau.`,
    button: 'Réinitialiser le mot de passe',
    footer: "Si tu n'as rien demandé, tu peux ignorer cet e-mail.",
    signature: `— L'équipe ${SITE}`,
  },
  email_change: {
    subject: 'Confirme ton nouvel e-mail',
    preview: `Confirme le changement d'e-mail ${SITE}`,
    heading: "Confirme le changement d'e-mail ✉️",
    intro: `Tu as demandé à changer ton adresse e-mail ${SITE}.`,
    emailChangeIntro: 'De {oldEmail} à {newEmail}.',
    emailChangeClick: 'Clique sur le bouton pour confirmer ce changement :',
    button: "Confirmer le changement",
    footer: "Si tu n'as pas demandé ce changement, contacte immédiatement le support.",
    signature: `— L'équipe ${SITE}`,
  },
  reauthentication: {
    subject: 'Ton code de vérification',
    preview: `Ton code de vérification ${SITE}`,
    heading: 'Confirme la ré-authentification 🔒',
    intro: 'Utilise le code ci-dessous pour confirmer ton identité :',
    codePrompt: 'Utilise le code ci-dessous pour confirmer ton identité :',
    footer: "Si tu n'as pas demandé ce code, tu peux ignorer cet e-mail.",
    signature: `— L'équipe ${SITE}`,
  },
}

const it: AllStrings = {
  signup: {
    subject: 'Conferma la tua email',
    preview: `Benvenuto su ${SITE} — conferma la tua email`,
    heading: `Benvenuto su ${SITE} ✨`,
    intro: `Grazie per esserti unito a ${SITE}! Conferma il tuo indirizzo email per sbloccare l'account.`,
    recipientLabel: 'Email',
    button: 'Conferma email',
    footer: 'Se non hai creato un account, puoi ignorare questa email.',
    signature: `— Il team ${SITE}`,
  },
  invite: {
    subject: 'Sei stato invitato',
    preview: `Sei invitato a unirti a ${SITE}`,
    heading: 'Sei invitato 💌',
    intro: `Sei stato invitato a unirti a ${SITE}. Accetta l'invito per iniziare.`,
    button: 'Accetta invito',
    footer: 'Se non ti aspettavi questo invito, puoi ignorarlo.',
    signature: `— Il team ${SITE}`,
  },
  magiclink: {
    subject: 'Il tuo link di accesso',
    preview: `Il tuo link di accesso a ${SITE}`,
    heading: 'Il tuo link di accesso 🪄',
    intro: `Tocca il pulsante per accedere a ${SITE}. Questo link è valido per poco tempo.`,
    button: 'Accedi',
    footer: 'Se non hai richiesto questo link, puoi ignorare questa email.',
    signature: `— Il team ${SITE}`,
  },
  recovery: {
    subject: 'Reimposta la password',
    preview: `Reimposta la tua password ${SITE}`,
    heading: 'Reimposta la password 🔐',
    intro: `Abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account ${SITE}. Tocca il pulsante per impostarne una nuova.`,
    button: 'Reimposta password',
    footer: 'Se non hai richiesto questo, puoi ignorare questa email.',
    signature: `— Il team ${SITE}`,
  },
  email_change: {
    subject: 'Conferma la nuova email',
    preview: `Conferma il cambio email ${SITE}`,
    heading: 'Conferma il cambio email ✉️',
    intro: `Hai richiesto di cambiare il tuo indirizzo email ${SITE}.`,
    emailChangeIntro: 'Da {oldEmail} a {newEmail}.',
    emailChangeClick: 'Clicca sul pulsante per confermare il cambio:',
    button: 'Conferma cambio email',
    footer: 'Se non hai richiesto questo cambio, contatta subito il supporto.',
    signature: `— Il team ${SITE}`,
  },
  reauthentication: {
    subject: 'Il tuo codice di verifica',
    preview: `Il tuo codice di verifica ${SITE}`,
    heading: 'Conferma riautenticazione 🔒',
    intro: 'Usa il codice qui sotto per confermare la tua identità:',
    codePrompt: 'Usa il codice qui sotto per confermare la tua identità:',
    footer: 'Se non hai richiesto questo codice, puoi ignorare questa email.',
    signature: `— Il team ${SITE}`,
  },
}

const hu: AllStrings = {
  signup: {
    subject: 'Erősítsd meg az e-mailed',
    preview: `Üdv a ${SITE} oldalon — erősítsd meg az e-mailed`,
    heading: `Üdv a ${SITE} oldalon ✨`,
    intro: `Köszönjük, hogy csatlakoztál a ${SITE} oldalhoz! Erősítsd meg az e-mail címed a fiók aktiválásához.`,
    recipientLabel: 'E-mail',
    button: 'E-mail megerősítése',
    footer: 'Ha nem te hoztad létre a fiókot, nyugodtan figyelmen kívül hagyhatod ezt az e-mailt.',
    signature: `— A ${SITE} csapata`,
  },
  invite: {
    subject: 'Meghívást kaptál',
    preview: `Meghívást kaptál a ${SITE} oldalra`,
    heading: 'Meghívást kaptál 💌',
    intro: `Meghívást kaptál a ${SITE} oldalra. Fogadd el a meghívást, hogy elkezdhesd.`,
    button: 'Meghívás elfogadása',
    footer: 'Ha nem számítottál erre a meghívásra, figyelmen kívül hagyhatod.',
    signature: `— A ${SITE} csapata`,
  },
  magiclink: {
    subject: 'Bejelentkezési linked',
    preview: `${SITE} bejelentkezési linked`,
    heading: 'Bejelentkezési linked 🪄',
    intro: `Koppints a gombra a ${SITE} oldalra való belépéshez. Ez a link csak rövid ideig érvényes.`,
    button: 'Bejelentkezés',
    footer: 'Ha nem kérted ezt a linket, figyelmen kívül hagyhatod az e-mailt.',
    signature: `— A ${SITE} csapata`,
  },
  recovery: {
    subject: 'Jelszó visszaállítása',
    preview: `Állítsd vissza a ${SITE} jelszavad`,
    heading: 'Jelszó visszaállítása 🔐',
    intro: `Kérést kaptunk a ${SITE} fiókod jelszavának visszaállítására. Koppints a gombra az új jelszó beállításához.`,
    button: 'Jelszó visszaállítása',
    footer: 'Ha nem kérted ezt, figyelmen kívül hagyhatod az e-mailt.',
    signature: `— A ${SITE} csapata`,
  },
  email_change: {
    subject: 'Erősítsd meg az új e-mailed',
    preview: `Erősítsd meg a ${SITE} e-mail-változtatást`,
    heading: 'Erősítsd meg az e-mail-változtatást ✉️',
    intro: `Kérted, hogy módosítsd a ${SITE} e-mail címed.`,
    emailChangeIntro: 'Erről: {oldEmail} erre: {newEmail}.',
    emailChangeClick: 'Koppints a gombra a változtatás megerősítéséhez:',
    button: 'Változtatás megerősítése',
    footer: 'Ha nem te kérted ezt a változtatást, azonnal lépj kapcsolatba az ügyfélszolgálattal.',
    signature: `— A ${SITE} csapata`,
  },
  reauthentication: {
    subject: 'Hitelesítési kódod',
    preview: `${SITE} hitelesítési kódod`,
    heading: 'Erősítsd meg az újrahitelesítést 🔒',
    intro: 'Használd az alábbi kódot az azonosság megerősítéséhez:',
    codePrompt: 'Használd az alábbi kódot az azonosság megerősítéséhez:',
    footer: 'Ha nem kérted ezt a kódot, figyelmen kívül hagyhatod az e-mailt.',
    signature: `— A ${SITE} csapata`,
  },
}

const ru: AllStrings = {
  signup: {
    subject: 'Подтвердите свою почту',
    preview: `Добро пожаловать в ${SITE} — подтвердите почту`,
    heading: `Добро пожаловать в ${SITE} ✨`,
    intro: `Спасибо, что присоединились к ${SITE}! Подтвердите адрес электронной почты, чтобы активировать аккаунт.`,
    recipientLabel: 'Email',
    button: 'Подтвердить почту',
    footer: 'Если вы не создавали аккаунт, просто проигнорируйте это письмо.',
    signature: `— Команда ${SITE}`,
  },
  invite: {
    subject: 'Вас пригласили',
    preview: `Вас приглашают присоединиться к ${SITE}`,
    heading: 'Вас пригласили 💌',
    intro: `Вас пригласили присоединиться к ${SITE}. Примите приглашение, чтобы начать.`,
    button: 'Принять приглашение',
    footer: 'Если вы не ждали этого приглашения, просто проигнорируйте письмо.',
    signature: `— Команда ${SITE}`,
  },
  magiclink: {
    subject: 'Ссылка для входа',
    preview: `Ссылка для входа в ${SITE}`,
    heading: 'Ссылка для входа 🪄',
    intro: `Нажмите кнопку, чтобы войти в ${SITE}. Ссылка действует короткое время.`,
    button: 'Войти',
    footer: 'Если вы не запрашивали ссылку, просто проигнорируйте письмо.',
    signature: `— Команда ${SITE}`,
  },
  recovery: {
    subject: 'Сброс пароля',
    preview: `Сбросьте пароль в ${SITE}`,
    heading: 'Сброс пароля 🔐',
    intro: `Мы получили запрос на сброс пароля для вашего аккаунта в ${SITE}. Нажмите кнопку, чтобы задать новый пароль.`,
    button: 'Сбросить пароль',
    footer: 'Если вы не запрашивали сброс, просто проигнорируйте письмо.',
    signature: `— Команда ${SITE}`,
  },
  email_change: {
    subject: 'Подтвердите новую почту',
    preview: `Подтвердите смену почты в ${SITE}`,
    heading: 'Подтвердите смену почты ✉️',
    intro: `Вы запросили смену адреса электронной почты в ${SITE}.`,
    emailChangeIntro: 'С {oldEmail} на {newEmail}.',
    emailChangeClick: 'Нажмите кнопку, чтобы подтвердить изменение:',
    button: 'Подтвердить смену',
    footer: 'Если вы не запрашивали смену, немедленно свяжитесь с поддержкой.',
    signature: `— Команда ${SITE}`,
  },
  reauthentication: {
    subject: 'Код подтверждения',
    preview: `Ваш код подтверждения ${SITE}`,
    heading: 'Подтвердите повторную аутентификацию 🔒',
    intro: 'Используйте код ниже, чтобы подтвердить личность:',
    codePrompt: 'Используйте код ниже, чтобы подтвердить личность:',
    footer: 'Если вы не запрашивали код, просто проигнорируйте письмо.',
    signature: `— Команда ${SITE}`,
  },
}

const ja: AllStrings = {
  signup: {
    subject: 'メールアドレスを確認してください',
    preview: `${SITE} へようこそ — メールを確認してください`,
    heading: `${SITE} へようこそ ✨`,
    intro: `${SITE} へのご登録ありがとうございます！メールアドレスを確認してアカウントを有効化してください。`,
    recipientLabel: 'メール',
    button: 'メールを確認',
    footer: 'もしアカウントを作成していない場合は、このメールを無視してください。',
    signature: `— ${SITE} チーム`,
  },
  invite: {
    subject: '招待が届きました',
    preview: `${SITE} への招待`,
    heading: '招待が届きました 💌',
    intro: `${SITE} への招待を受け取りました。招待を承認して始めましょう。`,
    button: '招待を承認',
    footer: '心当たりがない場合は、このメールを無視してください。',
    signature: `— ${SITE} チーム`,
  },
  magiclink: {
    subject: 'ログインリンク',
    preview: `${SITE} のログインリンク`,
    heading: 'ログインリンク 🪄',
    intro: `下のボタンをタップして ${SITE} にログインしてください。このリンクは短時間のみ有効です。`,
    button: 'ログイン',
    footer: 'リンクを要求していない場合は、このメールを無視してください。',
    signature: `— ${SITE} チーム`,
  },
  recovery: {
    subject: 'パスワードをリセット',
    preview: `${SITE} のパスワードをリセット`,
    heading: 'パスワードをリセット 🔐',
    intro: `${SITE} アカウントのパスワードリセットのリクエストを受け取りました。下のボタンから新しいパスワードを設定してください。`,
    button: 'パスワードをリセット',
    footer: 'リクエストしていない場合は、このメールを無視してください。',
    signature: `— ${SITE} チーム`,
  },
  email_change: {
    subject: '新しいメールを確認',
    preview: `${SITE} のメール変更を確認`,
    heading: 'メール変更の確認 ✉️',
    intro: `${SITE} のメールアドレス変更をリクエストしました。`,
    emailChangeIntro: '{oldEmail} から {newEmail} へ。',
    emailChangeClick: '下のボタンをクリックして変更を確認してください:',
    button: 'メール変更を確認',
    footer: '心当たりがない場合は、すぐにサポートまでご連絡ください。',
    signature: `— ${SITE} チーム`,
  },
  reauthentication: {
    subject: '確認コード',
    preview: `${SITE} の確認コード`,
    heading: '再認証の確認 🔒',
    intro: '本人確認のため、以下のコードを使用してください:',
    codePrompt: '本人確認のため、以下のコードを使用してください:',
    footer: 'リクエストしていない場合は、このメールを無視してください。',
    signature: `— ${SITE} チーム`,
  },
}

const ko: AllStrings = {
  signup: {
    subject: '이메일을 확인하세요',
    preview: `${SITE}에 오신 것을 환영합니다 — 이메일 확인`,
    heading: `${SITE}에 오신 것을 환영합니다 ✨`,
    intro: `${SITE}에 가입해 주셔서 감사합니다! 이메일 주소를 확인하여 계정을 활성화하세요.`,
    recipientLabel: '이메일',
    button: '이메일 확인',
    footer: '계정을 만들지 않으셨다면 이 이메일을 무시하셔도 됩니다.',
    signature: `— ${SITE} 팀`,
  },
  invite: {
    subject: '초대받으셨습니다',
    preview: `${SITE}에 초대받으셨습니다`,
    heading: '초대받으셨습니다 💌',
    intro: `${SITE}에 초대받으셨습니다. 초대를 수락하여 시작하세요.`,
    button: '초대 수락',
    footer: '예상치 못한 초대라면 무시하셔도 됩니다.',
    signature: `— ${SITE} 팀`,
  },
  magiclink: {
    subject: '로그인 링크',
    preview: `${SITE} 로그인 링크`,
    heading: '로그인 링크 🪄',
    intro: `버튼을 눌러 ${SITE}에 로그인하세요. 이 링크는 짧은 시간 동안만 유효합니다.`,
    button: '로그인',
    footer: '요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.',
    signature: `— ${SITE} 팀`,
  },
  recovery: {
    subject: '비밀번호 재설정',
    preview: `${SITE} 비밀번호 재설정`,
    heading: '비밀번호 재설정 🔐',
    intro: `${SITE} 계정의 비밀번호 재설정 요청을 받았습니다. 버튼을 눌러 새 비밀번호를 설정하세요.`,
    button: '비밀번호 재설정',
    footer: '요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.',
    signature: `— ${SITE} 팀`,
  },
  email_change: {
    subject: '새 이메일 확인',
    preview: `${SITE} 이메일 변경 확인`,
    heading: '이메일 변경 확인 ✉️',
    intro: `${SITE} 이메일 주소 변경을 요청하셨습니다.`,
    emailChangeIntro: '{oldEmail}에서 {newEmail}(으)로.',
    emailChangeClick: '버튼을 클릭하여 변경을 확인하세요:',
    button: '이메일 변경 확인',
    footer: '요청하지 않으셨다면 즉시 지원팀에 문의해 주세요.',
    signature: `— ${SITE} 팀`,
  },
  reauthentication: {
    subject: '인증 코드',
    preview: `${SITE} 인증 코드`,
    heading: '재인증 확인 🔒',
    intro: '본인 확인을 위해 아래 코드를 사용하세요:',
    codePrompt: '본인 확인을 위해 아래 코드를 사용하세요:',
    footer: '요청하지 않으셨다면 이 이메일을 무시하셔도 됩니다.',
    signature: `— ${SITE} 팀`,
  },
}

const zh: AllStrings = {
  signup: {
    subject: '请确认你的邮箱',
    preview: `欢迎加入 ${SITE} — 请确认邮箱`,
    heading: `欢迎加入 ${SITE} ✨`,
    intro: `感谢加入 ${SITE}！请确认你的邮箱地址以激活账户。`,
    recipientLabel: '邮箱',
    button: '确认邮箱',
    footer: '如果不是你创建的账户，可以忽略此邮件。',
    signature: `— ${SITE} 团队`,
  },
  invite: {
    subject: '你收到了邀请',
    preview: `你受邀加入 ${SITE}`,
    heading: '你收到了邀请 💌',
    intro: `你受邀加入 ${SITE}。接受邀请即可开始。`,
    button: '接受邀请',
    footer: '如果你并未期待此邀请,可以忽略。',
    signature: `— ${SITE} 团队`,
  },
  magiclink: {
    subject: '你的登录链接',
    preview: `你的 ${SITE} 登录链接`,
    heading: '你的登录链接 🪄',
    intro: `点击下方按钮即可登录 ${SITE}。此链接有效期较短。`,
    button: '登录',
    footer: '如果你没有请求此链接,可以忽略此邮件。',
    signature: `— ${SITE} 团队`,
  },
  recovery: {
    subject: '重置密码',
    preview: `重置你的 ${SITE} 密码`,
    heading: '重置密码 🔐',
    intro: `我们收到了重置 ${SITE} 账户密码的请求。点击下方按钮设置新密码。`,
    button: '重置密码',
    footer: '如果你没有请求重置,可以忽略此邮件。',
    signature: `— ${SITE} 团队`,
  },
  email_change: {
    subject: '确认新邮箱',
    preview: `确认 ${SITE} 邮箱更改`,
    heading: '确认邮箱更改 ✉️',
    intro: `你请求更改 ${SITE} 邮箱地址。`,
    emailChangeIntro: '从 {oldEmail} 更改为 {newEmail}。',
    emailChangeClick: '点击下方按钮确认更改:',
    button: '确认邮箱更改',
    footer: '如果不是你请求的,请立即联系支持。',
    signature: `— ${SITE} 团队`,
  },
  reauthentication: {
    subject: '你的验证码',
    preview: `你的 ${SITE} 验证码`,
    heading: '确认重新验证 🔒',
    intro: '请使用下方验证码确认你的身份:',
    codePrompt: '请使用下方验证码确认你的身份:',
    footer: '如果你没有请求验证码,可以忽略此邮件。',
    signature: `— ${SITE} 团队`,
  },
}

export const EMAIL_TRANSLATIONS: Record<EmailLang, AllStrings> = {
  en, sk, cs, de, es, fr, it, hu, ru, ja, ko, zh,
}

export function getEmailStrings(lang: string | null | undefined, key: EmailKey): EmailStrings {
  const safeLang = (lang && (SUPPORTED_EMAIL_LANGS as readonly string[]).includes(lang)
    ? lang
    : 'en') as EmailLang
  return EMAIL_TRANSLATIONS[safeLang][key]
}

// Standard HTML lang attribute per locale.
export const HTML_LANG_BY_CODE: Record<EmailLang, string> = {
  en: 'en', sk: 'sk', cs: 'cs', de: 'de', es: 'es', fr: 'fr', it: 'it',
  hu: 'hu', ru: 'ru', ja: 'ja', ko: 'ko', zh: 'zh',
}
