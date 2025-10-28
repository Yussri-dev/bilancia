import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Modal,
    ScrollView,
    Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/color";
import { categoryApi } from "../../api/categoryApi";
import { useAuth } from "../../contexts/authContext";

export default function CategoryModalScreen({ route, navigation }) {
    const { token } = useAuth();
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
            Alert.alert("Nom requis", "Veuillez entrer un nom de catégorie");
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
            Alert.alert("Erreur", "Impossible d’enregistrer la catégorie");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.overlay}>
            <View style={styles.modalContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {isEditing ? "Modifier la catégorie" : "Nouvelle catégorie"}
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.closeBtn}
                    >
                        <Ionicons name="close" size={22} color={colors.textSoft} />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.body}>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Nom</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nom de la catégorie"
                            placeholderTextColor={colors.textSoft}
                            value={form.name}
                            onChangeText={(t) => setForm({ ...form, name: t })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Type</Text>
                        <View style={styles.typeSelector}>
                            {["Income", "Expense"].map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setForm({ ...form, type: t })}
                                    style={[
                                        styles.typeOption,
                                        form.type === t && styles.typeSelected,
                                    ]}
                                >
                                    <Ionicons
                                        name={t === "Income" ? "arrow-up" : "arrow-down"}
                                        size={18}
                                        color={
                                            form.type === t
                                                ? colors.primary
                                                : colors.textSoft
                                        }
                                    />
                                    <Text
                                        style={[
                                            styles.typeText,
                                            {
                                                color:
                                                    form.type === t
                                                        ? colors.primary
                                                        : colors.textSoft,
                                            },
                                        ]}
                                    >
                                        {t === "Income" ? "Revenu" : "Dépense"}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Icône</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: 📂, 🛒"
                            placeholderTextColor={colors.textSoft}
                            value={form.icon}
                            onChangeText={(t) => setForm({ ...form, icon: t })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Couleur</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="#16a34a"
                            placeholderTextColor={colors.textSoft}
                            value={form.colorHex}
                            onChangeText={(t) => setForm({ ...form, colorHex: t })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Groupe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex: Logement, Loisirs…"
                            placeholderTextColor={colors.textSoft}
                            value={form.groupName}
                            onChangeText={(t) => setForm({ ...form, groupName: t })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Ordre</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.textSoft}
                            value={String(form.order)}
                            onChangeText={(t) =>
                                setForm({ ...form, order: parseInt(t) || 0 })
                            }
                        />
                        <Text style={styles.helperText}>
                            Plus petit = affiché en premier
                        </Text>
                    </View>

                    <View style={styles.formGroupRow}>
                        <Text style={styles.label}>Archiver</Text>
                        <Switch
                            value={form.isArchived}
                            onValueChange={(v) =>
                                setForm({ ...form, isArchived: v })
                            }
                            trackColor={{ false: colors.border, true: colors.primary }}
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.btnSecondary}
                    >
                        <Text style={styles.btnSecondaryText}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={saveCategory}
                        style={[styles.btnPrimary, isSaving && { opacity: 0.6 }]}
                        disabled={isSaving}
                    >
                        <Text style={styles.btnPrimaryText}>
                            {isEditing ? "Enregistrer" : "Créer"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
    helperText: {
        color: colors.textSoft,
        fontSize: 12,
        marginTop: 4,
    },
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
