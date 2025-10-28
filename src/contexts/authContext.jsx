import React, { createContext, useContext, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { saveToken, getToken, removeToken } from "../services/authStorage";
import { loginUser } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const stored = await getToken();
                if (stored) setToken(stored);
            } catch (error) {
                console.error("Error loading token:", error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (email, password) => {
        try {
            const res = await loginUser({ email, password });
            let raw = res?.token;

            if (!raw) throw new Error("No token received");

            if (typeof raw === "string" && raw.startsWith("Bearer ")) {
                raw = raw.substring(7);
            }

            await saveToken(raw);
            setToken(raw);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = async () => {
        await removeToken();
        setToken(null);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B1221" }}>
                <ActivityIndicator size="large" color="#7C3AED" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
