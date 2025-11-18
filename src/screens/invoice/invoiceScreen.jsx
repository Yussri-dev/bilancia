// src/screens/invoices/InvoiceScreen.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";

import apiClient from "@apiClient";
import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import { useTranslation } from "react-i18next";

export default function InvoiceScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterClient, setFilterClient] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            apiClient.setAuthToken(token);
            const res = await apiClient.get("/invoice");
            setInvoices(res.data || []);
        } catch (err) {
            console.error(err);
            Alert.alert(t("common.error"), t("invoices.loadError"));
        } finally {
            setLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        const unsub = navigation.addListener("focus", loadData);
        return unsub;
    }, [navigation, loadData]);

    // FILTERING
    const filtered = invoices
        .filter((i) =>
            filterClient ? i.client.toLowerCase().includes(filterClient.toLowerCase()) : true
        )
        .filter((i) =>
            filterStatus ? i.status.toLowerCase() === filterStatus.toLowerCase() : true
        )
        .filter((i) =>
            filterFrom ? dayjs(i.issueDate).format("YYYY-MM-DD") >= filterFrom : true
        )
        .filter((i) =>
            filterTo ? dayjs(i.issueDate).format("YYYY-MM-DD") <= filterTo : true
        )
        .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

    const resetFilters = () => {
        setFilterClient("");
        setFilterStatus("");
        setFilterFrom("");
        setFilterTo("");
    };

    // DELETE
    const confirmDelete = (invoice) => {
        Alert.alert(
            t("common.confirm"),
            `${t("invoices.deleteConfirm")} ${invoice.client}?`,
            [
                { text: t("common.cancel"), style: "cancel" },
                {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            apiClient.setAuthToken(token);
                            await apiClient.delete(`/invoice/${invoice.id}`);
                            await loadData();
                        } catch (error) {
                            console.error("Delete failed:", error);
                            Alert.alert(t("common.error"), t("invoices.deleteError"));
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (st) => {
        switch (st?.toLowerCase()) {
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

    // CARD RENDER
    const renderItem = ({ item }) => {
        const metaColor = getStatusColor(item.status);

        return (
            <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: metaColor }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardName}>{item.client}</Text>
                        <Text style={styles.meta}>
                            {dayjs(item.issueDate).format("DD/MM/YYYY")} • €
                            {(item.amount + item.tax).toFixed(2)}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: `${metaColor}22` },
                        ]}
                    >
                        <Text style={[styles.statusText, { color: metaColor }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={{ marginTop: 10 }}>
                    <Text style={styles.detailText}>
                        {t("invoices.amountHT")}: €{item.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.detailText}>
                        TVA: €{item.tax.toFixed(2)}
                    </Text>
                    {item.paidDate ? (
                        <Text style={styles.detailText}>
                            {t("invoices.paidOn")}: {dayjs(item.paidDate).format("DD/MM/YYYY")}
                        </Text>
                    ) : null}
                </View>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        marginTop: 12,
                        gap: 10,
                    }}
                >
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("InvoiceModel", {
                                mode: "edit",
                                invoice: {
                                    ...item,
                                    amount: String(item.amount),
                                    tax: String(item.tax),
                                    issueDate: dayjs(item.issueDate).format("YYYY-MM-DD"),
                                    paidDate: item.paidDate
                                        ? dayjs(item.paidDate).format("YYYY-MM-DD")
                                        : "",
                                },
                            })
                        }
                        style={[styles.btnAction, styles.btnSuccess]}
                    >
                        <Ionicons name="pencil" size={14} color="#fff" />
                        <Text style={styles.btnActionText}>{t("common.edit")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => confirmDelete(item)}
                        style={[styles.btnAction, styles.btnDanger]}
                    >
                        <Ionicons name="trash" size={14} color="#fff" />
                        <Text style={styles.btnActionText}>{t("common.delete")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // LOADING
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
                    <Text style={[styles.headerTitle, { fontSize: 20 }]}>
                        🧾 {t("invoices.title")}
                    </Text>
                    <Text style={styles.subtitle}>{t("invoices.subtitle")}</Text>
                </View>

                <View style={{ width: 26 }} />
            </View>

            {/* FILTERS */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{t("invoices.filters")}</Text>

                <TextInput
                    style={styles.input}
                    placeholder={t("invoices.filterClient")}
                    placeholderTextColor={colors.textSoft}
                    value={filterClient}
                    onChangeText={setFilterClient}
                />

                <TextInput
                    style={styles.input}
                    placeholder={t("invoices.filterStatus")}
                    placeholderTextColor={colors.textSoft}
                    value={filterStatus}
                    onChangeText={setFilterStatus}
                />

                <View style={{ flexDirection: "row", gap: 10 }}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Du (YYYY-MM-DD)"
                        placeholderTextColor={colors.textSoft}
                        value={filterFrom}
                        onChangeText={setFilterFrom}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Au (YYYY-MM-DD)"
                        placeholderTextColor={colors.textSoft}
                        value={filterTo}
                        onChangeText={setFilterTo}
                    />
                </View>

                <TouchableOpacity style={styles.btnSecondary} onPress={resetFilters}>
                    <Text style={styles.btnSecondaryText}>{t("common.reset")}</Text>
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
                    data={filtered}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={renderItem}
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate("InvoiceModel", { mode: "create" })}
            >
                <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}