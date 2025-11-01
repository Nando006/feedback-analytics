import express from 'express';
import { User } from './endpoints/protected/user.js';
import { VerifyPhone } from './endpoints/protected/verify.js';
import { Enterprise } from './endpoints/protected/enterprise.js';
import { Metadados } from './endpoints/protected/metadados.js';
import { CollectingDataEnterprise } from './endpoints/protected/collectingDataEnterprise.js';
import { Email } from './endpoints/protected/email.js';
import { Feedbacks } from './endpoints/protected/feedbacks.js';
import { CollectionPointsQr } from './endpoints/protected/collectionPointsQr.js';

export function ProtectedRoutes(app: express.Express) {
  // Endpoints perfil do cliente (empresa)
  User(app);
  Enterprise(app);
  Metadados(app);
  Email(app);
  CollectingDataEnterprise(app);
  Feedbacks(app);
  CollectionPointsQr(app);

  // Endpoints de verificações
  VerifyPhone(app);
}
