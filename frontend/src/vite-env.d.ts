/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Support both NEXT_PUBLIC_ and VITE_ prefixes for Vercel deployment
  readonly NEXT_PUBLIC_API_URL?: string;
  readonly VITE_API_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_BUNNY_CDN_HOSTNAME?: string;
  readonly VITE_BUNNY_CDN_HOSTNAME?: string;
  readonly BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
