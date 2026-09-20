export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

declare global {
  interface Window {
    __focusInstallPrompt?: BeforeInstallPromptEvent;
  }
}

export function setupInstallPromptCapture() {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    window.__focusInstallPrompt = event as BeforeInstallPromptEvent;
    window.dispatchEvent(new Event("focus-pwa-install-available"));
  });

  window.addEventListener("appinstalled", () => {
    window.__focusInstallPrompt = undefined;
    window.dispatchEvent(new Event("focus-pwa-installed"));
  });
}

export function canInstallPWA() {
  return Boolean(window.__focusInstallPrompt);
}

export async function installPWA() {
  const prompt = window.__focusInstallPrompt;
  if (!prompt) return false;

  await prompt.prompt();
  const choice = await prompt.userChoice;
  if (choice.outcome === "accepted") {
    window.__focusInstallPrompt = undefined;
    return true;
  }
  return false;
}

export function isStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}


export async function registerFocusServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.warn("No se pudo registrar el service worker:", error);
    return null;
  }
}
