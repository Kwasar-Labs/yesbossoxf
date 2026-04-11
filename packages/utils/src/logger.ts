type LogLevel = "info" | "warn" | "error" | "debug";

function formatMessage(level: LogLevel, service: string, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] [${service}]`;
  if (meta) {
    return `${base} ${message} ${JSON.stringify(meta)}`;
  }
  return `${base} ${message}`;
}

export function createLogger(service: string) {
  return {
    info: (message: string, meta?: unknown) => console.log(formatMessage("info", service, message, meta)),
    warn: (message: string, meta?: unknown) => console.warn(formatMessage("warn", service, message, meta)),
    error: (message: string, meta?: unknown) => console.error(formatMessage("error", service, message, meta)),
    debug: (message: string, meta?: unknown) => {
      if (process.env.LOG_LEVEL === "debug") {
        console.log(formatMessage("debug", service, message, meta));
      }
    },
  };
}
