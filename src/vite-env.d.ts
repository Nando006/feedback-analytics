/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Adicione outras variáveis de ambiente que você usar aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
