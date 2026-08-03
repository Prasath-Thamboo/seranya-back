import sanitizeHtml from 'sanitize-html';

// Allowlist matches the default ReactQuill toolbar used in the admin editor
// (bold/italic/underline/strike, headers, lists, blockquote, link, image).
const options: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'span', 'sub', 'sup',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    span: ['style'],
  },
  allowedStyles: {
    span: {
      color: [/^#[0-9a-fA-F]{3,6}$/],
      'background-color': [/^#[0-9a-fA-F]{3,6}$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
  },
};

export function sanitizeRichText(input?: string | null): string | null {
  if (!input) return input ?? null;
  return sanitizeHtml(input, options);
}
