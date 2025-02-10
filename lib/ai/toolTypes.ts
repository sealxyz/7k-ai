import { z } from 'zod'

export const filterCriteriaSchema = z.object({
  apr: z.string().optional(),
  tvl: z.string().optional(),
  volume: z.string().optional(),
})
