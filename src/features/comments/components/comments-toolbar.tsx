import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

const routeApi = getRouteApi("/_dashboard/comments");

// component to display the search input & post filter
export function CommentsToolbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = routeApi.useSearch();

  const [searchValue, setSearchValue] = useState(search.search ?? "");
  const [postIdValue, setPostIdValue] = useState(search.postId ?? "");
  const debouncedSearch = useDebounce(searchValue, 400);
  const debouncedPostId = useDebounce(postIdValue, 400);

  useEffect(() => {
    const current = search.search ?? "";
    if (debouncedSearch === current) return;
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, search: debouncedSearch || undefined, page: 1 }),
      replace: true,
    });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const current = search.postId ?? "";
    if (debouncedPostId === current) return;
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, postId: debouncedPostId || undefined, page: 1 }),
      replace: true,
    });
  }, [debouncedPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearPostFilter = () => {
    setPostIdValue("");
    navigate({
      to: ".",
      search: (prev) => ({ ...prev, postId: undefined, page: 1 }),
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute inset-s-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t("comments.searchPlaceholder")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="ps-8 h-9"
        />
      </div>

      <div className="relative flex-1 max-w-sm">
        <Input
          placeholder={t("comments.postIdPlaceholder")}
          value={postIdValue}
          onChange={(e) => setPostIdValue(e.target.value)}
          className="pe-8 h-9"
        />
        {postIdValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-e-1 top-1/2 -translate-y-1/2 size-6"
            onClick={clearPostFilter}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}