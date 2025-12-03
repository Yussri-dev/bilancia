// src/screens/transactions/TransactionScreen.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    ScrollView,
    Alert,
    ActivityIndicator,
    DeviceEventEmitter
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import apiClient from "@apiClient";

import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import { useTranslation } from "react-i18next";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function TransactionScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();

    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filtered, setFiltered] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");

    const [incomeTotal, setIncomeTotal] = useState(0);
    const [expenseTotal, setExpenseTotal] = useState(0);

    const balance = incomeTotal - expenseTotal;

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);

    const [form, setForm] = useState({
        amount: "",
        date: dayjs().format("YYYY-MM-DD"),
        description: "",
        categoryId: "",
        type: "Expense",
    });

    const scrollRef = useRef(null);

    const [saving, setSaving] = useState(false);

    // Format currency safely
    const formatCurrency = (val) => `€${Number(val || 0).toFixed(2)}`;

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            apiClient.setAuthToken(token);

            const [txRes, catRes] = await Promise.all([
                apiClient.get("/transaction"),
                apiClient.get("/category"),
            ]);

            // Ensure all amounts become real numbers
            const tx = (txRes.data || []).map((t) => ({
                ...t,
                amount: Number(t.amount || 0),
            }));

            setTransactions(tx);
            setCategories(
                (catRes.data || []).map(c => ({
                    id: c.id ?? c.Id,
                    name: c.name ?? c.Name,
                    type: (c.type ?? c.Type) || "Expense",
                }))
            );
        } catch (err) {
            Alert.alert(t("transactions.error"), t("transactions.loadError"));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadData);
        return unsubscribe;
    }, [navigation, loadData]);

    // Filtering & totals
    useEffect(() => {
        let result = [...transactions];

        if (searchText) {
            result = result.filter((tx) =>
                (tx.categoryName || "")
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
            );
        }

        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFiltered(result);

        setIncomeTotal(
            result
                .filter((t) => t.type?.toLowerCase() === "income")
                .reduce((sum, t) => sum + Number(t.amount), 0)
        );

        setExpenseTotal(
            result
                .filter((t) => t.type?.toLowerCase() === "expense")
                .reduce((sum, t) => sum + Number(t.amount), 0)
        );
    }, [transactions, searchText]);

    // Modal helpers
    const openCreate = () => {
        setEditing(null);
        setForm({
            amount: "",
            date: dayjs().format("YYYY-MM-DD"),
            description: "",
            categoryId: "",
            type: "Expense",
        });
        setShowModal(true);
    };

    const openEdit = (tx) => {
        setEditing(tx);
        setForm({
            amount: String(tx.amount),
            date: dayjs(tx.date).format("YYYY-MM-DD"),
            description: tx.description || "",
            categoryId: tx.categoryId,
            type: tx.type,
        });
        setShowModal(true);
    };

    const saveTransaction = async () => {
        if (!form.amount || !form.categoryId) {
            Alert.alert(t("transactions.error"), t("transactions.requiredFields"));
            return;
        }

        const dto = {
            amount: Number(form.amount),
            date: form.date,
            description: form.description,
            categoryId: form.categoryId,
            type: form.type,
        };

        setSaving(true);

        try {
            apiClient.setAuthToken(token);

            if (editing) {
                await apiClient.put(`/transaction/${editing.id}`, dto);
            } else {
                await apiClient.post("/transaction", dto);
            }
            DeviceEventEmitter.emit("transactions:updated");
            setShowModal(false);
            await loadData();
        } catch (err) {
            Alert.alert(t("transactions.error"), t("transactions.saveError"));
        } finally {
            setSaving(false);
        }
    };

    const deleteTransaction = (id) => {
        Alert.alert(
            t("transactions.confirm"),
            t("transactions.deleteConfirm"),
            [
                { text: t("transactions.cancel"), style: "cancel" },
                {
                    text: t("transactions.delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            apiClient.setAuthToken(token);
                            await apiClient.delete(`/transaction/${id}`);
                            await loadData();
                        } catch {
                            Alert.alert(t("transactions.error"), t("transactions.deleteError"));
                        }
                    },
                },
            ]
        );
    };

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [transactionDate, setTransactionDate] = useState(null);

    const onSelectTransaction = (event, selectedDate) => {
        setShowDatePicker(false);

        if (selectedDate) {
            const iso = selectedDate.toISOString().split("T")[0];
            setTransactionDate(selectedDate);
            setForm((prev) => ({ ...prev, date: iso }));
        }
    };
    // Render transaction card
    const renderItem = ({ item }) => {
        const category = categories.find((c) => c.id === item.categoryId);

        const badgeColor =
            item.type === "Income".toLowerCase()
                ? colors.success
                : item.type === "Expense".toLowerCase()
                    ? colors.danger
                    : colors.warning;

        return (
            <View style={[styles.card, { marginBottom: 12 }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle}>
                            {category?.name || t("transactions.noCategory")}
                        </Text>

                        <Text style={styles.meta}>
                            {dayjs(item.date).format("DD/MM/YYYY")}
                        </Text>

                        <Text
                            style={[
                                styles.kpiValue,
                                {
                                    fontSize: 20,
                                    marginTop: 6,
                                    color:
                                        item.type === "Income".toLowerCase()
                                            ? colors.success
                                            : item.type === "Transfer".toLocaleLowerCase()
                                                ? colors.warning
                                                : colors.danger,
                                },
                            ]}
                        >
                            {formatCurrency(item.amount)}
                        </Text>
                    </View>
                    {/* showing badge*/}
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: badgeColor }
                        ]}
                    >
                        <Text style={[styles.statusText, { color: "#fff" }]}>
                            {item.type}
                        </Text>
                    </View>
                </View>

                {item.description ? (
                    <Text style={[styles.meta, { marginTop: 6 }]}>
                        {item.description}
                    </Text>
                ) : null}

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 10,
                        gap: 10,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => openEdit(item)}
                        style={[styles.btnAction, styles.btnSuccess]}
                    >
                        <Ionicons name="pencil" size={14} color="#fff" />
                        <Text style={styles.btnActionText}>{t("transactions.edit")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => deleteTransaction(item.id)}
                        style={[styles.btnAction, styles.btnDanger]}
                    >
                        <Ionicons name="trash" size={14} color="#fff" />
                        <Text style={styles.btnActionText}>{t("transactions.delete")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t("transactions.loading")}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={[styles.header, { marginBottom: 16 }]}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={26} color={colors.text} />
                </TouchableOpacity>

                <Text style={styles.title}>{t("transactions.title")}</Text>

                <View style={{ width: 26 }} />
            </View>

            {/* KPIs */}
            <View style={styles.kpiGrid}>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiTitle}>{t("transactions.income")}</Text>
                    <Text style={[styles.kpiValue, styles.success]}>
                        {formatCurrency(incomeTotal)}
                    </Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiTitle}>{t("transactions.expense")}</Text>
                    <Text style={[styles.kpiValue, styles.danger]}>
                        {formatCurrency(expenseTotal)}
                    </Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiTitle}>{t("transactions.balance")}</Text>
                    <Text
                        style={[
                            styles.kpiValue,
                            balance >= 0 ? styles.success : styles.danger,
                        ]}
                    >
                        {formatCurrency(balance)}
                    </Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.card}>
                <TextInput
                    style={styles.input}
                    placeholder={t("transactions.searchPlaceholder")}
                    placeholderTextColor={colors.textSoft}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>{t("transactions.noResults")}</Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 120 }}
            />

            {/* Floating Button */}
            <TouchableOpacity style={styles.fab} onPress={openCreate}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCardCentered}>
                        <View style={styles.modalHeaderPrimary}>
                            <Text style={styles.modalTitlePrimary}>
                                {editing
                                    ? t("transactions.editTitle")
                                    : t("transactions.newTitle")}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={24} color={colors.textSoft} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView ref={scrollRef}>
                            {/* Amount */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t("transactions.amount")}</Text>
                                <TextInput
                                    style={styles.inputRounded}
                                    keyboardType="numeric"
                                    value={form.amount}
                                    onChangeText={(v) =>
                                        setForm({ ...form, amount: v })
                                    }
                                />
                            </View>

                            {/* Date */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t("transactions.date")}</Text>

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
                                    <Text style={{ color: form.transaction ? colors.text : colors.textSoft }}>
                                        {form.date || t("transactions.date")}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={transactionDate || new Date()}
                                    mode="date"
                                    display="calendar"
                                    onChange={onSelectTransaction}
                                />
                            )}

                            {/* Category */}
                            <Text style={styles.label}>{t("transactions.category")}</Text>
                            <ScrollView style={{ maxHeight: 160 }}>
                                <View style={styles.formGroup}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.toggleButtonRounded,
                                                form.categoryId === cat.id &&
                                                styles.toggleButtonActive,
                                                { marginBottom: 8 },
                                            ]}
                                            onPress={() => {
                                                setForm({
                                                    ...form,
                                                    categoryId: cat.id,
                                                    type: cat.type || "Expense"
                                                });

                                                setTimeout(() => {
                                                    scrollRef.current?.scrollTo({ y: 600, animated: true });
                                                }, 50);
                                            }}
                                        >
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                <Text
                                                    style={[
                                                        styles.toggleButtonText,
                                                        form.categoryId === cat.id &&
                                                        styles.toggleButtonTextActive,
                                                    ]}
                                                >
                                                    {cat.name}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.toggleButtonText,
                                                        form.categoryId === cat.id &&
                                                        styles.toggleButtonTextActive,
                                                        { fontSize: 12, opacity: 0.7 }
                                                    ]}
                                                >
                                                    {cat.type || "Expense"}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                            {/* Type */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>{t("transactions.type")}</Text>

                                {["Income", "Expense", "Transfer"].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.toggleButtonRounded,
                                            form.type === type &&
                                            styles.toggleButtonActive,
                                            { marginBottom: 8 },
                                        ]}
                                        onPress={() =>
                                            setForm({ ...form, type })
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.toggleButtonText,
                                                form.type === type &&
                                                styles.toggleButtonTextActive,
                                            ]}
                                        >
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Description */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>
                                    {t("transactions.description")}
                                </Text>
                                <TextInput
                                    style={styles.inputRounded}
                                    value={form.description}
                                    onChangeText={(v) =>
                                        setForm({ ...form, description: v })
                                    }
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooterButtons}>
                            <TouchableOpacity
                                onPress={() => setShowModal(false)}
                                style={styles.btnCancelRounded}
                            >
                                <Text style={styles.btnCancelText}>
                                    {t("transactions.cancel")}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={saveTransaction}
                                disabled={saving}
                                style={[
                                    styles.btnPrimaryRounded,
                                    saving && { opacity: 0.6 },
                                ]}
                            >
                                <Text style={styles.btnPrimaryText}>
                                    {editing
                                        ? t("transactions.save")
                                        : t("transactions.create")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
