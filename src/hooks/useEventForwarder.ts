import { useEffect, useRef } from "react";

interface EventData {
  eventName: string;
  eventData?: Record<string, any>;
  value?: number;
  currency?: string;
}

const eventQueue: EventData[] = [];
let scriptsReadyGlobal = false;

export function useEventForwarder() {
  useEffect(() => {
    const handleScriptsReady = () => {
      scriptsReadyGlobal = true;
      processQueue();
    };

    window.addEventListener("scripts-ready", handleScriptsReady);

    // If scripts are already loaded (e.g. on re-mount)
    if ((window as any).fbq || (window as any).gtag || (window as any).dataLayer) {
      scriptsReadyGlobal = true;
      processQueue();
    }

    // Expose global function for event forwarding
    (window as any).forwardEvent = (event: EventData) => {
      forwardEventToPixels(event);
    };

    return () => {
      window.removeEventListener("scripts-ready", handleScriptsReady);
      // We don't delete forwardEvent to allow events from other parts of the app
    };
  }, []);
}

function processQueue() {
  console.log(`[EventForwarder] Processing queue of ${eventQueue.length} events`);
  while (eventQueue.length > 0) {
    const event = eventQueue.shift();
    if (event) forwardEventToPixels(event);
  }
}

export function forwardEventToPixels(event: EventData) {
  const { eventName, eventData = {}, value, currency } = event;

  const hasMeta = typeof window !== "undefined" && (window as any).fbq;
  const hasGA = typeof window !== "undefined" && (window as any).gtag;
  const hasGTM = typeof window !== "undefined" && (window as any).dataLayer;

  // If no pixel is ready yet, queue the event
  if (!hasMeta && !hasGA && !hasGTM && !scriptsReadyGlobal) {
    console.log(`[EventForwarder] Queuing event: ${eventName}`, eventData);
    eventQueue.push(event);
    return;
  }

  // Forward to Meta Pixel (Facebook)
  if (hasMeta) {
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
  if (hasGA) {
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
  if (hasGTM) {
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
