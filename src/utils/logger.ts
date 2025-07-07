export const logger = {
  info: (message: string, data?: any) => createLog("INFO", message, data),
  debug: (message: string, data?: any) => createLog("DEBUG", message, data),
  warn: (message: string, data?: any) => createLog("WARN", message, data),
  error: (message: string, data?: any) => createLog("ERROR", message, data),
};

// Utility function to create structured logs
export function createLog(level: string, message: string, data?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data,
  };

  const logMessage = `[MCP] ${message}`;

  if (level === "ERROR") {
    console.error(logMessage, logEntry);
  } else if (level === "WARN") {
    console.warn(logMessage, logEntry);
  } else if (level === "INFO") {
    console.info(logMessage, logEntry);
  } else if (level === "DEBUG") {
    console.debug(logMessage, logEntry);
  } else {
    console.log(`[${level}] ${logMessage}`, logEntry);
  }
  return logEntry;
}
