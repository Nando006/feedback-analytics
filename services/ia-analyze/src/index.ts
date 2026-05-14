import 'dotenv/config';
import express from 'express';
import iaAnalyzeRoutes from './routes/iaAnalyze.routes.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json());

app.use('/internal', iaAnalyzeRoutes);

if (process.env.VERCEL !== '1') {
  const port = Number(process.env.PORT ?? 4100);

  app.listen(port, () => {
    console.log(`[ia-analyze] running at http://localhost:${port}`);
  });
}

export default app;
