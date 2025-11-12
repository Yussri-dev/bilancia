// src/screens/categories/CategoryModel.jsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ScrollView,
    Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@contexts/authContext";
import { categoryApi } from "@api/categoryApi";
import { useTheme } from "@contexts/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function CategoryModel({ route, navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const { mode, category } = route.params || {};
    const isEditing = mode === "edit";

    const [form, setForm] = useState(
        category || {
            name: "",
            type: "Income",
            icon: "📂",
            colorHex: "#16a34a",
            groupName: "",
            order: 0,
            isArchived: false,
        }
    );

    const [isSaving, setIsSaving] = useState(false);

    const saveCategory = async () => {
        if (!form.name.trim()) {
            Alert.alert(t("common.error"), t("categoryModel.nameRequired"));
            return;
        }

        try {
            setIsSaving(true);
            if (isEditing) {
                await categoryApi.updateCategory(token, form.id, form);
            } else {
                await categoryApi.createCategory(token, form);
            }
            navigation.goBack();
        } catch (err) {
            console.error("Save error:", err);
            Alert.alert(t("common.error"), t("categoryModel.saveError"));
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
                        {isEditing ? t("categoryModel.editTitle") : t("categoryModel.newTitle")}
                    </Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <Ionicons name="close" size={22} color={colors.textSoft} />
                    </TouchableOpacity>
                </View>

                {/* Body */}
                <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
                    <FormInput
                        label={t("categoryModel.name")}
                        value={form.name}
                        placeholder={t("categoryModel.namePlaceholder")}
                        onChange={(t) => setForm({ ...form, name: t })}
                        colors={colors}
                    />

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t("categoryModel.type")}</Text>
                        <View style={styles.typeSelector}>
                            {["Income", "Expense"].map((tType) => (
                                <TouchableOpacity
                                    key={tType}
                                    onPress={() => setForm({ ...form, type: tType })}
                                    style={[
                                        styles.typeOption,
                                        form.type === tType && styles.typeSelected,
                                    ]}
                                >
                                    <Ionicons
                                        name={tType === "Income" ? "arrow-up" : "arrow-down"}
                                        size={18}
                                        color={
                                            form.type === tType ? colors.primary : colors.textSoft
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.typeText,
                                            {
                                                color:
                                                    form.type === tType
                                                        ? colors.primary
                                                        : colors.textSoft,
                                            },
                                        ]}
                                    >
                                        {tType === "Income"
                                            ? t("categoryModel.income")
                                            : t("categoryModel.expense")}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <FormInput
                        label={t("categoryModel.icon")}
                        value={form.icon}
                        placeholder={t("categoryModel.iconPlaceholder")}
                        onChange={(t) => setForm({ ...form, icon: t })}
                        colors={colors}
                    />

                    <FormInput
                        label={t("categoryModel.color")}
                        value={form.colorHex}
                        placeholder={t("categoryModel.colorPlaceholder")}
                        onChange={(t) => setForm({ ...form, colorHex: t })}
                        colors={colors}
                    />

                    <FormInput
                        label={t("categoryModel.group")}
                        value={form.groupName}
                        placeholder={t("categoryModel.groupPlaceholder")}
                        onChange={(t) => setForm({ ...form, groupName: t })}
                        colors={colors}
                    />

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>{t("categoryModel.order")}</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.textSoft}
                            value={String(form.order)}
                            onChangeText={(t) => setForm({ ...form, order: parseInt(t) || 0 })}
                        />
                        <Text style={styles.helperText}>
                            {t("categoryModel.orderHint")}
                        </Text>
                    </View>

                    <View style={styles.formGroupRow}>
                        <Text style={styles.label}>{t("categoryModel.archive")}</Text>
                        <Switch
                            value={form.isArchived}
                            onValueChange={(v) => setForm({ ...form, isArchived: v })}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={form.isArchived ? colors.primary : colors.surface2}
                        />
                    </View>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.btnSecondary}>
                        <Text style={styles.btnSecondaryText}>{t("common.cancel")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={saveCategory}
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
        formGroup: { marginBottom: 14 },
        formGroupRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
        },
        label: { color: colors.textSoft, fontWeight: "600", marginBottom: 6 },
        input: {
            backgroundColor: colors.surface2,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 10,
            color: colors.text,
        },
        helperText: { color: colors.textSoft, fontSize: 12, marginTop: 4 },
        typeSelector: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
        },
        typeOption: {
            flex: 1,
            backgroundColor: colors.surface2,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
        },
        typeSelected: {
            borderColor: colors.primary,
            backgroundColor: "#1e1b4b",
        },
        typeText: { fontWeight: "600" },
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
