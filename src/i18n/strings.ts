export type Lang = "es" | "en";

export const STRINGS: Record<Lang, Record<string, string>> = {
  es: {
    appName: "Noche de Caos",
    tagline: "Juegos sociales para romper el hielo 🔥",
    play: "Jugar",
    settings: "Ajustes",
    back: "Volver",
    language: "Idioma",
    music: "Música",
    musicOn: "Encendida",
    musicOff: "Apagada",
    volume: "Volumen",
    terms: "Términos y condiciones",
    termsTitle: "Términos y condiciones",
    termsIntro: "Al usar esta app aceptas estos términos. Léelos con calma.",
    termsBody:
      "1) Uso responsable.\n2) No recolectamos datos sensibles de forma intencional.\n3) El contenido es para entretenimiento.\n4) Podemos actualizar la app y estos términos.\n\nSi no estás de acuerdo, no uses la app.",
  },
  en: {
    appName: "Night of Chaos",
    tagline: "Social games to break the ice 🔥",
    play: "Play",
    settings: "Settings",
    back: "Back",
    language: "Language",
    music: "Music",
    musicOn: "On",
    musicOff: "Off",
    volume: "Volume",
    terms: "Terms & Conditions",
    termsTitle: "Terms & Conditions",
    termsIntro: "By using this app you agree to these terms. Please read them.",
    termsBody:
      "1) Use responsibly.\n2) We don’t intentionally collect sensitive data.\n3) Content is for entertainment.\n4) We may update the app and these terms.\n\nIf you disagree, do not use the app.",
  },
};
