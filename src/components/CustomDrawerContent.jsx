// src/components/CustomDrawerContent.jsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@contexts/authContext";
import { useTranslation } from "react-i18next";

export default function CustomDrawerContent(props) {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();

    return (
        <View style={{ flex: 1, backgroundColor: "#0B1221" }}>
            <DrawerContentScrollView {...props}>
                {/* === USER HEADER === */}
                <View style={{ padding: 20, borderBottomWidth: 1, borderColor: "#1E293B" }}>
                    {user ? (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image
                                source={
                                    user.avatarUrl
                                        ? { uri: user.avatarUrl }
                                        : require("../../assets/default-avatar.jpg")
                                }
                                defaultSource={require("../../assets/default-avatar.jpg")}
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 50,
                                    marginBottom: 16,
                                }}
                                onError={() => console.warn("Image failed to load")}
                            />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
                                    {user.fullName || user.username || t("profile.defaultUser")}
                                </Text>
                                <Text style={{ color: "#7C3AED" }}>{t("common.online")}</Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={{ color: "#999" }}>{t("common.offline")}</Text>
                    )}
                </View>

                {/* === MENU ITEMS === */}
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* === LANGUAGE SWITCHER === */}
            <View
                style={{
                    padding: 20,
                    borderTopWidth: 1,
                    borderColor: "#1E293B",
                }}
            >
                <Text
                    style={{
                        color: "#94A3B8",
                        fontWeight: "600",
                        marginBottom: 10,
                        fontSize: 14,
                    }}
                >
                    🌐 {t("common.language")}
                </Text>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => i18n.changeLanguage("fr")} style={{ marginRight: 12 }}>
                        <Text style={{ fontSize: 20 }}>🇫🇷</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => i18n.changeLanguage("en")} style={{ marginRight: 12 }}>
                        <Text style={{ fontSize: 20 }}>🇬🇧</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => i18n.changeLanguage("nl")}>
                        <Text style={{ fontSize: 20 }}>🇳🇱</Text>
                    </TouchableOpacity>
                </View>

            </View>

            {/* === LOGOUT BUTTON === */}
            {user && (
                <View
                    style={{
                        padding: 20,
                        borderTopWidth: 1,
                        borderColor: "#1E293B",
                    }}
                >
                    <TouchableOpacity
                        onPress={logout}
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Ionicons name="log-out" size={20} color="#E11D48" />
                        <Text
                            style={{
                                color: "#E11D48",
                                marginLeft: 10,
                                fontWeight: "600",
                            }}
                        >
                            {t("common.logout")}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
