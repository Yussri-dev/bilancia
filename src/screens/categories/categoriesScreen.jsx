import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import apiClient from "@apiClient";
import { useTranslation } from "react-i18next";

export default function CategoriesScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            apiClient.setAuthToken(token);
            const res = await apiClient.get("/category");
            // Map the data to ensure consistent field names
            setCategories((res.data || []).map(c => ({
                ...c,
                type: (c.type ?? c.Type) || "Expense",
            })));
        } catch (error) {
            console.error("Error fetching categories:", error);
            Alert.alert(t("common.error"), t("categories.loadError"));
        } finally {
            setIsLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadData);
        return unsubscribe;
    }, [navigation, loadData]);

    const filtered = categories.filter((c) => showArchived || !c.isArchived);

    const deleteCategory = async (id) => {
        Alert.alert(t("common.confirm"), t("categories.deleteConfirm"), [
            { text: t("common.cancel"), style: "cancel" },
            {
                text: t("common.delete"),
                style: "destructive",
                onPress: async () => {
                    try {
                        apiClient.setAuthToken(token);
                        await apiClient.delete(`/category/${id}`);
                        await loadData();
                    } catch (error) {
                        console.error("Delete failed:", error);
                        Alert.alert(t("common.error"), t("categories.deleteFailed"));
                    }
                },
            },
        ]);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t("categories.loading")}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* === HEADER === */}
            <View
                style={[
                    styles.header,
                    {
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                    },
                ]}
            >
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={26} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={[styles.headerTitle, { fontSize: 20 }]}>
                        📂 {t("categories.title")}
                    </Text>
                    <Text style={styles.subtitle}>{t("categories.subtitle")}</Text>
                </View>

                <View style={{ width: 26 }} />
            </View>

            {/* === TOGGLE === */}
            <View style={styles.toggleRow}>
                <Switch
                    value={showArchived}
                    onValueChange={setShowArchived}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={showArchived ? colors.primary : colors.surface2}
                />
                <Text style={styles.toggleText}>{t("categories.showArchived")}</Text>
            </View>

            {/* === STATS === */}
            <View style={styles.statsGrid}>
                {[
                    { label: t("categories.income"), icon: "arrow-up", color: colors.success },
                    { label: t("categories.expense"), icon: "arrow-down", color: colors.danger },
                    { label: t("categories.transfer"), icon: "swap-horizontal", color: colors.textSoft },
                    { label: t("categories.total"), icon: "folder", color: colors.primary },
                ].map((stat) => {
                    const count =
                        stat.label === t("categories.income")
                            ? filtered.filter((c) => c.type === "Income".toLowerCase()).length
                            : stat.label === t("categories.expense")
                                ? filtered.filter((c) => c.type === "Expense".toLowerCase()).length
                                : stat.label === t("categories.transfer")
                                    ? filtered.filter((c) => c.type === "Transfer".toLowerCase()).length
                                    : filtered.length;

                    return (
                        <View key={stat.label} style={styles.statCard}>
                            <View
                                style={[
                                    styles.statIcon,
                                    {
                                        backgroundColor: `${stat.color}22`,
                                        borderColor: `${stat.color}44`,
                                    },
                                ]}
                            >
                                <Ionicons name={stat.icon} size={20} color={stat.color} />
                            </View>
                            <View>
                                <Text style={styles.statValue}>{count}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* === CATEGORY LIST === */}
            {filtered.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>📂</Text>
                    <Text style={styles.emptyText}>{t("categories.empty")}</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(i) => i.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.card,
                                { borderColor: item.colorHex || colors.primary },
                            ]}
                        >
                            <Text style={styles.cardName}>
                                {item.icon || "📁"} {item.name}
                            </Text>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                    marginTop: 10,
                                    gap: 10,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("CategoryModel", { mode: "edit", category: item, })}
                                    style={[styles.btnAction, styles.btnSuccess]}
                                >
                                    <Ionicons name="pencil" size={14} color="#fff" />
                                    <Text style={styles.btnActionText}>{t("transactions.edit")}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => deleteCategory(item.id)}
                                    style={[styles.btnAction, styles.btnDanger]}
                                >
                                    <Ionicons name="trash" size={14} color="#fff" />
                                    <Text style={styles.btnActionText}>{t("transactions.delete")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() =>
                    navigation.navigate("CategoryModel", { mode: "create" })
                }
            >
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}