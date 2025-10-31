// src/contexts/authContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { saveToken, getToken, removeToken } from "../services/authStorage";
import { authApi } from "../api/authApi";
import apiClient from "../api/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🔹 Charger token + profil au démarrage
    useEffect(() => {
        (async () => {
            try {
                const stored = await getToken();
                if (stored) {
                    setToken(stored);
                    apiClient.setAuthToken(stored);
                    const profile = await authApi.getProfile(stored);
                    setUser(profile);
                }
            } catch (error) {
                console.error("Error loading token/profile:", error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // 🔹 Connexion
    const login = async (email, password) => {
        try {
            const res = await authApi.login({ email, password });
            let raw = res?.token;

            if (!raw) throw new Error("No token received");
            if (typeof raw === "string" && raw.startsWith("Bearer ")) {
                raw = raw.substring(7);
            }

            await saveToken(raw);
            setToken(raw);
            apiClient.setAuthToken(raw);

            const profile = await authApi.getProfile(raw);
            setUser(profile);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    // 🔹 Déconnexion
    const logout = async () => {
        await removeToken();
        setToken(null);
        setUser(null);
        apiClient.setAuthToken(null);
    };

    // 🔹 Recharger manuellement le profil
    const fetchUser = async () => {
        if (!token) return null;
        try {
            const profile = await authApi.getProfile(token);
            setUser(profile);
            return profile;
        } catch (error) {
            console.error("Error fetching user:", error);
            return null;
        }
    };

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#0B1221",
                }}
            >
                <ActivityIndicator size="large" color="#7C3AED" />
            </View>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                setUser,
                login,
                logout,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
