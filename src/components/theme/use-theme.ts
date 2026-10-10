import { useContext } from "react"
import { ThemeProviderContext } from "./theme-context"

// Custom hook to be able to use the ThemeContext
export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}