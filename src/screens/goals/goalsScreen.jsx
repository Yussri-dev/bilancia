import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Alert,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "@apiClient";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";

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

    const [modalVisible, setModalVisible] = useState(false);

    // Load Goals
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

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [deadlineDate, setDeadlineDate] = useState(null);

    const onSelectDeadline = (event, selectedDate) => {
        setShowDatePicker(false);

        if (selectedDate) {
            const iso = selectedDate.toISOString().split("T")[0];
            setDeadlineDate(selectedDate);
            setForm((prev) => ({ ...prev, deadline: iso }));
        }
    };

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    // Save goal
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
            setModalVisible(false);
        } catch (error) {
            console.error("Save goal error:", error);
            Alert.alert(t("common.error"), t("goals.saveError"));
        } finally {
            setIsSaving(false);
        }
    };

    // Delete goal
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

    // Contribute
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

    // Loading screen
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
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View style={[styles.header, { marginBottom: 20 }]}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu" size={26} color={colors.text} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { fontSize: 22 }]}>
                        🎯 {t("goals.title")}
                    </Text>

                    <View style={{ width: 26 }} />
                </View>

                {/* GOALS LIST */}
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

                                {/* Progress Bar */}
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

                                {/* Contribution */}
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

                                </View>

                                {/* Actions */}
                                <View style={[
                                    styles.header,
                                    {
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 12,
                                    },
                                ]}>
                                    <TouchableOpacity
                                        onPress={() => contribute(g.id)}
                                        style={[styles.btnAction, styles.btnSuccess]}
                                    >
                                        <Ionicons name="add" color="#fff" size={20} />
                                        <Text style={styles.btnActionText}>{t("common.add")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setEditingId(g.id);
                                            setForm({
                                                name: g.name,
                                                targetAmount: g.targetAmount.toString(),
                                                deadline: g.deadline || "",
                                            });
                                            setModalVisible(true);
                                        }}
                                        style={[styles.btnAction, styles.btnPrimary]}
                                    >
                                        <Ionicons name="pencil" color="#fff" size={20} />
                                        <Text style={styles.btnActionText}> {t("common.edit")} </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => deleteGoal(g.id)}
                                        style={[styles.btnAction, styles.btnDanger]}
                                    >
                                        <Ionicons name="trash" color="#fff" size={20} />
                                        <Text style={styles.btnActionText}>{t("common.delete")}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* FLOATING ADD BUTTON */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    setForm({ name: "", targetAmount: "", deadline: "" });
                    setEditingId(null);
                    setModalVisible(true);
                }}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* MODAL — ADD / EDIT GOAL */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 12,
                    }}
                >
                    <SafeAreaView
                        style={{
                            backgroundColor: colors.background,
                            width: "100%",
                            maxHeight: "90%",
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: colors.border,
                            overflow: "hidden",
                        }}
                    >
                        {/* HEADER */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingHorizontal: 16,
                                paddingVertical: 12,
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
                                {editingId ? t("goals.editGoal") : t("goals.newGoal")}
                            </Text>

                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{ padding: 6 }}
                            >
                                <Ionicons name="close" size={22} color={colors.textSoft} />
                            </TouchableOpacity>
                        </View>

                        {/* BODY */}
                        <ScrollView
                            contentContainerStyle={{ padding: 16 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Name */}
                            <View style={{ marginBottom: 14 }}>
                                <Text style={{ color: colors.textSoft, marginBottom: 6, fontWeight: "600" }}>
                                    {t("goals.name")}
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: colors.surface2,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        borderRadius: 12,
                                        padding: 10,
                                        color: colors.text,
                                    }}
                                    placeholder={t("goals.namePlaceholder")}
                                    placeholderTextColor={colors.textSoft}
                                    value={form.name}
                                    onChangeText={(v) => setForm({ ...form, name: v })}
                                />
                            </View>

                            {/* Target amount */}
                            <View style={{ marginBottom: 14 }}>
                                <Text style={{ color: colors.textSoft, marginBottom: 6, fontWeight: "600" }}>
                                    {t("goals.target")}
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: colors.surface2,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        borderRadius: 12,
                                        padding: 10,
                                        color: colors.text,
                                    }}
                                    placeholder={t("goals.targetPlaceholder")}
                                    placeholderTextColor={colors.textSoft}
                                    keyboardType="numeric"
                                    value={form.targetAmount}
                                    onChangeText={(v) => setForm({ ...form, targetAmount: v })}
                                />
                            </View>

                            {/* Deadline */}
                            <View style={{ marginBottom: 14 }}>
                                <Text style={{ color: colors.textSoft, marginBottom: 6, fontWeight: "600" }}>
                                    {t("goals.deadline")}
                                </Text>

                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    style={{
                                        backgroundColor: colors.surface2,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        borderRadius: 12,
                                        padding: 12,
                                    }}
                                >
                                    <Text style={{ color: form.deadline ? colors.text : colors.textSoft }}>
                                        {form.deadline || t("goals.selectDeadline")}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={deadlineDate || new Date()}
                                    mode="date"
                                    display="calendar"
                                    onChange={onSelectDeadline}
                                />
                            )}

                        </ScrollView>

                        {/* FOOTER */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                borderTopWidth: 1,
                                borderTopColor: colors.border,
                                padding: 14,
                                gap: 10,
                            }}
                        >
                            {/* Cancel */}
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{
                                    backgroundColor: "transparent",
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                }}
                            >
                                <Text style={{ color: colors.textSoft }}>{t("common.cancel")}</Text>
                            </TouchableOpacity>

                            {/* Save */}
                            <TouchableOpacity
                                onPress={saveGoal}
                                disabled={isSaving}
                                style={[
                                    {
                                        backgroundColor: colors.primary,
                                        borderRadius: 10,
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                    },
                                    isSaving && { opacity: 0.6 },
                                ]}
                            >
                                <Text style={{ color: "#fff", fontWeight: "700" }}>
                                    {editingId ? t("common.save") : t("common.create")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>

        </SafeAreaView>
    );
}
