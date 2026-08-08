// Restricts read results to publicly visible content for anonymous/USER
// requests, while EDITOR/ADMIN callers bypass the restriction entirely.
export function publicationFilter(isPrivileged: boolean) {
  if (isPrivileged) return {};
  return {
    isPublished: true,
    OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
  };
}
