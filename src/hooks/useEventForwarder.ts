import { useEffect, useRef } from "react";

interface EventData {
  eventName: string;
  eventData?: Record<string, any>;
  value?: number;
  currency?: string;
}

const eventQueue: EventData[] = [];

export function useEventForwarder() {
  const scriptsReady = useRef(false);

  useEffect(() => {
    const handleScriptsReady = () => {
      scriptsReady.current = true;
      processQueue();
    };

    window.addEventListener("scripts-ready", handleScriptsReady);

    // Expose global function for event forwarding
    (window as any).forwardEvent = (event: EventData) => {
      if (scriptsReady.current) {
        forwardEventToPixels(event);
      } else {
        eventQueue.push(event);
      }
    };

    return () => {
      window.removeEventListener("scripts-ready", handleScriptsReady);
      delete (window as any).forwardEvent;
    };
  }, []);
}

function processQueue() {
  while (eventQueue.length > 0) {
    const event = eventQueue.shift();
    if (event) forwardEventToPixels(event);
  }
}

export function forwardEventToPixels(event: EventData) {
  const { eventName, eventData = {}, value, currency } = event;

  // Forward to Meta Pixel (Facebook)
  if (typeof window !== "undefined" && (window as any).fbq) {
    try {
      switch (eventName) {
        case "PageView":
          (window as any).fbq("track", "PageView", eventData);
          break;
        case "Lead":
          (window as any).fbq("track", "Lead", eventData);
          break;
        case "Contact":
          (window as any).fbq("track", "Contact", eventData);
          break;
        default:
          (window as any).fbq("track", eventName, eventData);
      }
      console.log(`[Meta Pixel] Event forwarded: ${eventName}`, eventData);
    } catch (error) {
      console.error("[Meta Pixel] Error forwarding event:", error);
    }
  }

  // Forward to Google Analytics / Google Tag Manager
  if (typeof window !== "undefined" && (window as any).gtag) {
    try {
      const gaEventData: Record<string, any> = { ...eventData };
      if (value) gaEventData.value = value;
      if (currency) gaEventData.currency = currency;
      (window as any).gtag("event", eventName, gaEventData);
      console.log(`[Google Analytics] Event forwarded: ${eventName}`, gaEventData);
    } catch (error) {
      console.error("[Google Analytics] Error forwarding event:", error);
    }
  }

  // Forward to Google Tag Manager (dataLayer)
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    try {
      (window as any).dataLayer.push({
        event: eventName,
        ...eventData,
        value: value,
        currency: currency,
        timestamp: new Date().toISOString(),
      });
      console.log(`[Google Tag Manager] Event pushed: ${eventName}`, eventData);
    } catch (error) {
      console.error("[Google Tag Manager] Error pushing event:", error);
    }
  }
}
