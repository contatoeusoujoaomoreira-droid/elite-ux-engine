import { useEffect } from "react";

interface EventData {
  eventName: string;
  eventData?: Record<string, any>;
  value?: number;
  currency?: string;
}

export function useEventForwarder() {
  useEffect(() => {
    // Expose global function for event forwarding
    (window as any).forwardEvent = (event: EventData) => {
      forwardEventToPixels(event);
    };

    return () => {
      delete (window as any).forwardEvent;
    };
  }, []);
}

export function forwardEventToPixels(event: EventData) {
  const { eventName, eventData = {}, value, currency } = event;

  // Forward to Meta Pixel (Facebook)
  if (typeof window !== "undefined" && (window as any).fbq) {
    try {
      // Standard events
      switch (eventName) {
        case "ViewContent":
          (window as any).fbq("track", "ViewContent", eventData);
          break;
        case "AddToCart":
          (window as any).fbq("track", "AddToCart", eventData);
          break;
        case "Purchase":
          (window as any).fbq("track", "Purchase", {
            value: value || 0,
            currency: currency || "BRL",
            ...eventData,
          });
          break;
        case "Lead":
          (window as any).fbq("track", "Lead", eventData);
          break;
        case "CompleteRegistration":
          (window as any).fbq("track", "CompleteRegistration", eventData);
          break;
        case "Contact":
          (window as any).fbq("track", "Contact", eventData);
          break;
        case "CustomEvent":
          (window as any).fbq("trackCustom", eventData.customEventName || "CustomEvent", eventData);
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
        eventData: eventData,
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

export function trackPlanClickWithPixels(planName: string, planDetails?: Record<string, any>) {
  forwardEventToPixels({
    eventName: "Lead",
    eventData: {
      content_name: `Plan: ${planName}`,
      content_type: "product",
      content_id: planName,
      ...planDetails,
    },
  });
}

export function trackContactWithPixels(contactData: Record<string, any>) {
  forwardEventToPixels({
    eventName: "Contact",
    eventData: contactData,
  });
}

export function trackViewContentWithPixels(contentData: Record<string, any>) {
  forwardEventToPixels({
    eventName: "ViewContent",
    eventData: contentData,
  });
}
