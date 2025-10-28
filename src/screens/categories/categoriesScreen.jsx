// src/screens/categories/CategoriesScreen.jsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    StyleSheet,
    Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/color";
import { categoryApi } from "../../api/categoryApi";
import { useAuth } from "../../contexts/authContext";

export default function CategoriesScreen({ navigation }) {
    const { token } = useAuth();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await categoryApi.getMyCategories(token);
            setCategories(data || []);
        } catch {
            Alert.alert("Erreur", "Impossible de charger les catégories");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadData);
        return unsubscribe;
    }, [navigation]);

    const filtered = categories.filter((c) => showArchived || !c.isArchived);

    const deleteCategory = async (id) => {
        Alert.alert("Confirmation", "Supprimer cette catégorie ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    try {
                        await categoryApi.deleteCategory(token, id);
                        loadData();
                    } catch {
                        Alert.alert("Erreur", "Suppression impossible");
                    }
                },
            },
        ]);
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.text}>Chargement des catégories...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Mes Catégories</Text>
                    <Text style={styles.subtitle}>
                        Organisez et gérez vos catégories de transactions
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => navigation.navigate("CategoryModel", { mode: "create" })}
                >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.btnText}>Nouvelle catégorie</Text>
                </TouchableOpacity>
            </View>

            {/* Toggle */}
            <View style={styles.toggleRow}>
                <Switch
                    value={showArchived}
                    onValueChange={setShowArchived}
                    trackColor={{ false: colors.border, true: colors.primary }}
                />
                <Text style={styles.toggleText}>Afficher les catégories archivées</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
                {[
                    { label: "Revenus", icon: "arrow-up", color: colors.success },
                    { label: "Dépenses", icon: "arrow-down", color: colors.danger },
                    { label: "Transferts", icon: "swap-horizontal", color: colors.textSoft },
                    { label: "Total", icon: "folder", color: colors.primary },
                ].map((stat, i) => (
                    <View key={i} style={styles.statCard}>
                        <View
                            style={[
                                styles.statIcon,
                                { backgroundColor: `${stat.color}22`, borderColor: `${stat.color}44` },
                            ]}
                        >
                            <Ionicons name={stat.icon} size={20} color={stat.color} />
                        </View>
                        <View>
                            <Text style={styles.statValue}>
                                {stat.label === "Revenus"
                                    ? filtered.filter((c) => c.type === "Income").length
                                    : stat.label === "Dépenses"
                                        ? filtered.filter((c) => c.type === "Expense").length
                                        : stat.label === "Transferts"
                                            ? filtered.filter((c) => c.type === "Transfer").length
                                            : filtered.length}
                            </Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* List */}
            {filtered.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>📂</Text>
                    <Text style={styles.emptyText}>Aucune catégorie trouvée</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(i) => i.id.toString()}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.card,
                                { borderColor: item.colorHex || colors.primary },
                            ]}
                        >
                            <Text style={styles.cardName}>
                                {item.icon || "📂"} {item.name}
                            </Text>
                            <View style={styles.cardButtons}>
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("CategoryModel", {
                                            mode: "edit",
                                            category: item,
                                        })
                                    }
                                    style={styles.btnOutlinePrimary}
                                >
                                    <Ionicons name="pencil" size={16} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => deleteCategory(item.id)}
                                    style={styles.btnOutlineDanger}
                                >
                                    <Ionicons name="trash" size={16} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 16 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: { fontSize: 24, fontWeight: "700", color: colors.text },
    subtitle: { color: colors.textSoft, fontSize: 14 },
    btnPrimary: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    btnText: { color: "#fff", marginLeft: 6, fontWeight: "600" },
    toggleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
        gap: 8,
    },
    toggleText: { color: colors.textSoft },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flexBasis: "47%",
        backgroundColor: colors.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    statIcon: {
        width: 42,
        height: 42,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
    },
    statValue: { fontSize: 18, fontWeight: "700", color: colors.text },
    statLabel: { color: colors.textSoft, fontSize: 12 },
    card: {
        backgroundColor: colors.surface2,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    cardName: { color: colors.text, fontWeight: "600", fontSize: 16 },
    cardButtons: { flexDirection: "row", gap: 10 },
    btnOutlinePrimary: {
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 8,
        padding: 6,
    },
    btnOutlineDanger: {
        borderColor: colors.danger,
        borderWidth: 1,
        borderRadius: 8,
        padding: 6,
    },
    empty: { alignItems: "center", marginTop: 60 },
    emptyIcon: { fontSize: 42, marginBottom: 10 },
    emptyText: { color: colors.textSoft },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    text: { color: colors.textSoft },
});
