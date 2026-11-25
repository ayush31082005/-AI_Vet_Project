export const loginForBooking = target => `/login?returnTo=${encodeURIComponent(target)}`;

export function bookingReturnTarget(search) {
  const target = new URLSearchParams(search).get('returnTo');
  if (!target) return null;
  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname !== '/appointments') return null;
    return url.pathname + url.search + '#appointment-form';
  } catch {
    return null;
  }
}
