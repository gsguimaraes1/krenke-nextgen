import DOMPurify from 'dompurify';

/**
 * Central HTML sanitizer for rich-text stored in the database (blog posts,
 * dynamic pages, product specs). Strips <script>, event-handler attributes
 * (onerror/onload/…) and javascript: URLs while preserving the formatting the
 * Quill editor produces. Use this on every dangerouslySetInnerHTML sink.
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
  });
}
