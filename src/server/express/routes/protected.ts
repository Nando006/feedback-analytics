import express from 'express';
import { User } from './endpoints/protected/user';
import { VerifyPhone } from './endpoints/protected/verify';
import { Enterprise } from './endpoints/protected/enterprise';
import { Metadados } from './endpoints/protected/metadados';
import { CollectingDataEnterprise } from './endpoints/protected/collectingDataEnterprise';
import { Email } from './endpoints/protected/email';

export function ProtectedRoutes(app: express.Express) {
  // Endpoints perfil do cliente (empresa)
  User(app);
  Enterprise(app);
  Metadados(app);
  Email(app);
  CollectingDataEnterprise(app);

  // Endpoints de verificações
  VerifyPhone(app);
}
