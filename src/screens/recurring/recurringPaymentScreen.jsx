import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BarChart } from "react-native-chart-kit";
import apiClient from "@apiClient";
import { recurringPaymentApi } from "@api/recurringPaymentApi";

import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import { useTranslation } from "react-i18next";

const screenWidth = Dimensions.get("window").width;

export default function RecurringPaymentScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();

    const [all, setAll] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [fName, setFName] = useState("");
    const [fCategory, setFCategory] = useState("");
    const [fActive, setFActive] = useState("");

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const [saving, setSaving] = useState(false);

    const [showNextDuePicker, setShowNextDuePicker] = useState(false);
    const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

    const [form, setForm] = useState({
        name: "",
        amount: "",
        frequencyInDays: "",
        nextDueDate: dayjs().format("YYYY-MM-DD"),
        categoryId: "",
        notes: "",
        isActive: true
    });

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            apiClient.setAuthToken(token);

            const [catRes, recRes] = await Promise.all([
                apiClient.get("/category"),
                recurringPaymentApi.getAll(token)
            ]);

            setCategories(
                (catRes.data || []).map(c => ({
                    id: c.id ?? c.Id,
                    name: c.name ?? c.Name,
                    type: c.type ?? c.Type ?? "Expense"
                }))
            );

            setAll(recRes || []);
        } catch {
            Alert.alert(t("common.error"), "Impossible de charger");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const unsub = navigation.addListener("focus", loadData);
        return unsub;
    }, [navigation, loadData]);

    const filtered = useMemo(() => {
        let q = [...all];

        if (fName) q = q.filter(x => x.name.toLowerCase().includes(fName.toLowerCase()));

        if (fCategory) {
            const cat = categories.find(c => c.id == fCategory);
            if (cat) q = q.filter(x => x.categoryName === cat.name);
        }

        if (fActive !== "") {
            const b = fActive === "true";
            q = q.filter(x => x.isActive === b);
        }

        if (fromDate) {
            const iso = dayjs(fromDate).format("YYYY-MM-DD");
            q = q.filter(x => dayjs(x.nextDueDate).format("YYYY-MM-DD") >= iso);
        }

        if (toDate) {
            const iso = dayjs(toDate).format("YYYY-MM-DD");
            q = q.filter(x => dayjs(x.nextDueDate).format("YYYY-MM-DD") <= iso);
        }

        return q.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
    }, [all, fName, fCategory, fActive, fromDate, toDate, categories]);

    const chartData = useMemo(() => {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const months = [];

        for (let i = 0; i < 6; i++) {
            const m = new Date(start);
            m.setMonth(start.getMonth() + i);
            months.push(m);
        }

        const totals = months.map(() => 0);

        filtered
            .filter(x => x.isActive && x.amount > 0 && x.frequencyInDays > 0)
            .forEach(p => {
                let due = new Date(p.nextDueDate);
                const end = new Date(start);
                end.setMonth(start.getMonth() + 6);

                if (due < start) {
                    const diff = (start - due) / 86400000;
                    const skips = Math.floor(diff / p.frequencyInDays);
                    due.setDate(due.getDate() + skips * p.frequencyInDays);
                    while (due < start) due.setDate(due.getDate() + p.frequencyInDays);
                }

                while (due < end) {
                    const idx = months.findIndex(
                        m => m.getFullYear() === due.getFullYear() && m.getMonth() === due.getMonth()
                    );
                    if (idx >= 0) totals[idx] += p.amount;
                    due.setDate(due.getDate() + p.frequencyInDays);
                }
            });

        return {
            labels: months.map(m => m.toLocaleDateString("fr-FR", { month: "short" })),
            datasets: [{ data: totals }]
        };
    }, [filtered]);

    const monthlyTotal = useMemo(
        () => filtered.filter(x => x.isActive).reduce((a, b) => a + b.amount, 0),
        [filtered]
    );

    const upcomingCount = useMemo(() => {
        const nextWeek = dayjs().add(7, "day");
        return filtered.filter(x => x.isActive && dayjs(x.nextDueDate).isBefore(nextWeek, "day"))
            .length;
    }, [filtered]);

    const inactive = useMemo(() => filtered.filter(x => !x.isActive).length, [filtered]);

    const openCreate = () => {
        setEditing(null);
        setForm({
            name: "",
            amount: "",
            frequencyInDays: "",
            nextDueDate: dayjs().format("YYYY-MM-DD"),
            categoryId: "",
            notes: "",
            isActive: true
        });
        setShowModal(true);
    };

    const openEdit = p => {
        setEditing(p);
        const catId = categories.find(c => c.name === p.categoryName)?.id || "";
        setForm({
            name: p.name,
            amount: String(p.amount),
            frequencyInDays: String(p.frequencyInDays),
            nextDueDate: dayjs(p.nextDueDate).format("YYYY-MM-DD"),
            categoryId: catId,
            notes: p.notes || "",
            isActive: p.isActive
        });
        setShowModal(true);
    };

    const saveRecurring = async () => {
        if (!form.name || !form.amount || !form.frequencyInDays || !form.nextDueDate) {
            Alert.alert("Erreur", "Champs requis manquants");
            return;
        }

        const dto = {
            name: form.name,
            amount: parseFloat(form.amount),
            frequencyInDays: parseInt(form.frequencyInDays),
            nextDueDate: new Date(form.nextDueDate).toISOString(),
            categoryId: form.categoryId ? parseInt(form.categoryId) : null,
            notes: form.notes,
            isActive: form.isActive
        };

        setSaving(true);

        try {
            if (editing) {
                await recurringPaymentApi.update(token, editing.id, dto);
            } else {
                await recurringPaymentApi.create(token, dto);
            }

            setShowModal(false);
            await loadData();
        } catch {
            Alert.alert(t("common.error"), t("common.saveFailed"));
        } finally {
            setSaving(false);
        }
    };

    const remove = id => {
        Alert.alert(
            t("common.confirm"),
            t("common.deleteConfirm"),
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await recurringPaymentApi.delete(token, id);
                            await loadData();
                        } catch {
                            Alert.alert("Erreur", "Impossible de supprimer");
                        }
                    }
                }
            ]
        );
    };

    const markPaid = async (p) => {
        try {
            // First mark as paid
            await recurringPaymentApi.markAsPaid(token, p.id);

            Alert.alert(
                "Succès",
                "Créer une transaction ?",
                [
                    { text: "Non", style: "cancel" },
                    {
                        text: "Oui",
                        onPress: async () => {
                            try {
                                // Find the category ID
                                let categoryId = p.categoryId;

                                if (!categoryId && p.categoryName) {
                                    const foundCat = categories.find(c => c.name === p.categoryName);
                                    categoryId = foundCat?.id;
                                }

                                if (!categoryId) {
                                    Alert.alert("Erreur", "Catégorie non trouvée");
                                    await loadData();
                                    return;
                                }

                                // Create the transaction using apiClient
                                apiClient.setAuthToken(token);
                                await apiClient.post("/transaction", {
                                    amount: p.amount,
                                    date: new Date().toISOString(),
                                    description: `Paiement récurrent: ${p.name}`,
                                    categoryId: categoryId,
                                    type: "Expense",
                                    isSavings: false,
                                    tagIds: [],
                                    userGroupId: null,
                                    goalId: null
                                });

                                Alert.alert(t("common.success"), t("recurring.transactionCreated"));
                                await loadData();
                            } catch (err) {
                                console.error("Transaction creation error:", err);
                                Alert.alert("Erreur", "Impossible de créer la transaction");
                                await loadData();
                            }
                        }
                    }
                ]
            );
        } catch (e) {
            console.error("Mark as paid error:", e);
            Alert.alert("Erreur", "Échec du marquage comme payé");
        }
    };


    const renderItem = ({ item }) => (
        <View style={[styles.card, { marginBottom: 12 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text>€{item.amount.toFixed(2)}</Text>
            </View>

            <Text style={styles.meta}>
                {item.frequencyInDays} j • {dayjs(item.nextDueDate).format("DD/MM/YYYY")}
            </Text>

            {item.categoryName ? <Text style={styles.meta}>{item.categoryName}</Text> : null}

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 12 }}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                    <Ionicons name="pencil" size={18} color={colors.primary} />
                </TouchableOpacity>

                {item.isActive && (
                    <TouchableOpacity onPress={() => markPaid(item)}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => remove(item.id)}>
                    <Ionicons name="trash" size={20} color={colors.danger} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View
                style={[
                    styles.header,
                    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
                ]}
            >
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={26} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: "center" }}>
                    <Text style={[styles.headerTitle, { fontSize: 20 }]}>{t("recurring.title")}</Text>
                </View>

                <View style={{ width: 26 }} />
            </View>

            <FlatList
                data={filtered}
                keyExtractor={x => x.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={
                    <>
                        <View style={styles.card}>
                            <TextInput
                                style={styles.input}
                                placeholder={t("recurring.name")}
                                placeholderTextColor={colors.textSoft}
                                value={fName}
                                onChangeText={setFName}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder={t("recurring.category")}
                                placeholderTextColor={colors.textSoft}
                                value={fCategory}
                                onChangeText={setFCategory}
                            />

                            <TextInput
                                style={styles.input}
                                placeholder={t("recurring.active")}
                                placeholderTextColor={colors.textSoft}
                                value={fActive}
                                onChangeText={setFActive}
                            />

                            <TouchableOpacity style={styles.input} onPress={() => setShowFromPicker(true)}>
                                <Text style={{ color: fromDate ? colors.text : colors.textSoft }}>
                                    {fromDate ? dayjs(fromDate).format("DD/MM/YYYY") : t("recurring.dateMin")}
                                </Text>
                            </TouchableOpacity>

                            {showFromPicker && (
                                <DateTimePicker
                                    value={fromDate || new Date()}
                                    mode="date"
                                    display="calendar"
                                    onChange={(e, d) => {
                                        setShowFromPicker(false);
                                        if (d) setFromDate(d);
                                    }}
                                />
                            )}

                            <TouchableOpacity style={styles.input} onPress={() => setShowToPicker(true)}>
                                <Text style={{ color: toDate ? colors.text : colors.textSoft }}>
                                    {toDate ? dayjs(toDate).format("DD/MM/YYYY") : t("recurring.dateMax")}
                                </Text>
                            </TouchableOpacity>

                            {showToPicker && (
                                <DateTimePicker
                                    value={toDate || new Date()}
                                    mode="date"
                                    display="calendar"
                                    onChange={(e, d) => {
                                        setShowToPicker(false);
                                        if (d) setToDate(d);
                                    }}
                                />
                            )}

                            <TouchableOpacity
                                style={styles.btnSecondary}
                                onPress={() => {
                                    setFName("");
                                    setFCategory("");
                                    setFActive("");
                                    setFromDate(null);
                                    setToDate(null);
                                }}
                            >
                                <Text style={styles.btnSecondaryText}>{t("common.reset")}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.kpiGrid}>
                            <View style={styles.kpiCard}>
                                <Text>{t("recurring.totalMonthly")}</Text>
                                <Text style={{ fontSize: 22, color: colors.success }}>
                                    €{monthlyTotal.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.kpiCard}>
                                <Text>{t("recurring.upcoming")}</Text>
                                <Text style={{ fontSize: 22 }}>{upcomingCount}</Text>
                            </View>

                            <View style={styles.kpiCard}>
                                <Text>{t("recurring.inactive")}</Text>
                                <Text style={{ fontSize: 22, color: colors.danger }}>{inactive}</Text>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <BarChart
                                data={chartData}
                                width={screenWidth - 60}
                                height={220}
                                chartConfig={{
                                    backgroundColor: "#fff",
                                    backgroundGradientFrom: "#fff",
                                    backgroundGradientTo: "#fff",
                                    decimalPlaces: 2,
                                    color: () => colors.primary,
                                    labelColor: () => colors.text
                                }}
                                style={{ marginVertical: 12, borderRadius: 8 }}
                            />
                        </View>

                        <Text style={styles.cardTitle}>{t("recurring.list")} ({filtered.length})</Text>
                    </>
                }
                ListEmptyComponent={
                    <View style={{ padding: 40, alignItems: "center" }}>
                        <Text style={{ fontSize: 42 }}>📄</Text>
                        <Text>{t("recurring.noPayments")}</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 120 }}
            />

            <TouchableOpacity style={styles.fab} onPress={openCreate}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCardCentered}>
                        <View style={styles.modalHeaderPrimary}>
                            <Text style={styles.modalTitlePrimary}>
                                {editing ? t("recurring.edit") : t("recurring.newPayment")}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={24} color={colors.textSoft} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={[1]}
                            keyExtractor={() => "form"}
                            nestedScrollEnabled
                            renderItem={() => (
                                <>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>{t("recurring.name")}</Text>
                                        <TextInput
                                            style={styles.inputRounded}
                                            value={form.name}
                                            onChangeText={v => setForm({ ...form, name: v })}
                                        />
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>{t("recurring.amount")}</Text>
                                        <TextInput
                                            style={styles.inputRounded}
                                            keyboardType="numeric"
                                            value={form.amount}
                                            onChangeText={v => setForm({ ...form, amount: v })}
                                        />
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>{t("recurring.frequency")}</Text>

                                        <TouchableOpacity
                                            style={styles.inputRounded}
                                            onPress={() => setShowFrequencyPicker(true)}
                                        >
                                            <Text style={{ color: form.frequencyInDays ? colors.text : colors.textSoft }}>
                                                {form.frequencyInDays
                                                    ? `${form.frequencyInDays} ${t("recurring.frequency").toLowerCase()}`
                                                    : t("recurring.frequency")}
                                            </Text>
                                        </TouchableOpacity>

                                        {showFrequencyPicker && (
                                            <Modal transparent animationType="fade">
                                                <View style={styles.modalOverlay}>
                                                    <View style={[styles.modalCardCentered, { padding: 20 }]}>
                                                        <Text style={[styles.modalTitlePrimary, { marginBottom: 10 }]}>
                                                            {t("recurring.frequency")}
                                                        </Text>

                                                        {[
                                                            { label: "Hebdomadaire (7 jours)", value: 7 },
                                                            { label: "Bi-hebdomadaire (14 jours)", value: 14 },
                                                            { label: "Mensuel (30 jours)", value: 30 },
                                                            { label: "Bi-mensuel (60 jours)", value: 60 },
                                                            { label: "Trimestriel (90 jours)", value: 90 },
                                                            { label: "Annuel (365 jours)", value: 365 }
                                                        ].map(opt => (
                                                            <TouchableOpacity
                                                                key={opt.value}
                                                                style={[styles.toggleButtonRounded, { marginBottom: 10 }]}
                                                                onPress={() => {
                                                                    setForm({
                                                                        ...form,
                                                                        frequencyInDays: String(opt.value)
                                                                    });
                                                                    setShowFrequencyPicker(false);
                                                                }}
                                                            >
                                                                <Text style={styles.toggleButtonText}>{opt.label}</Text>
                                                            </TouchableOpacity>
                                                        ))}

                                                        <TouchableOpacity
                                                            onPress={() => setShowFrequencyPicker(false)}
                                                            style={[styles.btnCancelRounded, { marginTop: 10 }]}
                                                        >
                                                            <Text style={styles.btnCancelText}>{t("common.cancel")}</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </Modal>
                                        )}
                                    </View>


                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>{t("recurring.nextDueDate")}</Text>

                                        <TouchableOpacity
                                            style={styles.inputRounded}
                                            onPress={() => setShowNextDuePicker(true)}
                                        >
                                            <Text
                                                style={{
                                                    color: form.nextDueDate ? colors.text : colors.textSoft
                                                }}
                                            >
                                                {form.nextDueDate
                                                    ? dayjs(form.nextDueDate).format("DD/MM/YYYY")
                                                    : t("recurring.nextDueDate")}
                                            </Text>
                                        </TouchableOpacity>

                                        {showNextDuePicker && (
                                            <DateTimePicker
                                                value={form.nextDueDate ? new Date(form.nextDueDate) : new Date()}
                                                mode="date"
                                                display="calendar"
                                                onChange={(event, selected) => {
                                                    setShowNextDuePicker(false);
                                                    if (selected) {
                                                        setForm({
                                                            ...form,
                                                            nextDueDate: dayjs(selected).format("YYYY-MM-DD")
                                                        });
                                                    }
                                                }}
                                            />
                                        )}
                                    </View>

                                    <Text style={styles.label}>{t("recurring.category")}</Text>

                                    <ScrollView style={{ maxHeight: 125 }}>
                                        {categories.map(cat => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.toggleButtonRounded,
                                                    form.categoryId === cat.id && styles.toggleButtonActive,
                                                    { marginBottom: 8 }
                                                ]}
                                                onPress={() =>
                                                    setForm({
                                                        ...form,
                                                        categoryId: cat.id,
                                                        type: cat.type || "Expense"
                                                    })
                                                }
                                            >
                                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                                    <Text
                                                        style={[
                                                            styles.toggleButtonText,
                                                            form.categoryId === cat.id && styles.toggleButtonTextActive
                                                        ]}
                                                    >
                                                        {cat.name}
                                                    </Text>

                                                    <Text
                                                        style={[
                                                            styles.toggleButtonText,
                                                            form.categoryId === cat.id && styles.toggleButtonTextActive,
                                                            { opacity: 0.7, fontSize: 12 }
                                                        ]}
                                                    >
                                                        {cat.type}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>{t("recurring.notes")}</Text>
                                        <TextInput
                                            style={[styles.inputRounded, { height: 80 }]}
                                            multiline
                                            value={form.notes}
                                            onChangeText={v => setForm({ ...form, notes: v })}
                                        />
                                    </View>
                                </>
                            )}
                            contentContainerStyle={{ paddingBottom: 30 }}
                        />

                        <View style={styles.modalFooterButtons}>
                            <TouchableOpacity
                                onPress={() => setShowModal(false)}
                                style={styles.btnCancelRounded}
                            >
                                <Text style={styles.btnCancelText}>{t("recurring.buttonCancel")}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={saveRecurring}
                                disabled={saving}
                                style={[styles.btnPrimaryRounded, saving && { opacity: 0.6 }]}
                            >
                                <Text style={styles.btnPrimaryText}>
                                    {editing ? t("recurring.buttonSave") : t("recurring.buttonCreate")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
