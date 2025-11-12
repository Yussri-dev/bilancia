import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    Alert,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import apiClient from "@apiClient";
import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next"; // ✅ Added

const statusOptions = ["Pending", "Paid", "Overdue", "Cancelled"];

export default function InvoiceScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation(); // ✅ Added

    const [invoices, setInvoices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterClient, setFilterClient] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    const [pageIndex, setPageIndex] = useState(0);
    const pageSize = 10;

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        client: "",
        amount: "",
        tax: "",
        status: "Pending",
        issueDate: dayjs().format("YYYY-MM-DD"),
        paidDate: "",
    });
    const [saving, setSaving] = useState(false);

    const [deleteInvoice, setDeleteInvoice] = useState(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [invoicesRes, categoriesRes] = await Promise.all([
                apiClient.get("/invoice", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                apiClient.get("/category", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);
            setInvoices(invoicesRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (error) {
            console.error("Load error:", error);
            Alert.alert(t("common.error"), t("invoices.loadError"));
        } finally {
            setLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadData);
        return unsubscribe;
    }, [navigation, loadData]);

    useEffect(() => {
        let result = [...invoices];
        if (filterClient)
            result = result.filter((i) =>
                i.client?.toLowerCase().includes(filterClient.toLowerCase())
            );
        if (filterStatus)
            result = result.filter(
                (i) => i.status?.toLowerCase() === filterStatus.toLowerCase()
            );
        if (filterFrom)
            result = result.filter(
                (i) => dayjs(i.issueDate).format("YYYY-MM-DD") >= filterFrom
            );
        if (filterTo)
            result = result.filter(
                (i) => dayjs(i.issueDate).format("YYYY-MM-DD") <= filterTo
            );

        result.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
        setFiltered(result);
        setPageIndex(0);
    }, [invoices, filterClient, filterStatus, filterFrom, filterTo]);

    const paged = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize);

    const resetFilters = () => {
        setFilterClient("");
        setFilterStatus("");
        setFilterFrom("");
        setFilterTo("");
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            client: "",
            amount: "",
            tax: "",
            status: "Pending",
            issueDate: dayjs().format("YYYY-MM-DD"),
            paidDate: "",
        });
        setShowModal(true);
    };

    const openEdit = (invoice) => {
        setEditing(invoice);
        setForm({
            client: invoice.client,
            amount: invoice.amount.toString(),
            tax: invoice.tax.toString(),
            status: invoice.status,
            issueDate: dayjs(invoice.issueDate).format("YYYY-MM-DD"),
            paidDate: invoice.paidDate ? dayjs(invoice.paidDate).format("YYYY-MM-DD") : "",
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
    };

    const saveInvoice = async () => {
        if (!form.client || !form.amount) {
            Alert.alert(t("common.error"), t("invoices.requiredFields"));
            return;
        }

        setSaving(true);
        try {
            const dto = {
                client: form.client.trim(),
                amount: parseFloat(form.amount),
                tax: parseFloat(form.tax) || 0,
                status: form.status,
                issueDate: form.issueDate,
                paidDate: form.paidDate || null,
            };

            if (editing) {
                await apiClient.put(`/invoice/${editing.id}`, dto, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await apiClient.post("/invoice", dto, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            await loadData();
            closeModal();
        } catch (error) {
            console.error("Save invoice error:", error);
            Alert.alert(t("common.error"), t("invoices.saveError"));
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!deleteInvoice) return;
        Alert.alert(
            t("common.confirm"),
            `${t("invoices.deleteConfirm")} ${deleteInvoice.client} ?`,
            [
                { text: t("common.cancel"), style: "cancel", onPress: () => setDeleteInvoice(null) },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/invoice/${deleteInvoice.id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            await loadData();
                        } catch (err) {
                            console.error("Delete invoice error:", err);
                            Alert.alert(t("common.error"), t("invoices.deleteError"));
                        } finally {
                            setDeleteInvoice(null);
                        }
                    },
                },
            ]
        );
    }, [deleteInvoice, t]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case "paid":
                return colors.success;
            case "overdue":
                return colors.danger;
            case "cancelled":
                return colors.textSoft;
            default:
                return colors.warning;
        }
    };

    const renderInvoiceItem = ({ item }) => {
        const total = item.amount + item.tax;
        const statusColor = getStatusColor(item.status);

        return (
            <View
                style={[
                    styles.card,
                    { borderLeftColor: statusColor, borderLeftWidth: 3 },
                ]}
            >
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{item.client}</Text>
                        <Text style={styles.meta}>
                            {dayjs(item.issueDate).format("YYYY-MM-DD")} • €{total.toFixed(2)}
                        </Text>
                    </View>
                    <View
                        style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}
                    >
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {t(`invoices.status.${item.status.toLowerCase()}`)}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDetails}>
                    <Text style={styles.detailText}>{t("invoices.amountExclTax")}: €{item.amount.toFixed(2)}</Text>
                    <Text style={styles.detailText}>{t("invoices.tax")}: €{item.tax.toFixed(2)}</Text>
                    {item.paidDate && (
                        <Text style={styles.detailText}>
                            {t("invoices.paidOn")}: {dayjs(item.paidDate).format("YYYY-MM-DD")}
                        </Text>
                    )}
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.btnAction, styles.btnPrimary]}
                        onPress={() => openEdit(item)}
                    >
                        <Ionicons name="pencil" size={16} color="#fff" />
                        <Text style={styles.btnActionText}>{t("common.edit")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnAction, styles.btnDanger]}
                        onPress={() => setDeleteInvoice(item)}
                    >
                        <Ionicons name="trash" size={16} color="#fff" />
                        <Text style={styles.btnActionText}>{t("common.delete")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t("invoices.loading")}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
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
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu" size={26} color={colors.text} />
                    </TouchableOpacity>

                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={[styles.headerTitle, { fontSize: 20 }]}>🧾 {t("invoices.title")}</Text>
                        <Text style={styles.subtitle}>{t("invoices.subtitle")}</Text>
                    </View>

                    <View style={{ width: 26 }} />
                </View>

                {/* FILTERS */}
                <View style={styles.filterCard}>
                    <Text style={styles.filterTitle}>{t("invoices.filters")}</Text>
                    <View style={styles.filterRow}>
                        <TextInput
                            style={[styles.input, { flex: 2 }]}
                            placeholder={t("invoices.client")}
                            placeholderTextColor={colors.textSoft}
                            value={filterClient}
                            onChangeText={setFilterClient}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder={t("invoices.status")}
                            placeholderTextColor={colors.textSoft}
                            value={filterStatus}
                            onChangeText={setFilterStatus}
                        />
                    </View>
                    <View style={styles.filterRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder={t("invoices.from")}
                            placeholderTextColor={colors.textSoft}
                            value={filterFrom}
                            onChangeText={setFilterFrom}
                        />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder={t("invoices.to")}
                            placeholderTextColor={colors.textSoft}
                            value={filterTo}
                            onChangeText={setFilterTo}
                        />
                    </View>
                    <TouchableOpacity style={styles.btnReset} onPress={resetFilters}>
                        <Ionicons name="refresh" size={16} color={colors.primary} />
                        <Text style={styles.btnResetText}>{t("common.reset")}</Text>
                    </TouchableOpacity>
                </View>

                {/* LIST */}
                {filtered.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📄</Text>
                        <Text style={styles.emptyText}>{t("invoices.empty")}</Text>
                    </View>
                ) : (
                    <FlatList
                        data={paged}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderInvoiceItem}
                    />
                )}
            </ScrollView>

            {/* FLOATING BUTTON */}
            <TouchableOpacity style={styles.fab} onPress={openCreate}>
                <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
