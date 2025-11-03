import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/authContext";
import { useThemeColors } from "../../theme/color";
import { getStyles } from "../../theme/styles";
import { SafeAreaView } from "react-native-safe-area-context";
// import apiClient from "../../api/apiClient";
import apiClient from "@apiClient"

export default function GoalsScreen({ navigation }) {
    const { token } = useAuth();
    const colors = useThemeColors();
    const styles = getStyles(colors);

    const [goals, setGoals] = useState([]);
    const [activeOnly, setActiveOnly] = useState(true);
    const [form, setForm] = useState({ name: "", targetAmount: "", deadline: "" });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [contrib, setContrib] = useState({});

    // ✅ Load goals via API
    const loadGoals = useCallback(async () => {
        setIsLoading(true);
        try {
            const endpoint = activeOnly ? "/goal?activeOnly=true" : "/goal";
            const response = await apiClient.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(response.data || []);
        } catch (err) {
            console.error("Offline or API error:", err);
            Alert.alert("Erreur", "Impossible de charger les objectifs.");
        } finally {
            setIsLoading(false);
        }
    }, [token, activeOnly]);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    // ✅ Save or update goal
    const saveGoal = async () => {
        if (!form.name || !form.targetAmount) {
            Alert.alert("Erreur", "Le nom et le montant sont obligatoires.");
            return;
        }

        setIsSaving(true);
        try {
            const dto = {
                name: form.name.trim(),
                targetAmount: parseFloat(form.targetAmount),
                deadline: form.deadline || null,
            };

            if (editingId) {
                await apiClient.put(`/goal/${editingId}`, dto, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await apiClient.post("/goal", dto, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            await loadGoals();
            setForm({ name: "", targetAmount: "", deadline: "" });
            setEditingId(null);
        } catch (error) {
            console.error("Save goal error:", error);
            Alert.alert("Erreur", "Impossible d’enregistrer l’objectif.");
        } finally {
            setIsSaving(false);
        }
    };

    // ✅ Delete goal
    const deleteGoal = async (id) => {
        Alert.alert("Confirmation", "Supprimer cet objectif ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    try {
                        await apiClient.delete(`/goal/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        await loadGoals();
                    } catch (error) {
                        console.error("Delete goal error:", error);
                        Alert.alert("Erreur", "Impossible de supprimer l’objectif.");
                    }
                },
            },
        ]);
    };

    // ✅ Contribute to a goal
    const contribute = async (id) => {
        const amount = parseFloat(contrib[id] || 0);
        if (isNaN(amount) || amount <= 0) return;

        try {
            await apiClient.post(
                `/goal/${id}/contribute`,
                { amount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setContrib((prev) => ({ ...prev, [id]: "" }));
            await loadGoals();
        } catch (error) {
            console.error("Contribution error:", error);
            Alert.alert("Erreur", "Impossible d’ajouter une contribution.");
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>Chargement des objectifs...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            >
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
                            🎯 Objectifs d’épargne
                        </Text>
                        <Text style={styles.subtitle}>
                            Créez et suivez vos objectifs financiers
                        </Text>
                    </View>

                    {/* Placeholder for symmetry */}
                    <View style={{ width: 26 }} />
                </View>

                {/* === FORMULAIRE === */}
                <View style={styles.filterCard}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom"
                        placeholderTextColor={colors.textSoft}
                        value={form.name}
                        onChangeText={(v) => setForm({ ...form, name: v })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Montant cible (€)"
                        placeholderTextColor={colors.textSoft}
                        keyboardType="numeric"
                        value={form.targetAmount}
                        onChangeText={(v) => setForm({ ...form, targetAmount: v })}
                    />
                    <TouchableOpacity
                        style={[styles.btnPrimary, isSaving && { opacity: 0.6 }]}
                        onPress={saveGoal}
                        disabled={isSaving}
                    >
                        <Text style={styles.btnText}>
                            {editingId ? "💾 Enregistrer" : "➕ Ajouter"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* === LISTE DES OBJECTIFS === */}
                {goals.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>Aucun objectif enregistré</Text>
                    </View>
                ) : (
                    goals.map((g) => {
                        const percent = Math.min(
                            Math.round((g.currentSaved / g.targetAmount) * 100),
                            100
                        );
                        const remaining = (g.targetAmount - g.currentSaved).toFixed(2);

                        return (
                            <View key={g.id} style={styles.card}>
                                <Text style={styles.clientName}>{g.name}</Text>
                                <Text style={styles.meta}>
                                    Cible: €{g.targetAmount.toFixed(2)} — Épargné: €
                                    {g.currentSaved.toFixed(2)}
                                </Text>

                                {/* Progress bar */}
                                <View style={styles.progressBarContainer}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${percent}%`,
                                                backgroundColor:
                                                    percent >= 100 ? colors.success : colors.primary,
                                            },
                                        ]}
                                    />
                                </View>

                                <Text style={styles.detailText}>
                                    {percent}% atteint — Reste: €{remaining}
                                </Text>

                                {/* Contribution input */}
                                <View style={styles.formRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Ajouter (€)"
                                        placeholderTextColor={colors.textSoft}
                                        keyboardType="numeric"
                                        value={contrib[g.id] || ""}
                                        onChangeText={(v) =>
                                            setContrib((prev) => ({ ...prev, [g.id]: v }))
                                        }
                                    />
                                    <TouchableOpacity
                                        onPress={() => contribute(g.id)}
                                        style={[styles.btn, styles.btnSuccess]}
                                    >
                                        <Ionicons name="add" color="#fff" size={20} />
                                    </TouchableOpacity>
                                </View>

                                {/* Actions */}
                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnPrimary, { flex: 1 }]}
                                        onPress={() => {
                                            setEditingId(g.id);
                                            setForm({
                                                name: g.name,
                                                targetAmount: g.targetAmount.toString(),
                                                deadline: g.deadline || "",
                                            });
                                        }}
                                    >
                                        <Text style={styles.btnActionText}>✏️ Modifier</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnDanger, { flex: 1 }]}
                                        onPress={() => deleteGoal(g.id)}
                                    >
                                        <Text style={styles.btnActionText}>🗑️ Supprimer</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
