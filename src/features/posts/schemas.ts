import { z } from "zod";

export const postsSearchSchema = z.object({
  page:    z.coerce.number().int().min(1).catch(1),
  limit:   z.coerce.number().int().min(1).max(50).catch(20),
  search:  z.string().optional().catch(undefined),
  privacy: z.enum(["PUBLIC", "FRIENDS", "ONLY_ME", "CUSTOM", "all"]).optional().catch(undefined),
  sort:    z.enum(["createdAt", "reactionCount", "commentCount", "shareCount"]).catch("createdAt"),
  order:   z.enum(["asc", "desc"]).catch("desc"),
});