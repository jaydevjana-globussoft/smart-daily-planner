import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://smart-daily-planner-backend.onrender.com/api";

const PWAContext = createContext(null);

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PWAProvider({ children }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const userId = localStorage.getItem("userId");

  // Track install prompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      console.log("PWA installed successfully");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      setIsStandalone(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setInstallPrompt(null);
      return true;
    }
    return false;
  }, [installPrompt]);

  const subscribeToPush = useCallback(async () => {
    const currentUserId = localStorage.getItem("userId");
    if (!currentUserId) return false;

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push messaging is not supported in this browser");
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const { data } = await axios.get(`${API_BASE_URL}/notifications/vapid-public-key`);
      if (!data.success || !data.publicKey) {
        throw new Error("Failed to fetch VAPID public key");
      }

      const applicationServerKey = urlBase64ToUint8Array(data.publicKey);
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
      }

      await axios.post(`${API_BASE_URL}/notifications/subscribe`, {
        userId: currentUserId,
        subscription
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Failed to subscribe user to Web Push:", err);
      return false;
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return "default";
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === "granted") {
        await subscribeToPush();
      }
      return permission;
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return "default";
    }
  }, [subscribeToPush]);

  // Auto subscribe if user logs in and permission was already granted
  useEffect(() => {
    if (notificationPermission === "granted" && userId) {
      subscribeToPush();
    }
  }, [notificationPermission, userId, subscribeToPush]);

  return (
    <PWAContext.Provider
      value={{
        isInstallable: !!installPrompt && !isStandalone,
        installApp,
        notificationPermission,
        requestNotificationPermission,
        isSubscribed,
        subscribeToPush
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
