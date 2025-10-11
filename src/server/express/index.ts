import express from 'express';
import 'dotenv/config';
import { HealthRoutes } from './routes/health.js';
import { PublicRoutes } from './routes/public.js';
import { ProtectedRoutes } from './routes/protected.js';

// Criando o servidor.
const app = express();

// Configurando o express para usar JSON.
app.use(express.json());

// Configurando o proxy.
app.set('trust proxy', 1);

// Rotas (Endpoints)
HealthRoutes(app);
PublicRoutes(app);
ProtectedRoutes(app);

// Iniciando o servidor.
const port = Number(process.env.PORT ?? 3000);
app.listen(port);
