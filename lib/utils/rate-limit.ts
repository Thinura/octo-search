export function localizeRateLimitMessage(message: string) {
  const marker = "Try again after ";
  const index = message.indexOf(marker);
  if (index === -1) return message;
  const tail = message.slice(index + marker.length);
  const endIndex = tail.indexOf(" or ");
  const rawDate = (endIndex === -1 ? tail : tail.slice(0, endIndex)).trim();
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return message;
  const formatted = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
  const prefix = message.slice(0, index + marker.length);
  const suffix = endIndex === -1 ? "" : tail.slice(endIndex);
  return `${prefix}${formatted}${suffix}`;
}
