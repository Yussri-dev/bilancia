// src/screens/transactions/TransactionScreen.jsx
import React, { useEffect, useState, useCallback } from "react";
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
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useAuth } from "../../contexts/authContext";
import { useTheme } from "../../contexts/ThemeContext";
import { getStyles } from "../../theme/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/apiClient";

export default function TransactionScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    const [incomeTotal, setIncomeTotal] = useState(0);
    const [expenseTotal, setExpenseTotal] = useState(0);
    const balance = incomeTotal - expenseTotal;

    const [searchText, setSearchText] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        amount: "",
        date: dayjs().format("YYYY-MM-DD"),
        description: "",
        categoryId: "",
        type: "Expense",
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [dropdownCategoryOpen, setDropdownCategoryOpen] = useState(false);
    const [dropdownTypeOpen, setDropdownTypeOpen] = useState(false);
    const dropdownAnim = useState(new Animated.Value(0))[0];

    const animateDropdown = (open) => {
        Animated.timing(dropdownAnim, {
            toValue: open ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const toggleCategoryDropdown = () => {
        animateDropdown(!dropdownCategoryOpen);
        setDropdownCategoryOpen(!dropdownCategoryOpen);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            apiClient.setAuthToken(token);

            const [txRes, catRes] = await Promise.all([
                apiClient.get("/transaction"),
                apiClient.get("/category"),
            ]);

            setTransactions(txRes.data || []);
            setCategories(catRes.data || []);
        } catch (e) {
            console.error("Error loading data:", e.message);
            Alert.alert("Erreur", "Impossible de charger les transactions ou catégories.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadData);
        return unsubscribe;
    }, [navigation, loadData]);

    useEffect(() => {
        if (!transactions.length) {
            setFiltered([]);
            setIncomeTotal(0);
            setExpenseTotal(0);
            return;
        }

        let result = [...transactions];
        if (searchText)
            result = result.filter((t) =>
                t.description?.toLowerCase().includes(searchText.toLowerCase())
            );

        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        setFiltered(result);

        const income = result
            .filter((t) => t.type?.toLowerCase() === "income")
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = result
            .filter((t) => t.type?.toLowerCase() === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        setIncomeTotal(income);
        setExpenseTotal(expense);
    }, [transactions, searchText]);

    const openCreate = () => {
        setEditing(null);
        setForm({
            amount: "",
            date: dayjs().format("YYYY-MM-DD"),
            description: "",
            categoryId: "",
            type: "Expense",
        });
        setFormError("");
        setShowModal(true);
    };

    const openEdit = (tx) => {
        setEditing(tx);
        setForm({
            amount: tx.amount.toString(),
            date: dayjs(tx.date).format("YYYY-MM-DD"),
            description: tx.description || "",
            categoryId: tx.categoryId || "",
            type: tx.type,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setFormError("");
        setDropdownCategoryOpen(false);
        setDropdownTypeOpen(false);
    };

    const saveTransaction = async () => {
        if (!form.amount || !form.categoryId) {
            setFormError("Veuillez remplir tous les champs obligatoires");
            return;
        }

        const dto = {
            amount: parseFloat(form.amount),
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
            closeModal();
            await loadData();
        } catch (e) {
            console.error("Save error:", e);
            Alert.alert("Erreur", "Impossible d'enregistrer la transaction");
        } finally {
            setSaving(false);
        }
    };

    const deleteTransaction = async (id) => {
        Alert.alert("Confirmer", "Supprimer cette transaction ?", [
            { text: "Annuler", style: "cancel" },
            {
                text: "Supprimer",
                style: "destructive",
                onPress: async () => {
                    try {
                        apiClient.setAuthToken(token);
                        await apiClient.delete(`/transaction/${id}`);
                        await loadData();
                    } catch {
                        Alert.alert("Erreur", "Impossible de supprimer");
                    }
                },
            },
        ]);
    };

    const dropdownHeight = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 150],
    });

    const renderItem = ({ item }) => {
        const category = categories.find((c) => c.id === item.categoryId);
        return (
            <View style={[styles.card, { marginHorizontal: 4, marginBottom: 12 }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{category?.name || "Sans catégorie"}</Text>
                        <Text style={styles.meta}>
                            {dayjs(item.date).format("DD/MM/YYYY")} · {item.categoryName || "—"}
                        </Text>
                        <Text style={[styles.kpiValue, { fontSize: 18, marginTop: 4 }]}>
                            €{item.amount.toFixed(2)}
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    item.type?.toLowerCase() === "income"
                                        ? `${colors.success}22`
                                        : item.type?.toLowerCase() === "transfer"
                                            ? `${colors.warning}22`
                                            : `${colors.danger}22`,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color:
                                    item.type?.toLowerCase() === "income"
                                        ? colors.success
                                        : item.type?.toLowerCase() === "transfer"
                                            ? colors.warning
                                            : colors.danger,
                            }}
                        >
                            {item.type}
                        </Text>
                    </View>
                </View>

                <Text style={styles.detailText}>{item.description || "—"}</Text>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.btnAction, styles.btnPrimary]}
                        onPress={() => openEdit(item)}
                    >
                        <Ionicons name="pencil" size={16} color="#fff" />
                        <Text style={styles.btnActionText}>Éditer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnAction, styles.btnDanger]}
                        onPress={() => deleteTransaction(item.id)}
                    >
                        <Ionicons name="trash" size={16} color="#fff" />
                        <Text style={styles.btnActionText}>Supprimer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des transactions...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={
                    <>
                        {/* === HEADER WITH DRAWER === */}
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
                                    💳 Transactions
                                </Text>
                                <Text style={styles.subtitle}>
                                    Suivez vos revenus et dépenses
                                </Text>
                            </View>

                            {/* Placeholder to balance layout */}
                            <View style={{ width: 26 }} />
                        </View>

                        {/* KPIs */}
                        <View style={styles.kpiGrid}>
                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiTitle}>Revenus</Text>
                                <Text style={[styles.kpiValue, styles.success]}>
                                    €{incomeTotal.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiTitle}>Dépenses</Text>
                                <Text style={[styles.kpiValue, styles.danger]}>
                                    €{expenseTotal.toFixed(2)}
                                </Text>
                            </View>

                            <View style={styles.kpiCard}>
                                <Text style={styles.kpiTitle}>Solde</Text>
                                <Text
                                    style={[
                                        styles.kpiValue,
                                        balance >= 0 ? styles.success : styles.danger,
                                    ]}
                                >
                                    €{balance.toFixed(2)}
                                </Text>
                            </View>
                        </View>

                        {/* Search */}
                        <View style={styles.card}>
                            <TextInput
                                style={styles.input}
                                placeholder="Rechercher une description..."
                                placeholderTextColor={colors.textSoft}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>

                        {filtered.length === 0 && (
                            <View style={styles.empty}>
                                <Text style={styles.emptyIcon}>📄</Text>
                                <Text style={styles.emptyText}>Aucune transaction trouvée</Text>
                            </View>
                        )}
                    </>
                }
                ListFooterComponent={<View style={{ height: 80 }} />}
            />

            {/* Modal */}
            <Modal visible={showModal} animationType="fade" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {editing ? "Modifier la transaction" : "Nouvelle transaction"}
                            </Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                <Ionicons name="close" size={22} color={colors.textSoft} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.body}>
                            {/* Amount */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Montant (€)</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={form.amount}
                                    onChangeText={(t) => setForm({ ...form, amount: t })}
                                />
                            </View>

                            {/* Date */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Date</Text>
                                <TextInput
                                    style={styles.input}
                                    value={form.date}
                                    onChangeText={(t) => setForm({ ...form, date: t })}
                                />
                            </View>

                            {/* Category */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Catégorie</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                                    ]}
                                    onPress={toggleCategoryDropdown}
                                >
                                    <Text
                                        style={{
                                            color: form.categoryId ? colors.text : colors.textSoft,
                                        }}
                                    >
                                        {categories.find((c) => c.id === form.categoryId)?.name ||
                                            "Sélectionnez une catégorie"}
                                    </Text>
                                    <Ionicons
                                        name={dropdownCategoryOpen ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color={colors.textSoft}
                                    />
                                </TouchableOpacity>

                                <Animated.View
                                    style={{
                                        overflow: "hidden",
                                        height: dropdownAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 150],
                                        }),
                                    }}
                                >
                                    <ScrollView>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={{
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    backgroundColor:
                                                        form.categoryId === cat.id
                                                            ? `${colors.primary}15`
                                                            : "transparent",
                                                }}
                                                onPress={() => {
                                                    setForm({ ...form, categoryId: cat.id });
                                                    toggleCategoryDropdown();
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color:
                                                            form.categoryId === cat.id
                                                                ? colors.primary
                                                                : colors.text,
                                                    }}
                                                >
                                                    {cat.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </Animated.View>
                            </View>

                            {/* Type */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Type</Text>
                                <TouchableOpacity
                                    style={[
                                        styles.input,
                                        { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                                    ]}
                                    onPress={() => setDropdownTypeOpen(!dropdownTypeOpen)}
                                >
                                    <Text style={{ color: colors.text }}>
                                        {form.type || "Sélectionnez un type"}
                                    </Text>
                                    <Ionicons
                                        name={dropdownTypeOpen ? "chevron-up" : "chevron-down"}
                                        size={20}
                                        color={colors.textSoft}
                                    />
                                </TouchableOpacity>

                                {dropdownTypeOpen && (
                                    <View style={styles.dropdownMenu}>
                                        {["Income", "Expense", "Transfer"].map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={{
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    backgroundColor:
                                                        form.type === type
                                                            ? `${colors.primary}15`
                                                            : "transparent",
                                                }}
                                                onPress={() => {
                                                    setForm({ ...form, type });
                                                    setDropdownTypeOpen(false);
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color:
                                                            form.type === type
                                                                ? colors.primary
                                                                : colors.text,
                                                    }}
                                                >
                                                    {type === "Income"
                                                        ? "💰 Income"
                                                        : type === "Expense"
                                                            ? "💸 Expense"
                                                            : "🔄 Transfer"}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Description */}
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={styles.input}
                                    value={form.description}
                                    onChangeText={(t) =>
                                        setForm({ ...form, description: t })
                                    }
                                />
                            </View>

                            {formError && <Text style={styles.errorText}>{formError}</Text>}
                        </ScrollView>

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={closeModal} style={styles.btnSecondary}>
                                <Text style={styles.btnSecondaryText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveTransaction}
                                style={[styles.btnPrimary, saving && { opacity: 0.6 }]}
                                disabled={saving}
                            >
                                <Text style={styles.btnPrimaryText}>
                                    {editing ? "Enregistrer" : "Créer"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Floating Button */}
            <TouchableOpacity style={styles.fab} onPress={openCreate}>
                <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}