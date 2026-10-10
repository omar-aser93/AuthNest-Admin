import { z } from "zod";

export const reportsSearchSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(20),
  status: z.enum(["PENDING", "REVIEWED", "ACTIONED", "DISMISSED", "all"]).optional().catch(undefined),
  targetType: z.enum(["POST", "COMMENT", "USER", "all"]).optional().catch(undefined),
  sort: z.enum(["createdAt", "status"]).catch("createdAt"),
  order: z.enum(["asc", "desc"]).catch("desc"),
  groupBy: z.enum(["target", "flat"]).catch("flat"),    
});