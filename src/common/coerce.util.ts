// Multipart/form-data bodies (used wherever a route also accepts file uploads)
// always arrive as strings, even for boolean fields ("true"/"false"). The global
// ValidationPipe here runs with transform:false, so DTO validation only rejects
// non-boolean-looking strings — it never coerces the value actually handed to the
// service. Use this wherever such a field reaches Prisma, which requires a real
// boolean.
export function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  return value === 'true';
}
