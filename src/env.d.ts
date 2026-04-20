/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_TOTI_JMRI_HOST?: string
  readonly VITE_TOTI_JMRI_PORT?: string
  readonly VITE_TOTI_JMRI_SECURE?: string
  readonly VITE_TOTI_MOCK?: string
  readonly VITE_TOTI_DEBUG?: string
  readonly VITE_TOTI_DCCEX_ENABLED?: string
  readonly VITE_TOTI_DCCEX_HOST?: string
  readonly VITE_TOTI_DCCEX_PORT?: string
  readonly VITE_TOTI_DCCEX_PWM_FREQ?: string
  readonly VITE_TOTI_HA_ENABLED?: string
  readonly VITE_TOTI_HA_URL?: string
  readonly VITE_TOTI_HA_TOKEN?: string
  readonly VITE_TOTI_HA_AREA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
