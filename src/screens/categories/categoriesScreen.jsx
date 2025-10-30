import React, { useEffect, useState } from "react";
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
import { useAuth } from "../../contexts/authContext";
import { categoryApi } from "../../api/categoryApi";
import { useThemeColors } from "../../theme/color"; // ✅ dynamic colors
import { getStyles } from "../../theme/styles"; // ✅ unified style system
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ safe area

export default function CategoriesScreen({ navigation }) {
    const { token } = useAuth();
    const colors = useThemeColors();
    const styles = getStyles(colors); // ✅ generate themed styles

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
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des catégories...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Mes Catégories</Text>
                    <Text style={styles.subtitle}>
                        Organisez et gérez vos catégories de transactions
                    </Text>
                </View>
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
                                    style={[styles.btn, { borderColor: colors.primary, borderWidth: 1 }]}
                                >
                                    <Ionicons name="pencil" size={16} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => deleteCategory(item.id)}
                                    style={[styles.btn, { borderColor: colors.danger, borderWidth: 1 }]}
                                >
                                    <Ionicons name="trash" size={16} color={colors.danger} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Floating "New" Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("CategoryModel", { mode: "create" })}
            >
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
