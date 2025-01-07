/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUGGING_FACE_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}