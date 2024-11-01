import bodyParser from 'body-parser';
import { Express } from 'express';
import typeORMConnect from '../databases/typeorm';
import { LoggerService } from '../services/logger-service';

const appSetup = async (app: Express) => {
  try {
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    LoggerService.getInstance().logGeneral('Databases connected!', 'app');
    await Promise.all([typeORMConnect()]);

    LoggerService.getInstance().logGeneral(
      'Databases connected successfully!',
      'app'
    );
    const PORT = Number(process.env.PORT) || 3001;
    LoggerService.getInstance().logGeneral(`Databases PORT! ${PORT}`, 'app');
    const server = app.listen(PORT, () => {
      LoggerService.getInstance().logGeneral(
        `Server started on port ${PORT}`,
        'app'
      );
    });
  } catch (error) {
    LoggerService.getInstance().logGeneral(
      `Unable to start the app!' ${error}`,
      'app'
    );
    console.error(error);
  }
};

export default appSetup;
