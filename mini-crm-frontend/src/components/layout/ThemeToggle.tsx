import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 transition-colors text-sm font-medium"
      title="Alternar tema"
    >
      {isDark ? "☀️ Claro" : "🌙 Escuro"}
    </button>
  );
}
