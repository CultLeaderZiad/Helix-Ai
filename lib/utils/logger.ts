const PII_PATTERNS = [
  /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, // Emails
  /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g, // Phone numbers
]

export function redactPII(text: string): string {
  let redacted = text
  for (const pattern of PII_PATTERNS) {
    redacted = redacted.replace(pattern, '[REDACTED]')
  }
  return redacted
}

export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(redactPII(msg), meta ? JSON.parse(redactPII(JSON.stringify(meta))) : '')
  },
  warn: (msg: string, meta?: any) => {
    console.warn(redactPII(msg), meta ? JSON.parse(redactPII(JSON.stringify(meta))) : '')
  },
  error: (msg: string, meta?: any) => {
    console.error(redactPII(msg), meta ? JSON.parse(redactPII(JSON.stringify(meta))) : '')
  }
}
