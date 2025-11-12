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
import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@apiClient";
import { useTranslation } from "react-i18next";

export default function GoalsScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();

    const [goals, setGoals] = useState([]);
    const [activeOnly, setActiveOnly] = useState(true);
    const [form, setForm] = useState({ name: "", targetAmount: "", deadline: "" });
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [contrib, setContrib] = useState({});

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
            Alert.alert(t("common.error"), t("goals.loadError"));
        } finally {
            setIsLoading(false);
        }
    }, [token, activeOnly, t]);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    const saveGoal = async () => {
        if (!form.name || !form.targetAmount) {
            Alert.alert(t("common.error"), t("goals.nameAndAmountRequired"));
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
            Alert.alert(t("common.error"), t("goals.saveError"));
        } finally {
            setIsSaving(false);
        }
    };

    const deleteGoal = async (id) => {
        Alert.alert(t("common.confirm"), t("goals.deleteConfirm"), [
            { text: t("common.cancel"), style: "cancel" },
            {
                text: t("common.delete"),
                style: "destructive",
                onPress: async () => {
                    try {
                        await apiClient.delete(`/goal/${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        await loadGoals();
                    } catch (error) {
                        console.error("Delete goal error:", error);
                        Alert.alert(t("common.error"), t("goals.deleteError"));
                    }
                },
            },
        ]);
    };

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
            Alert.alert(t("common.error"), t("goals.contribError"));
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>{t("goals.loading")}</Text>
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
                            🎯 {t("goals.title")}
                        </Text>
                        <Text style={styles.subtitle}>{t("goals.subtitle")}</Text>
                    </View>

                    <View style={{ width: 26 }} />
                </View>

                {/* === FORM === */}
                <View style={styles.filterCard}>
                    <TextInput
                        style={styles.input}
                        placeholder={t("goals.namePlaceholder")}
                        placeholderTextColor={colors.textSoft}
                        value={form.name}
                        onChangeText={(v) => setForm({ ...form, name: v })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder={t("goals.targetPlaceholder")}
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
                            {editingId ? t("common.saveWithIcon") : t("common.addWithIcon")}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* === LIST === */}
                {goals.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>{t("goals.empty")}</Text>
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
                                    {t("goals.target")}: €{g.targetAmount.toFixed(2)} —{" "}
                                    {t("goals.saved")}: €{g.currentSaved.toFixed(2)}
                                </Text>

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
                                    {percent}% {t("goals.achieved")} — {t("goals.remaining")}: €
                                    {remaining}
                                </Text>

                                {/* Contribution input */}
                                <View style={styles.formRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder={t("goals.addAmount")}
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
                                        <Text style={styles.btnActionText}>
                                            ✏️ {t("common.edit")}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnDanger, { flex: 1 }]}
                                        onPress={() => deleteGoal(g.id)}
                                    >
                                        <Text style={styles.btnActionText}>
                                            🗑️ {t("common.delete")}
                                        </Text>
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
