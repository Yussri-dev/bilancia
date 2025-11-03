import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import { lightColors, darkColors } from "../theme/color";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const system = Appearance.getColorScheme();
    const [mode, setMode] = useState(system || "light");

    useEffect(() => {
        const listener = Appearance.addChangeListener(({ colorScheme }) => {
            setMode(colorScheme || "light");
        });
        return () => listener.remove();
    }, []);

    const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));
    const colors = mode === "light" ? lightColors : darkColors;

    return (
        <ThemeContext.Provider value={{ mode, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
