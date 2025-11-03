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

import { useAuth } from "../../contexts/authContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getStyles } from "../../theme/styles";
// import apiClient from "../../api/apiClient";
import apiClient from "@apiClient"

export default function CategoriesScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);

    // ✅ Load categories
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            apiClient.setAuthToken(token);
            const res = await apiClient.get("/category");
            setCategories(res.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            Alert.alert("Erreur", "Impossible de charger les catégories.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    // ✅ Re-fetch when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadData);
        return unsubscribe;
    }, [navigation, loadData]);

    const filtered = categories.filter((c) => showArchived || !c.isArchived);

    const deleteCategory = async (id) => {
        Alert.alert("Confirmation", "Supprimer cette catégorie ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    try {
                        apiClient.setAuthToken(token);
                        await apiClient.delete(`/category/${id}`);
                        await loadData();
                    } catch (error) {
                        console.error("Delete failed:", error);
                        Alert.alert("Erreur", "Suppression impossible.");
                    }
                },
            },
        ]);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des catégories...</Text>
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
                {/* Drawer Button */}
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={26} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={[styles.headerTitle, { fontSize: 20 }]}>
                        📂 Mes Catégories
                    </Text>
                    <Text style={styles.subtitle}>
                        Organisez et gérez vos catégories
                    </Text>
                </View>

                {/* Placeholder to balance layout */}
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
                <Text style={styles.toggleText}>
                    Afficher les catégories archivées
                </Text>
            </View>

            {/* === STATS === */}
            <View style={styles.statsGrid}>
                {[
                    { label: "Revenus", icon: "arrow-up", color: colors.success },
                    { label: "Dépenses", icon: "arrow-down", color: colors.danger },
                    { label: "Transferts", icon: "swap-horizontal", color: colors.textSoft },
                    { label: "Total", icon: "folder", color: colors.primary },
                ].map((stat) => {
                    const count =
                        stat.label === "Revenus"
                            ? filtered.filter((c) => c.type === "Income").length
                            : stat.label === "Dépenses"
                                ? filtered.filter((c) => c.type === "Expense").length
                                : stat.label === "Transferts"
                                    ? filtered.filter((c) => c.type === "Transfer").length
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
                    <Text style={styles.emptyText}>Aucune catégorie trouvée</Text>
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
                            <View style={styles.cardButtons}>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("CategoryModel", {
                                            mode: "edit",
                                            category: item,
                                        })
                                    }
                                    style={[
                                        styles.btn,
                                        { borderColor: colors.primary, borderWidth: 1 },
                                    ]}
                                >
                                    <Ionicons name="pencil" size={16} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => deleteCategory(item.id)}
                                    style={[
                                        styles.btn,
                                        { borderColor: colors.danger, borderWidth: 1 },
                                    ]}
                                >
                                    <Ionicons name="trash" size={16} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* === FLOATING ACTION BUTTON === */}
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
