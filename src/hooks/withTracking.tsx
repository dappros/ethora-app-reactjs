import { initializeApp } from "@firebase/app";
import { getAnalytics, logEvent } from "@firebase/analytics";
import {ComponentType, useEffect, useState} from "react";
import type { FirebaseApp } from "@firebase/app";
import Clarity from '@microsoft/clarity';
import {useAppStore} from "../store/useAppStore.ts";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

let firebaseApp: FirebaseApp | null = null;
let analytics: ReturnType<typeof getAnalytics> | null = null;
let sessionStartTime: number | null = null;

export function withTracking<T>(Component: ComponentType<T>) {
  return function TrackedComponent(props: T) {
    const [isInitialized, setIsInitialized] = useState(false);
    const config = useAppStore((state) => state.currentApp?.firebaseConfigParsed);

    useEffect(() => {
      if (!config) {
        console.warn("Firebase config is not available yet");
        return;
      }

      if (isInitialized) return;

      const firebaseConfig: FirebaseConfig = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        measurementId: config.messagingSenderId,
      };

      const allowedDomains =
        import.meta.env.VITE_APP_ALLOWED_DOMAINS?.split(",") || [];
      const currentDomain = window.location.hostname;

      if (!allowedDomains.includes(currentDomain)) {
        console.warn(`Tracking is disabled on ${currentDomain}`);
        return;
      }


      if (!firebaseApp) {
        firebaseApp = initializeApp(firebaseConfig);
        analytics = getAnalytics(firebaseApp);
        logEvent(analytics, "session_start");
      }

      try {
        Clarity.init(import.meta.env.VITE_CLARITY_ID);
        console.log("Microsoft Clarity started");
      } catch (error) {
        console.error("Microsoft Clarity failed to start", error);
      }

      sessionStartTime = Date.now();

      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const elementName = target.tagName.toLowerCase();

        if (target.tagName === "BUTTON" || target.tagName === "A" || target.dataset.track) {
          const text = target.textContent?.trim().substring(0, 50);
          logEvent(analytics!, "click", { element: elementName, text });
          console.log(`🔥 Click tracked: ${elementName} - ${text}`);
        }
      };

      document.addEventListener("click", handleClick);

      const handleBeforeUnload = () => {
        logSessionDuration();
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      setIsInitialized(true);

      return () => {
        document.removeEventListener("click", handleClick);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        logSessionDuration();
      };
    }, [config, isInitialized]);

    return <Component {...props} logLogin={logLogin} logLogout={logLogout} />;
  };
}

const logSessionDuration = () => {
  if (analytics && sessionStartTime) {
    const sessionDuration = (Date.now() - sessionStartTime) / 1000;
    if (sessionDuration >= 2) {
      logEvent(analytics, "session_duration", { duration: sessionDuration });
      console.log(`ession duration logged: ${sessionDuration}s`);
    } else {
      console.warn("Session too short (<2s), ignoring.");
    }
  }
};

export const logLogin = (method: string, userId?: string) => {
  if (analytics) {
    logEvent(analytics, "login", { method, userId });
  }

  if (sessionStartTime) {
    const sessionDuration = (Date.now() - sessionStartTime) / 1000;
    if (sessionDuration < 2) {
      console.warn("Session too short (<2s), ignoring.");
    } else {
      if (analytics) {
        logEvent(analytics, "session_duration", {duration: sessionDuration});
      }
      console.log(`Session duration logged: ${sessionDuration}s`);
    }
  }

  logSessionDuration();
  sessionStartTime = Date.now();
};

export const logLogout = () => {
  logSessionDuration();

  if (analytics) {
    logEvent(analytics, "session_end");
  }
  sessionStartTime = null;
  }
