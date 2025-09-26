import express from 'express';
import 'dotenv/config';
import { HealthRoutes } from './routes/health';
import { PublicRoutes } from './routes/public';
import { ProtectedRoutes } from './routes/protected';

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
