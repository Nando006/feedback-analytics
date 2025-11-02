import express from 'express';
import { EndpointGetCallback } from './endpoints/public/EndpointCallback.js';
import { EndpointPostRegister } from './endpoints/public/EndpointRegister.js';
import { EndpointPostQRCodeFeedback } from './endpoints/public/EndpointQRCode.js';
import { EndpointGetEnterprisePublic } from './endpoints/public/EndpointEnterprise.js';
import { EndpointPostLogin, EndpointPostLogout } from './endpoints/public/EndpointAuth.js';

export function PublicRoutes(app: express.Express) {
  EndpointGetCallback(app);
  EndpointGetEnterprisePublic(app);

  EndpointPostLogin(app);
  EndpointPostLogout(app);
  EndpointPostRegister(app);
  EndpointPostQRCodeFeedback(app);
}
