import express from 'express';
import 'dotenv/config';
import { EndpointsHealth } from './endpoints/public/EndpointHealth.js';
import { EndpointsAuth } from './endpoints/public/EndpointsAuth.js';
import { EndpointsCallback } from './endpoints/public/EndpointsCallback.js';
import { EndpointsRegister } from './endpoints/public/EndpointsRegister.js';
import { EndpointsEnterprise as EndpointsEnterprisePublic } from './endpoints/public/EndpointsEnterprise.js';
import { EndpointsQRCode } from './endpoints/public/EndpointsQRCode.js';
import { EndpointsEnterprise as EndpointsEnterpriseProtected } from './endpoints/protected/EndpointsEnterprise.js';
import { EndpointsCollectionPointsQRCode } from './endpoints/protected/EndpointsCollectionPointsQRCode.js';
import { EndpointsFeedbacks } from './endpoints/protected/EndpointsFeedbacks.js';
import { EndpointsUser } from './endpoints/protected/EndpointsUser.js';


// Criando o servidor.
const app = express();

// Configurando o express para usar JSON.
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Configurando o proxy.
app.set('trust proxy', 1);

// Endpoints Públicos
EndpointsHealth(app);
EndpointsAuth(app);
EndpointsCallback(app);
EndpointsRegister(app);
EndpointsEnterprisePublic(app);
EndpointsQRCode(app);

// Endpoints Protegidos
EndpointsCollectionPointsQRCode(app);
EndpointsEnterpriseProtected(app);
EndpointsFeedbacks(app);
EndpointsUser(app);

// Iniciando o servidor.
const port = Number(process.env.PORT ?? 3000);
app.listen(port);
