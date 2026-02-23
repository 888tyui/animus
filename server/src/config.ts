import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for production security'),
  GITHUB_TOKEN: z.string().min(1, 'GITHUB_TOKEN is required — generate at https://github.com/settings/tokens'),
  SOLANA_RPC_URL: z.string().url().optional().default('https://api.mainnet-beta.solana.com'),
  PORT: z.coerce.number().int().positive().optional().default(4000),
  CORS_ORIGIN: z.string().optional().default('http://localhost:3000'),
})

function loadConfig() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('Invalid environment variables:')
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
  }
  return result.data
}

export const config = loadConfig()
export type Config = z.infer<typeof envSchema>
