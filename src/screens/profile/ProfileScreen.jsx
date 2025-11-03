import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/authContext";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../../api/apiClient";

export default function ProfileScreen({ navigation }) {
    const { user, setUser, logout, fetchUser, token } = useAuth();

    const [loading, setLoading] = useState(!user);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            if (user) return;
            try {
                setLoading(true);
                const res = await apiClient.get("/auth/profile");
                setUser(res.data);
            } catch (err) {
                console.error("Error loading profile:", err);
                setError("Impossible de charger votre profil.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, [token]);

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#0B1221",
                }}
            >
                <ActivityIndicator color="#7C3AED" size="large" />
                <Text style={{ color: "#94A3B8", marginTop: 10 }}>Chargement du profil...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#0B1221",
                }}
            >
                <Text style={{ color: "#E11D48", marginBottom: 16 }}>{error}</Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        backgroundColor: "#7C3AED",
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 10,
                    }}
                >
                    <Text style={{ color: "#fff" }}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!user) {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: "#0B1221",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text style={{ color: "#94A3B8" }}>Aucun utilisateur connecté.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#0B1221",
                padding: 20,
            }}
        >
            {/* 🔹 Header: Retour + Menu Drawer */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                }}
            >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* 🔹 Profile info */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
                <Image
                    source={
                        user.avatarUrl
                            ? { uri: user.avatarUrl }
                            : require("../../../assets/default-avatar.jpg")
                    }
                    defaultSource={require("../../../assets/default-avatar.jpg")}
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        marginBottom: 16,
                    }}
                    onError={() => console.warn("Image failed to load")}
                />

                <Text
                    style={{
                        color: "#fff",
                        fontSize: 22,
                        fontWeight: "700",
                        marginBottom: 8,
                    }}
                >
                    {user.fullName || user.username || "Utilisateur"}
                </Text>
                <Text style={{ color: "#94A3B8", marginBottom: 24 }}>
                    {user.email || "Email non renseigné"}
                </Text>
            </View>

            {/* 🔹 Buttons */}
            <View style={{ gap: 12 }}>
                <TouchableOpacity
                    onPress={() => Alert.alert("📧 Confirmation", "Fonction à venir")}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#1E293B",
                        paddingVertical: 12,
                        borderRadius: 10,
                        gap: 8,
                    }}
                >
                    <Ionicons name="mail-outline" size={20} color="#7C3AED" />
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                        Renvoyer l’email de confirmation
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={logout}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#E11D48",
                        paddingVertical: 12,
                        borderRadius: 10,
                        gap: 8,
                    }}
                >
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "600" }}>Déconnexion</Text>
                </TouchableOpacity>
            </View>

            {/* 🔹 Account details */}
            <View
                style={{
                    marginTop: 40,
                    backgroundColor: "#111827",
                    padding: 16,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#1E293B",
                }}
            >
                <Text
                    style={{
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: "700",
                        marginBottom: 12,
                    }}
                >
                    Détails du compte
                </Text>
                <View style={{ gap: 8 }}>
                    <Text style={{ color: "#94A3B8" }}>ID: {user.id}</Text>
                    <Text style={{ color: "#94A3B8" }}>Nom: {user.fullName ?? user.username}</Text>
                    <Text style={{ color: "#94A3B8" }}>Email: {user.email}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
