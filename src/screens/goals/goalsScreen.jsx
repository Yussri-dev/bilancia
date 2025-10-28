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
import { categoryApi } from "../../api/categoryApi";

export default function GoalsScreen() {
    const { token } = useAuth();

    const [goals, setGoals] = useState([]);
    const [activeOnly, setActiveOnly] = useState(true);
    const [form, setForm] = useState({
        name: "",
        targetAmount: "",
        deadline: "",
    });
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
        } catch (err) {
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
                    } catch (err) {
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
        } catch (err) {
            Alert.alert("Erreur", "Impossible d’ajouter une contribution.");
        }
    };

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#0B1221",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <ActivityIndicator color="#7C3AED" size="large" />
                <Text style={{ color: "#fff", marginTop: 10 }}>
                    Chargement des objectifs...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: "#0B1221", padding: 16 }}
            contentContainerStyle={{ paddingBottom: 80 }}
        >
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
                🎯 Objectifs d’épargne
            </Text>
            <Text style={{ color: "#94A3B8", marginBottom: 20 }}>
                Créez et suivez vos objectifs d’épargne.
            </Text>

            {/* --- Formulaire --- */}
            <View
                style={{
                    backgroundColor: "#1E293B",
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 20,
                }}
            >
                <TextInput
                    placeholder="Nom"
                    placeholderTextColor="#64748B"
                    value={form.name}
                    onChangeText={(v) => setForm({ ...form, name: v })}
                    style={{ color: "#fff", borderBottomColor: "#334155", borderBottomWidth: 1, marginBottom: 10 }}
                />
                <TextInput
                    placeholder="Montant cible (€)"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    value={form.targetAmount}
                    onChangeText={(v) => setForm({ ...form, targetAmount: v })}
                    style={{ color: "#fff", borderBottomColor: "#334155", borderBottomWidth: 1, marginBottom: 10 }}
                />
                <TouchableOpacity
                    style={{
                        backgroundColor: "#7C3AED",
                        borderRadius: 8,
                        paddingVertical: 10,
                        alignItems: "center",
                    }}
                    onPress={saveGoal}
                    disabled={isSaving}
                >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                        {editingId ? "💾 Enregistrer" : "➕ Ajouter"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* --- Liste --- */}
            {goals.length === 0 ? (
                <Text style={{ color: "#94A3B8", textAlign: "center" }}>
                    Aucun objectif enregistré
                </Text>
            ) : (
                goals.map((g) => {
                    const percent = Math.min(
                        Math.round((g.currentSaved / g.targetAmount) * 100),
                        100
                    );
                    return (
                        <View
                            key={g.id}
                            style={{
                                backgroundColor: "#1E293B",
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 14,
                            }}
                        >
                            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                                {g.name}
                            </Text>
                            <Text style={{ color: "#94A3B8" }}>
                                Cible: €{g.targetAmount.toFixed(2)} — Épargné: €
                                {g.currentSaved.toFixed(2)}
                            </Text>

                            {/* Progress bar */}
                            <View
                                style={{
                                    height: 8,
                                    backgroundColor: "#334155",
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    marginVertical: 6,
                                }}
                            >
                                <View
                                    style={{
                                        height: "100%",
                                        width: `${percent}%`,
                                        backgroundColor: percent >= 100 ? "#16A34A" : "#7C3AED",
                                    }}
                                />
                            </View>

                            <Text style={{ color: "#94A3B8", marginBottom: 10 }}>
                                {percent}% atteint — Reste: €
                                {(g.targetAmount - g.currentSaved).toFixed(2)}
                            </Text>

                            {/* Contribute */}
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <TextInput
                                    placeholder="Ajouter (€)"
                                    placeholderTextColor="#64748B"
                                    keyboardType="numeric"
                                    value={contrib[g.id] || ""}
                                    onChangeText={(v) =>
                                        setContrib((prev) => ({ ...prev, [g.id]: v }))
                                    }
                                    style={{
                                        flex: 1,
                                        color: "#fff",
                                        borderColor: "#334155",
                                        borderWidth: 1,
                                        borderRadius: 6,
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => contribute(g.id)}
                                    style={{
                                        backgroundColor: "#16A34A",
                                        paddingVertical: 8,
                                        paddingHorizontal: 12,
                                        borderRadius: 6,
                                    }}
                                >
                                    <Ionicons name="add" color="#fff" size={20} />
                                </TouchableOpacity>
                            </View>

                            {/* Actions */}
                            <View style={{ flexDirection: "row", marginTop: 10, gap: 10 }}>
                                <TouchableOpacity
                                    style={{ flex: 1, backgroundColor: "#3B82F6", borderRadius: 6, padding: 8, alignItems: "center" }}
                                    onPress={() => {
                                        setEditingId(g.id);
                                        setForm({
                                            name: g.name,
                                            targetAmount: g.targetAmount.toString(),
                                            deadline: g.deadline || "",
                                        });
                                    }}
                                >
                                    <Text style={{ color: "#fff" }}>✏️ Modifier</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={{ flex: 1, backgroundColor: "#DC2626", borderRadius: 6, padding: 8, alignItems: "center" }}
                                    onPress={() => deleteGoal(g.id)}
                                >
                                    <Text style={{ color: "#fff" }}>🗑️ Supprimer</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })
            )}
        </ScrollView>
    );
}
