interface OneSignalWebSdk {
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
}

type OneSignalDeferredCallback = (oneSignal: OneSignalWebSdk) => void | Promise<void>;

declare global {
  interface Window {
    OneSignalDeferred?: OneSignalDeferredCallback[];
  }
}

function withOneSignal(callback: OneSignalDeferredCallback) {
  if (typeof window === "undefined") {
    return;
  }

  window.OneSignalDeferred = window.OneSignalDeferred ?? [];
  window.OneSignalDeferred.push(callback);
}

export function identifyOneSignalUser(userId: number) {
  withOneSignal(async (oneSignal) => {
    try {
      await oneSignal.login(String(userId));
    } catch (error) {
      console.warn("[OneSignal] Failed to identify VIC user", error);
    }
  });
}

export function clearOneSignalUser() {
  withOneSignal(async (oneSignal) => {
    try {
      await oneSignal.logout();
    } catch (error) {
      console.warn("[OneSignal] Failed to clear VIC user", error);
    }
  });
}
