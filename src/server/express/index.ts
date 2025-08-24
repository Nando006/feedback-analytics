import express from 'express';
import 'dotenv/config';
import { HealthRoutes } from './routes/health';
import { PublicRoutes } from './routes/public';
import { ProtectedRoutes } from './routes/protected';

const app = express();
app.use(express.json());

app.set('trust proxy', 1);

// Rotas (Endpoints)
HealthRoutes(app);
PublicRoutes(app);
ProtectedRoutes(app);

const port = Number(process.env.PORT ?? 3000);
app.listen(port);
