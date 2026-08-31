/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_R2_UPLOADS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
