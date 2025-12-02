// src/components/CustomDrawerContent.jsx
import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@contexts/authContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";

export default function CustomDrawerContent(props) {
    const { user, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <DrawerContentScrollView {...props}
                style={{ backgroundColor: colors.background }}
            >
                {/* === USER HEADER === */}
                <View
                    style={{
                        padding: 20,
                        borderBottomWidth: 1,
                        borderColor: colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    {user ? (
                        <>
                            <Image
                                source={
                                    user.avatarUrl
                                        ? { uri: user.avatarUrl }
                                        : require("@assets/default-avatar.png")
                                }
                                defaultSource={require("@assets/default-avatar.png")}
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 50,
                                }}
                            />

                            <View style={{ marginLeft: 12 }}>
                                <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>
                                    {user.fullName || user.username || t("profile.defaultUser")}
                                </Text>

                                <Text style={{ color: colors.primary }}>
                                    {t("common.online")}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <Text style={{ color: colors.textSoft }}>
                            {t("common.offline")}
                        </Text>
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
                    borderColor: colors.border,
                }}
            >
                <Text
                    style={{
                        color: colors.textSoft,
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
                        borderColor: colors.border,
                    }}
                >
                    <TouchableOpacity
                        onPress={logout}
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Ionicons name="log-out" size={20} color={colors.danger} />
                        <Text
                            style={{
                                color: colors.danger,
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
