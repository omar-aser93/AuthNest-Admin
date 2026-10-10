// Search result item — kept generic so the palette can render any resource type
// without switching on shape. Each feature's API call maps its own data into
// this shape before returning.
export interface SearchResult {
  id: string;
  type: "user" | "post" | "comment";
  label: string;      // main text ("Alice" / "Hello world" / "Great post!")
  hint?: string;      // secondary text (email / excerpt / post title)
  image?: string | null;
  href: string;       // where to navigate on select
  params?: Record<string, string | number>;  // optional search params for the target route
}

// Navigation commands — static, always shown regardless of query.
export interface NavCommand {
  label: string;
  keywords: string[];
  icon: "dashboard" | "users" | "posts" | "comments" | "reports";
  href: string;
  search?: Record<string, string | number>;
}