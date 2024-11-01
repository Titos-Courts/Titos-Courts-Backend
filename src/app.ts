import dotenv from 'dotenv';
import path from 'path';

const args = process.argv.slice(2);
const envPath = args.find((arg) => arg.startsWith('envPath='));

console.log(`envPath: ${envPath}`);

if (envPath) {
  dotenv.config({ path: path.resolve(envPath.split('=')[1], '.env') });
} else {
  const dir = __dirname.replace(/\/dist$/, '');
  dotenv.config({ path: path.resolve(dir, '.env') });
}

import express from 'express';
import { setupGlobalErrorHandler } from './exceptions/global-error-handler';
import { LoggerService } from './services/logger-service';
import appSetup from './startup/init';
import routers from './startup/router';
import securitySetup from './startup/security';

(async () => {
  try {
    const app = express();

    void appSetup(app);
    securitySetup(app, express);
    app.use('/titos-courts/v1/', routers());
    setupGlobalErrorHandler();
  } catch (error: any) {
    LoggerService.getInstance().logGeneral(
      `It was not possible to start the application: ${error}`,
      'app'
    );
  }
})();
