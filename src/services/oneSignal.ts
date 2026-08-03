interface OneSignalWebSdk {
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
  Notifications: {
    permission: boolean;
    isPushSupported: () => boolean;
  };
  Slidedown: {
    promptPush: () => Promise<void>;
  };
  User: {
    PushSubscription: {
      optedIn: boolean;
      optIn: () => Promise<void>;
    };
  };
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

      if (!oneSignal.Notifications.isPushSupported()) {
        return;
      }

      if (oneSignal.Notifications.permission) {
        if (!oneSignal.User.PushSubscription.optedIn) {
          await oneSignal.User.PushSubscription.optIn();
        }
        return;
      }

      await oneSignal.Slidedown.promptPush();
    } catch (error) {
      console.warn("[OneSignal] Failed to identify or subscribe VIC user", error);
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
