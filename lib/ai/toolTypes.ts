import { z } from 'zod'

export const filterCriteriaSchema = z.object({
  apr: z.number().optional(),
  tvl: z.number().optional(),
  volume: z.number().optional(),
})
