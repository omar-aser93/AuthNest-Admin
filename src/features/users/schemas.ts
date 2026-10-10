import { z } from "zod";

// Search params schema — every value has a fallback via .catch() so a bad URL never crashes the page.
export const usersSearchSchema = z.object({
  page:   z.coerce.number().int().min(1).catch(1),
  limit:  z.coerce.number().int().min(1).max(50).catch(20),
  search: z.string().optional().catch(undefined),
  role:   z.enum(["user", "admin", "all"]).optional().catch(undefined),
  sort:   z.enum(["createdAt", "name", "email", "role"]).catch("createdAt"),
  order:  z.enum(["asc", "desc"]).catch("desc"),
});