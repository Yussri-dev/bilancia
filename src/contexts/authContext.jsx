// src/contexts/authContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { saveToken, getToken, removeToken } from "../services/authStorage";
import { authApi } from "@api/authApi";
import apiClient from "@apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingAuth, setPendingAuth] = useState(null); // Holds auth data before navigation

    //  Charger token + profil au démarrage
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

    //  Connexion - returns auth data but doesn't set token yet
    const login = async (email, password) => {
        try {
            const res = await authApi.login({ email, password });
            let raw = res?.token;

            if (!raw) throw new Error("No token received");
            if (typeof raw === "string" && raw.startsWith("Bearer ")) {
                raw = raw.substring(7);
            }

            await saveToken(raw);
            apiClient.setAuthToken(raw);

            const profile = await authApi.getProfile(raw);

            // Store auth data but don't set token yet
            setPendingAuth({ token: raw, user: profile });

            return { token: raw, user: profile };
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    // Confirm login - actually sets the token to trigger navigation
    const confirmLogin = () => {
        if (pendingAuth) {
            setToken(pendingAuth.token);
            setUser(pendingAuth.user);
            setPendingAuth(null);
        }
    };

    // Cancel login - clears pending auth
    const cancelLogin = async () => {
        if (pendingAuth) {
            await removeToken();
            apiClient.setAuthToken(null);
            setPendingAuth(null);
        }
    };

    //  Déconnexion
    const logout = async () => {
        await removeToken();
        setToken(null);
        setUser(null);
        apiClient.setAuthToken(null);
    };

    //  Recharger manuellement le profil
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
                confirmLogin,
                cancelLogin,
                logout,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);