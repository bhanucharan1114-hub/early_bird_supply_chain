/**
 * Analytics — Event Tracking
 *
 * Lightweight stubs that can be wired to PostHog, Mixpanel, or an internal
 * /api/analytics endpoint without changing call sites.
 *
 * In production, replace the no-op bodies with real tracking calls.
 */

export function trackAuthEvent(_eventName, _details = {}) {
  // e.g. posthog.capture(_eventName, _details);
}

export function trackAnalysisEvent(_eventName, _details = {}) {
  // e.g. posthog.capture(_eventName, _details);
}

export function trackFeatureUsage(_featureName, _details = {}) {
  // e.g. posthog.capture(_featureName, _details);
}

export function trackError(_errorType, _errorMessage) {
  // e.g. Sentry.captureMessage(`${_errorType}: ${_errorMessage}`);
}
