import React, { useEffect, useState } from "react";
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
import { goalApi } from "../../api/goalApi";
import { useThemeColors } from "../../theme/color"; // ✅ dynamic theme
import { getStyles } from "../../theme/styles"; // ✅ unified style system
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ safe area

export default function GoalsScreen() {
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

    // Load goals
    const loadGoals = async () => {
        setIsLoading(true);
        try {
            const list = await goalApi.getGoals(token, activeOnly);
            setGoals(list || []);
        } catch (err) {
            console.log("Offline or API error:", err);
            Alert.alert("Erreur", "Impossible de charger les objectifs.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, [activeOnly]);

    const saveGoal = async () => {
        if (!form.name || !form.targetAmount) {
            Alert.alert("Erreur", "Le nom et le montant sont obligatoires.");
            return;
        }
        setIsSaving(true);
        try {
            if (editingId) {
                await goalApi.updateGoal(token, editingId, {
                    name: form.name,
                    targetAmount: parseFloat(form.targetAmount),
                    deadline: form.deadline || null,
                });
            } else {
                await goalApi.createGoal(token, {
                    name: form.name,
                    targetAmount: parseFloat(form.targetAmount),
                    deadline: form.deadline || null,
                });
            }
            await loadGoals();
            setForm({ name: "", targetAmount: "", deadline: "" });
            setEditingId(null);
        } catch {
            Alert.alert("Erreur", "Impossible d’enregistrer l’objectif.");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteGoal = async (id) => {
        Alert.alert("Confirmation", "Supprimer cet objectif ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    try {
                        await goalApi.deleteGoal(token, id);
                        await loadGoals();
                    } catch {
                        Alert.alert("Erreur", "Impossible de supprimer.");
                    }
                },
            },
        ]);
    };

    const contribute = async (id) => {
        const amount = parseFloat(contrib[id] || 0);
        if (isNaN(amount) || amount <= 0) return;
        try {
            await goalApi.contributeAsync(token, id, amount);
            setContrib((prev) => ({ ...prev, [id]: "" }));
            await loadGoals();
        } catch {
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
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>🎯 Objectifs d’épargne</Text>
                        <Text style={styles.subtitle}>
                            Créez et suivez vos objectifs d’épargne.
                        </Text>
                    </View>
                </View>

                {/* --- Formulaire --- */}
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
                        style={styles.btnPrimary}
                        onPress={saveGoal}
                        disabled={isSaving}
                    >
                        <Text style={styles.btnText}>
                            {editingId ? "💾 Enregistrer" : "➕ Ajouter"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- Liste --- */}
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
                                                    percent >= 100
                                                        ? colors.success
                                                        : colors.primary,
                                            },
                                        ]}
                                    />
                                </View>

                                <Text style={styles.detailText}>
                                    {percent}% atteint — Reste: €
                                    {(g.targetAmount - g.currentSaved).toFixed(2)}
                                </Text>

                                {/* Contribute */}
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
