// src/screens/invoice/InvoiceModel.jsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import dayjs from "dayjs";

import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import apiClient from "@apiClient";

const STATUS_OPTIONS = ["Pending", "Paid", "Overdue", "Cancelled"];

export default function InvoiceModel({ route, navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const { mode, invoice } = route.params || {};
    const isEditing = mode === "edit";

    const [form, setForm] = useState(
        invoice || {
            client: "",
            amount: "",
            tax: "",
            status: "Pending",
            issueDate: dayjs().format("YYYY-MM-DD"),
            paidDate: "",
        }
    );

    const [isSaving, setIsSaving] = useState(false);

    const saveInvoice = async () => {
        if (!form.client.trim() || !form.amount) {
            Alert.alert(t("common.error"), t("invoices.requiredFields"));
            return;
        }

        try {
            setIsSaving(true);

            const dto = {
                client: form.client.trim(),
                amount: parseFloat(form.amount),
                tax: parseFloat(form.tax) || 0,
                status: form.status,
                issueDate: form.issueDate,
                paidDate: form.paidDate || null,
            };

            apiClient.setAuthToken(token);

            if (isEditing) {
                await apiClient.put(`/invoice/${form.id}`, dto);
            } else {
                await apiClient.post("/invoice", dto);
            }

            navigation.goBack();
        } catch (err) {
            console.error("Save error:", err);
            Alert.alert(t("common.error"), t("invoices.saveError"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.overlay}>
            <SafeAreaView style={styles.modalContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {isEditing ? t("invoices.editTitle") : t("invoices.newTitle")}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <Ionicons name="close" size={22} color={colors.textSoft} />
                    </TouchableOpacity>
                </View>

                {/* Body */}
                <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
                    <FormInput
                        label={t("invoices.client")}
                        value={form.client}
                        placeholder={t("invoices.clientPlaceholder")}
                        onChange={(v) => setForm({ ...form, client: v })}
                        colors={colors}
                    />

                    <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t("invoices.amount")}</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="0.00"
                                placeholderTextColor={colors.textSoft}
                                value={form.amount}
                                onChangeText={(v) => setForm({ ...form, amount: v })}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t("invoices.tax")}</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="0.00"
                                placeholderTextColor={colors.textSoft}
                                value={form.tax}
                                onChangeText={(v) => setForm({ ...form, tax: v })}
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t("invoices.issueDate")}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textSoft}
                                value={form.issueDate}
                                onChangeText={(v) => setForm({ ...form, issueDate: v })}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>{t("invoices.paidDate")}</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textSoft}
                                value={form.paidDate}
                                onChangeText={(v) => setForm({ ...form, paidDate: v })}
                            />
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t("invoices.status")}</Text>
                        <View style={styles.typeSelector}>
                            {STATUS_OPTIONS.map((st) => (
                                <TouchableOpacity
                                    key={st}
                                    onPress={() => setForm({ ...form, status: st })}
                                    style={[
                                        styles.typeOption,
                                        form.status === st && styles.typeSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.typeText,
                                            {
                                                color:
                                                    form.status === st
                                                        ? colors.primary
                                                        : colors.textSoft,
                                            },
                                        ]}
                                    >
                                        {st}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>{t("invoices.summary")}</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>
                                {t("invoices.amountHT")}:
                            </Text>
                            <Text style={styles.summaryValue}>
                                €{parseFloat(form.amount || 0).toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>
                                {t("invoices.taxAmount")}:
                            </Text>
                            <Text style={styles.summaryValue}>
                                €{parseFloat(form.tax || 0).toFixed(2)}
                            </Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryTotal]}>
                            <Text style={styles.summaryTextBold}>
                                {t("invoices.totalTTC")}:
                            </Text>
                            <Text style={styles.summaryValueBold}>
                                €{(parseFloat(form.amount || 0) + parseFloat(form.tax || 0)).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnSecondary}>
                        <Text style={styles.btnSecondaryText}>{t("common.cancel")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={saveInvoice}
                        style={[styles.btnPrimary, isSaving && { opacity: 0.6 }]}
                        disabled={isSaving}
                    >
                        <Text style={styles.btnPrimaryText}>
                            {isEditing ? t("common.save") : t("common.create")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const FormInput = ({ label, placeholder, value, onChange, colors }) => (
    <View style={{ marginBottom: 14 }}>
        <Text style={{ color: colors.textSoft, fontWeight: "600", marginBottom: 6 }}>
            {label}
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
            placeholder={placeholder}
            placeholderTextColor={colors.textSoft}
            value={value}
            onChangeText={onChange}
        />
    </View>
);

const getStyles = (colors) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "center",
            alignItems: "center",
            padding: 12,
        },
        modalContainer: {
            backgroundColor: colors.background,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            width: "100%",
            maxHeight: "90%",
            overflow: "hidden",
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: { fontSize: 18, fontWeight: "700", color: colors.text },
        closeBtn: { padding: 6 },
        body: { padding: 16 },
        formGroup: { marginBottom: 14, marginTop: 14 },
        label: { color: colors.textSoft, fontWeight: "600", marginBottom: 6 },
        input: {
            backgroundColor: colors.surface2,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 10,
            color: colors.text,
        },
        typeSelector: {
            flexDirection: "row",
            gap: 10,
            marginTop: 6,
        },

        typeOption: {
            flex: 1,
            height: 42,
            backgroundColor: colors.surface2,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
        },

        typeSelected: {
            borderColor: colors.primary,
            backgroundColor: "#1e1b4b",
        },
        typeText: { fontWeight: "600", fontSize: 13 },
        summaryCard: {
            backgroundColor: colors.surface2,
            borderRadius: 12,
            padding: 14,
            marginTop: 28,
            borderWidth: 1,
            borderColor: colors.border,
        },
        summaryLabel: {
            fontSize: 14,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 10,
        },
        summaryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
        },
        summaryText: { color: colors.textSoft, fontSize: 13 },
        summaryValue: { color: colors.text, fontSize: 13 },
        summaryTotal: {
            marginTop: 6,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        summaryTextBold: {
            color: colors.text,
            fontSize: 15,
            fontWeight: "700",
        },
        summaryValueBold: {
            color: colors.primary,
            fontSize: 15,
            fontWeight: "700",
        },
        footer: {
            flexDirection: "row",
            justifyContent: "flex-end",
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: 14,
            gap: 10,
        },
        btnPrimary: {
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        btnPrimaryText: { color: "#fff", fontWeight: "700" },
        btnSecondary: {
            backgroundColor: "transparent",
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        btnSecondaryText: { color: colors.textSoft },
    });