import express from 'express';
import 'dotenv/config';
import { RegisterHealthRoutes } from './routes/health';
import { RegisterAuthRoutes } from './routes/auth';

const app = express();
app.use(express.json());

app.set('trust proxy', 1);

RegisterHealthRoutes(app);
RegisterAuthRoutes(app);

const port = Number(process.env.PORT ?? 3000);
app.listen(port);
