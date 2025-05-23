import express from 'express';
import cors from 'cors';
import { environment } from './environments/environment';
import {
  AdspId,
  ServiceMetricsValueDefinition,
  initializeService,
  instrumentAxios,
} from '@abgov/adsp-service-sdk';
import helmet from 'helmet';
import { createLogger } from '@abgov/adsp-service-sdk/src/utils';
import { configurePassport } from './access/configure';
import * as passport from 'passport';
import { applyGatewayMiddleware } from './routes/listings';
import compression from 'compression';
import { getCache } from './cache';

const logger = createLogger('cc_api', environment.LOG_LEVEL);

const initializeApp = async (): Promise<express.Application> => {
  const app = express();

  app.use(helmet());
  app.use(
    cors((_, callback) => {
      const allowList = environment.ALLOWED_ORIGINS?.split(',') || [];

      callback(null, {
        origin:
          environment.NODE_ENV?.toLowerCase() === 'development'
            ? '*' // allow all origins for local development
            : allowList,
      });
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  instrumentAxios(logger);

  const serviceId = AdspId.parse(environment.CLIENT_ID);
  const accessServiceUrl = new URL(environment.KEYCLOAK_ROOT_URL);
  const cache = getCache(logger);

  const {
    healthCheck,
    metricsHandler,
    traceHandler,
    tenantStrategy,
    directory,
    tokenProvider,
  } = await initializeService(
    {
      serviceId,
      realm: environment.REALM,
      displayName: 'cc_api gateway',
      description:
        'Gateway to provide anonymous and session access to some common capabilities app functionality.',
      values: [ServiceMetricsValueDefinition],
      clientSecret: environment.CLIENT_SECRET,
      accessServiceUrl,
      directoryUrl: new URL(environment.DIRECTORY_URL),
    },
    { logger },
  );

  configurePassport(app, passport, { tenantStrategy });

  app.use(metricsHandler);
  app.use(traceHandler);

  app.use('/cc', passport.authenticate(['tenant'], { session: false }));

  await applyGatewayMiddleware(app, {
    logger,
    directory,
    offlineAccessTokenProvider: tokenProvider,
    cache,
  });

  app.get('/health', async (req, res) => {
    const platform = await healthCheck();
    res.json(platform);
  });

  return app;
};

initializeApp().then((app) => {
  const port = environment.PORT ? Number(environment.PORT) : 3333;
  app.listen(port, () => {
    console.log(`[ ready ] ${environment.PORT}`);
  });
});
