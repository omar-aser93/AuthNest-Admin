import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, getRouteApi } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";

const routeApi = getRouteApi("/_dashboard/users");


// component to display the search input & role filter
export function UsersToolbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const search = routeApi.useSearch();

  const [searchValue, setSearchValue] = useState(search.search ?? "");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    const current = search.search ?? "";
    if (debouncedSearch === current) return;
    navigate({ to: ".", search: (prev) => ({
        ...prev,
        search: debouncedSearch || undefined,
        page: 1,
      }),
      replace: true,
    });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = (value: "user" | "admin" | "all" | null) => {
    if (!value) return;
    navigate({ to: ".", search: (prev) => ({
        ...prev,
        role: value === "all" ? undefined : value,
        page: 1,
      }),
    });
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute inset-s-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t("users.searchPlaceholder")}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="ps-8 h-9"
        />
      </div>

      <Select value={search.role ?? "all"} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-40 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("users.filter.all")}</SelectItem>
          <SelectItem value="user">{t("users.filter.user")}</SelectItem>
          <SelectItem value="admin">{t("users.filter.admin")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}