import { LoggerService } from '../services/logger-service';

export function setupGlobalErrorHandler(): void {
  process.on('uncaughtException', (error: any) => {
    LoggerService.getInstance().logError(
      error.connection,
      `${error.name}: ${error.message}`
    );
  });
}
