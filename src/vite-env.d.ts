/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ARC_SHA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
