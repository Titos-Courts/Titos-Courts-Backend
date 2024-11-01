import cors from 'cors';
import { Express } from 'express';
import session from 'express-session';

const securitySetup = (app: Express, express: any) => {
  app.use(cors()).use(express.json());
  app.use(
    session({
      secret: 'This is a secret',
      resave: false,
      saveUninitialized: false,
    })
  );
};

export default securitySetup;
