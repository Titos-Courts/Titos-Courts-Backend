import fs from 'fs-extra';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export class LoggerService {
  private static instance: LoggerService;
  private loggerMap: Map<string, winston.Logger>;
  private readonly LOG_DIR = 'logs';

  private constructor() {
    this.loggerMap = new Map();
    // Ensure the logs directory exists
    fs.ensureDirSync(this.LOG_DIR);
  }

  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  private createLoggerForConnection(processName: string): winston.Logger {
    const connectionDir = path.join(this.LOG_DIR, processName);
    fs.ensureDirSync(connectionDir);

    const myFormat = winston.format.printf(({ message }) => {
      return `${message}`;
    });

    const logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), myFormat),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
          // Step 2 & 3: Use DailyRotateFile with size option
          filename: `${processName}-%DATE%.log`,
          datePattern: 'YYYY',
          dirname: connectionDir,
          maxSize: '10m', // Rotate files after 10 megabytes
          zippedArchive: true, // Enable zipping of old log files
        }),
      ],
    });

    return logger;
  }

  private getLogger(processName: string): any {
    if (!this.loggerMap.has(processName)) {
      const logger = this.createLoggerForConnection(processName);
      this.loggerMap.set(processName, logger);
    }
    return this.loggerMap.get(processName);
  }

  private async log(
    processName: string,
    level: string,
    message: string
  ): Promise<void> {
    const logMessage = this.formatMessage(processName, level, message);
    const logger = this.getLogger(processName);

    try {
      logger.log({ level, message: logMessage });
    } catch (error) {}
  }

  public async logInfo(processName: any, message: string): Promise<void> {
    await this.log(processName, 'info', message);
  }

  public async logError(processName: any, message: string): Promise<void> {
    await this.log(processName, 'error', message);
  }

  public async logWarn(processName: any, message: string): Promise<void> {
    await this.log(processName, 'warn', message);
  }

  public async logGeneral(message: string, processName: string): Promise<void> {
    const defaultLogger = this.getLogger('app');
    const newMessage = this.formatGeneralMessage(processName, 'info', message);
    if (message) defaultLogger.info(newMessage);
  }

  private formatMessage(
    processName: string,
    level: string,
    message: string
  ): string {
    const timestamp = new Date().toISOString();
    return `${timestamp} [${processName}] [${level}]: ${message}`;
  }

  private formatGeneralMessage(
    processName: string,
    level: string,
    message: string
  ): string {
    // This regex matches any pattern that starts with '[', followed by any characters except ']', and ends with ']'
    const regex = /\[[^\]]+\]/;
    if (!regex.test(message)) {
      return this.formatMessage(processName, level, message);
    }

    return message;
  }
}
