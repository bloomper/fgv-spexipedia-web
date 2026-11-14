const ORIGIN = /^https?:\/\/[A-Za-z0-9.-]+(:\d+)?$/;

/**
 * The pages' Content Security Policy. Spexipedia's own images come from {@code MEDIA_ORIGIN} (its web's hostname,
 * under /media/, in production), and the photos and videos of people from Spexgram's media server
 * ({@code SPEXGRAM_MEDIA_ORIGIN}). Both differ per environment, so the policy is built at request time (in
 * {@code proxy.ts}) rather than fixed at build time in next.config.ts. Anything that is not an origin is left out.
 */
export function contentSecurityPolicy(mediaOrigins: (string | undefined)[], development: boolean): string {
  const media = [...new Set(mediaOrigins.filter((origin): origin is string => !!origin && ORIGIN.test(origin)))]
    .map(origin => ` ${origin}`)
    .join("");

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: https:${media}`,
    `media-src 'self' blob:${media}`,
    "font-src 'self'",
    `connect-src 'self'${media}`,
    "frame-src 'none'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}
