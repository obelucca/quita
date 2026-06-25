const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Declare global window properties for type safety
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Log standard page view event
 */
export const pageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

/**
 * General event tracking utility
 */
export const trackEvent = (
  action: string,
  category?: string,
  label?: string,
  value?: number,
  params?: Record<string, any>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
};

/**
 * Track wizard start event
 */
export const wizardStart = () => {
  trackEvent("wizard_started", "wizard", "Wizard Started");
};

/**
 * Track wizard step completed
 */
export const wizardStepCompleted = (stepNumber: number, stepName: string) => {
  trackEvent("wizard_step_completed", "wizard", `Step ${stepNumber}: ${stepName}`, stepNumber);
};

/**
 * Track wizard completion event
 */
export const wizardFinish = () => {
  trackEvent("wizard_finished", "wizard", "Wizard Finished");
};

/**
 * Track document generation
 */
export const trackComplaintGenerated = (bankName: string) => {
  trackEvent("complaint_generated", "complaint", bankName);
};

/**
 * Track PDF downloads
 */
export const trackComplaintDownloaded = (complaintId: string) => {
  trackEvent("complaint_downloaded", "complaint", complaintId);
};

/**
 * Track checkout started
 */
export const trackCheckoutStarted = (value: number) => {
  trackEvent("checkout_started", "purchase", "Checkout Started", value);
};

/**
 * Track purchase / payment success
 */
export const purchase = (transactionId: string, value: number, credits: number) => {
  trackEvent("purchase", "purchase", `Credits: ${credits}`, value, {
    transaction_id: transactionId,
    value: value,
    currency: "BRL",
    items: [
      {
        item_id: "credits",
        item_name: `Pack of ${credits} Credits`,
        price: value,
        quantity: 1,
      },
    ],
  });
};

/**
 * Track checkout failure
 */
export const trackCheckoutFailed = (errorMessage: string) => {
  trackEvent("checkout_failed", "purchase", errorMessage);
};

/**
 * Track credit consumption
 */
export const trackCreditsConsumed = (amount: number) => {
  trackEvent("credits_consumed", "credit", "Credits Consumed", amount);
};

/**
 * Track specific CTA clicks
 */
export const trackCtaClick = (ctaName: string, location: string) => {
  trackEvent("cta_clicked", "engagement", ctaName, undefined, {
    cta_location: location,
  });
};
