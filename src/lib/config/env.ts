import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_ANALYSIS_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_REWRITE_MODEL: z.string().default('gemini-2.0-flash'),
});

type Env = z.infer<typeof envSchema>;

let env: Env | null = null;

export function validateEnv(): Env {
  if (env) return env;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.format();
    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(errors, null, 2)}`
    );
  }

  env = parsed.data;
  return env;
}

export function getEnv(): Env {
  return validateEnv();
}

export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    analysisModel: process.env.GEMINI_ANALYSIS_MODEL || 'gemini-2.0-flash',
    rewriteModel: process.env.GEMINI_REWRITE_MODEL || 'gemini-2.0-flash',
  },
};
