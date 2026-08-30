import { sanitizeRichText } from './sanitize-html.util';

describe('sanitizeRichText', () => {
  it('returns null for null/undefined and keeps an empty string empty', () => {
    expect(sanitizeRichText(null)).toBeNull();
    expect(sanitizeRichText(undefined)).toBeNull();
    expect(sanitizeRichText('')).toBe('');
  });

  it('keeps the ReactQuill-style allowed tags', () => {
    const html =
      '<h2>Titre</h2><p><strong>gras</strong> et <em>italique</em></p><ul><li>a</li></ul>';
    expect(sanitizeRichText(html)).toBe(html);
  });

  it('strips <script> and event-handler attributes', () => {
    const out = sanitizeRichText(
      '<p onclick="steal()">hi</p><script>alert(1)</script>',
    );
    expect(out).toBe('<p>hi</p>');
  });

  it('forces rel="noopener noreferrer" on links', () => {
    const out = sanitizeRichText('<a href="https://example.com">x</a>');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('href="https://example.com"');
  });

  it('drops javascript: URLs on links', () => {
    const out = sanitizeRichText('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });

  it('removes disallowed tags but keeps their text content', () => {
    const out = sanitizeRichText(
      '<div><table><tr><td>keep me</td></tr></table></div>',
    );
    expect(out).toBe('keep me');
  });
});
