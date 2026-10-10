import { Link } from "@tanstack/react-router";

// 404 Not Found Page
export function NotFoundPage() {
  return (
    <div className="flex items-center justify-center">
      <Link to="/">
        {/* Light mode image — hidden when .dark is on <html> */}
        <img src="/404.png" alt="Not found" className="h-screen w-auto max-w-full object-contain dark:hidden" />
        {/* Dark mode image — hidden by default, shown in .dark */}
        <img src="/404-dark.png" alt="Not found" className="hidden h-screen w-auto max-w-full object-contain dark:block" />
      </Link>
    </div>
  );
}