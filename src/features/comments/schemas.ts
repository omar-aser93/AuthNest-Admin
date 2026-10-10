import { z } from "zod";

export const commentsSearchSchema = z.object({
  page:   z.coerce.number().int().min(1).catch(1),
  limit:  z.coerce.number().int().min(1).max(50).catch(20),
  search: z.string().optional().catch(undefined),
  postId: z.string().optional().catch(undefined),
  sort:   z.enum(["createdAt", "reactionCount", "replyCount"]).catch("createdAt"),
  order:  z.enum(["asc", "desc"]).catch("desc"),
});