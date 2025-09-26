/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Adicione outras variáveis de ambiente que você usar aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
