// ===========================================
// LIFELINK - Winston Logger
// ===========================================

import winston from 'winston';
import config from '../config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: config.app.isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'lifelink-api' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

if (!config.app.isProduction) {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
} else {
  // In production (Render), log to stdout/stderr for log aggregation
  logger.add(
    new winston.transports.Console({
      format: combine(logFormat),
    })
  );
}

export default logger;
