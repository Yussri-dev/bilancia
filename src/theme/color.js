import { useColorScheme } from "react-native";

// light Theme
const lightColors = {
    background: "#F9FAFB",
    surface: "#FFFFFF",
    surface2: "#F1F5F9",
    border: "#E2E8F0",
    text: "#0F172A",
    textSoft: "#475569",
    primary: "#7C3AED",
    success: "#16A34A",
    danger: "#DC2626",
    warning: "#D97706",
};

// Dark theme
const darkColors = {
    background: "#0B1221",
    surface: "#1E293B",
    surface2: "#0E1726",
    border: "#334155",
    text: "#E5E7EB",
    textSoft: "#94A3B8",
    primary: "#7C3AED",
    success: "#16A34A",
    danger: "#EF4444",
    warning: "#F59E0B",
};

export const useThemeColors = () => {
    const scheme = useColorScheme();
    return scheme === "light" ? lightColors : darkColors;
};

// export par défaut (dark pour compat)
export const colors = lightColors;
