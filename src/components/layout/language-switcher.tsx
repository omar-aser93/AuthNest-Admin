import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, Languages } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
] as const;


// language switcher component
export function LanguageSwitcher() {
  const { i18n } = useTranslation();        // get current locale
  const current = i18n.resolvedLanguage;    

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Change language" />}>
        <Languages className="size-4" />     
      </DropdownMenuTrigger>
     <DropdownMenuContent align="end">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem key={lang.code} onClick={() => i18n.changeLanguage(lang.code)} className="cursor-pointer" >
            <span className="flex-1">{lang.label}</span>
            {current === lang.code && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}