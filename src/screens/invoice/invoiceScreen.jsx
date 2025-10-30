import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { invoiceApi } from "../../api/invoiceApi";
import { categoryApi } from "../../api/categoryApi";
import { useAuth } from "../../contexts/authContext";
import { colors } from "../../theme/color";

const statusOptions = ["Pending", "Paid", "Overdue", "Cancelled"];

export default function InvoiceScreen({ navigation }) {
    const { token } = useAuth();

    // Data
    const [invoices, setInvoices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterClient, setFilterClient] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");

    // Pagination
    const [pageIndex, setPageIndex] = useState(0);
    const pageSize = 10;

    // Create/Edit Modal
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
    const [formError, setFormError] = useState("");

    // Validate Modal
    const [showValidate, setShowValidate] = useState(false);
    const [validatingInvoice, setValidatingInvoice] = useState(null);
    const [validateForm, setValidateForm] = useState({
        paidDate: dayjs().format("YYYY-MM-DD"),
        total: 0,
        categoryId: "",
        description: "",
    });
    const [validating, setValidating] = useState(false);
    const [validateError, setValidateError] = useState("");

    // Delete confirmation
    const [deleteInvoice, setDeleteInvoice] = useState(null);

    // Load data
    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [invoicesData, categoriesData] = await Promise.all([
                invoiceApi.getAll(token),
                categoryApi.getCategories(token),
            ]);
            setInvoices(invoicesData || []);
            setCategories(categoriesData || []);
        } catch (error) {
            console.error(error);
            Alert.alert("Erreur", "Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadData);
        return unsubscribe;
    }, [navigation, loadData]);

    // Apply filters
    useEffect(() => {
        let result = [...invoices];

        if (filterClient) {
            result = result.filter((inv) =>
                inv.client?.toLowerCase().includes(filterClient.toLowerCase())
            );
        }

        if (filterStatus) {
            result = result.filter((inv) =>
                inv.status?.toLowerCase() === filterStatus.toLowerCase()
            );
        }

        if (filterFrom) {
            result = result.filter(
                (inv) => dayjs(inv.issueDate).format("YYYY-MM-DD") >= filterFrom
            );
        }

        if (filterTo) {
            result = result.filter(
                (inv) => dayjs(inv.issueDate).format("YYYY-MM-DD") <= filterTo
            );
        }

        result.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
        setFiltered(result);
        setPageIndex(0);
    }, [invoices, filterClient, filterStatus, filterFrom, filterTo]);

    // Pagination
    const paged = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    const totalPages = Math.ceil(filtered.length / pageSize);

    const resetFilters = () => {
        setFilterClient("");
        setFilterStatus("");
        setFilterFrom("");
        setFilterTo("");
    };

    // Create/Edit handlers
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
        setFormError("");
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
            paidDate: invoice.paidDate
                ? dayjs(invoice.paidDate).format("YYYY-MM-DD")
                : "",
        });
        setFormError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setFormError("");
    };

    const saveInvoice = async () => {
        // Validation
        if (!form.client.trim()) {
            setFormError("Le client est obligatoire");
            return;
        }
        if (!form.issueDate) {
            setFormError("La date d'émission est obligatoire");
            return;
        }
        if (parseFloat(form.amount) < 0) {
            setFormError("Le montant doit être ≥ 0");
            return;
        }
        if (parseFloat(form.tax) < 0) {
            setFormError("La TVA doit être ≥ 0");
            return;
        }

        setSaving(true);
        setFormError("");

        const dto = {
            client: form.client.trim(),
            amount: parseFloat(form.amount) || 0,
            tax: parseFloat(form.tax) || 0,
            issueDate: form.issueDate,
            paidDate: form.paidDate || null,
            status: form.status,
        };

        try {
            if (editing) {
                await invoiceApi.updateInvoice(token, editing.id, dto);
            } else {
                await invoiceApi.createInvoice(token, dto);
            }
            closeModal();
            await loadData();
        } catch (error) {
            console.error(error);
            setFormError("Impossible d'enregistrer la facture");
        } finally {
            setSaving(false);
        }
    };

    // Delete handler
    const confirmDelete = (invoice) => {
        setDeleteInvoice(invoice);
    };

    const deleteConfirmed = async () => {
        if (!deleteInvoice) return;

        try {
            await invoiceApi.deleteInvoice(token, deleteInvoice.id);
            setDeleteInvoice(null);
            await loadData();
        } catch (error) {
            console.error(error);
            Alert.alert("Erreur", "Échec de la suppression");
        }
    };

    // Validate handlers
    const openValidateModal = (invoice) => {
        const incomeCategories = categories.filter(
            (c) => c.type?.toLowerCase() === "income"
        );

        setValidatingInvoice(invoice);
        setValidateForm({
            paidDate: invoice.paidDate
                ? dayjs(invoice.paidDate).format("YYYY-MM-DD")
                : dayjs().format("YYYY-MM-DD"),
            total: invoice.amount + invoice.tax,
            categoryId: incomeCategories[0]?.id?.toString() || "",
            description: `Invoice #${invoice.id} - ${invoice.client}`,
        });
        setValidateError("");
        setShowValidate(true);
    };

    const closeValidateModal = () => {
        setShowValidate(false);
        setValidatingInvoice(null);
        setValidateError("");
    };

    const validateAndCreateTransaction = async () => {
        if (!validateForm.paidDate) {
            setValidateError("Veuillez choisir la date de paiement");
            return;
        }
        if (validateForm.total <= 0) {
            setValidateError("Le total doit être > 0");
            return;
        }
        if (!validateForm.categoryId) {
            setValidateError("Sélectionnez une catégorie");
            return;
        }

        setValidating(true);
        setValidateError("");

        try {
            await invoiceApi.validateToTransaction(token, validatingInvoice.id, {
                paidDate: validateForm.paidDate,
                amount: validateForm.total,
                categoryId: parseInt(validateForm.categoryId),
                userGroupId: null,
                description: validateForm.description,
            });

            closeValidateModal();
            await loadData();
            Alert.alert("Succès", "Facture validée et transaction créée");
        } catch (error) {
            console.error(error);
            setValidateError("Échec de la validation");
        } finally {
            setValidating(false);
        }
    };

    // Render helpers
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
            <View style={[styles.card, { borderLeftColor: statusColor }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{item.client}</Text>
                        <Text style={styles.meta}>
                            {dayjs(item.issueDate).format("YYYY-MM-DD")} • €
                            {total.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDetails}>
                    <Text style={styles.detailText}>Montant HT: €{item.amount.toFixed(2)}</Text>
                    <Text style={styles.detailText}>TVA: €{item.tax.toFixed(2)}</Text>
                    {item.paidDate && (
                        <Text style={styles.detailText}>
                            Payée le: {dayjs(item.paidDate).format("YYYY-MM-DD")}
                        </Text>
                    )}
                </View>

                <View style={styles.cardActions}>
                    {item.status?.toLowerCase() !== "paid" && (
                        <TouchableOpacity
                            style={[styles.btnAction, styles.btnSuccess]}
                            onPress={() => openValidateModal(item)}
                        >
                            <Ionicons name="checkmark-circle" size={16} color="#fff" />
                            <Text style={styles.btnActionText}>Valider</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.btnAction, styles.btnPrimary]}
                        onPress={() => openEdit(item)}
                    >
                        <Ionicons name="pencil" size={16} color="#fff" />
                        <Text style={styles.btnActionText}>Éditer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnAction, styles.btnDanger]}
                        onPress={() => confirmDelete(item)}
                    >
                        <Ionicons name="trash" size={16} color="#fff" />
                        <Text style={styles.btnActionText}>Supprimer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const incomeCategories = categories.filter(
        (c) => c.type?.toLowerCase() === "income"
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des factures...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>🧾 Factures</Text>
                    <Text style={styles.subtitle}>
                        Gérez vos factures et suivez les paiements
                    </Text>
                </View>
                <TouchableOpacity style={styles.btnPrimary} onPress={openCreate}>
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text style={styles.btnText}>Nouveau</Text>
                </TouchableOpacity>
            </View>

            {/* Filters */}
            <View style={styles.filterCard}>
                <Text style={styles.filterTitle}>🔍 Filtres</Text>
                <View style={styles.filterRow}>
                    <TextInput
                        style={[styles.input, { flex: 2 }]}
                        placeholder="Client"
                        placeholderTextColor={colors.textSoft}
                        value={filterClient}
                        onChangeText={setFilterClient}
                    />
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Statut"
                        placeholderTextColor={colors.textSoft}
                        value={filterStatus}
                        onChangeText={setFilterStatus}
                    />
                </View>
                <View style={styles.filterRow}>
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
                <TouchableOpacity style={styles.btnReset} onPress={resetFilters}>
                    <Ionicons name="refresh" size={16} color={colors.primary} />
                    <Text style={styles.btnResetText}>Réinitialiser</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <Text style={styles.statText}>
                    Total: <Text style={styles.statValue}>{filtered.length}</Text>
                </Text>
                <Text style={styles.statText}>
                    Page {pageIndex + 1} / {totalPages || 1}
                </Text>
            </View>

            {/* List */}
            {paged.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={styles.emptyIcon}>📄</Text>
                    <Text style={styles.emptyText}>Aucune facture trouvée</Text>
                </View>
            ) : (
                <FlatList
                    data={paged}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderInvoiceItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            {/* Pagination */}
            {filtered.length > pageSize && (
                <View style={styles.pagination}>
                    <TouchableOpacity
                        style={[styles.btnPage, pageIndex === 0 && styles.btnPageDisabled]}
                        onPress={() => setPageIndex((p) => Math.max(0, p - 1))}
                        disabled={pageIndex === 0}
                    >
                        <Text style={styles.btnPageText}>← Précédent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.btnPage,
                            pageIndex >= totalPages - 1 && styles.btnPageDisabled,
                        ]}
                        onPress={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={pageIndex >= totalPages - 1}
                    >
                        <Text style={styles.btnPageText}>Suivant →</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Create/Edit Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <ScrollView>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editing ? "Modifier la facture" : "Nouvelle facture"}
                                </Text>
                                <TouchableOpacity onPress={closeModal}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Client *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nom du client"
                                    placeholderTextColor={colors.textSoft}
                                    value={form.client}
                                    onChangeText={(text) => setForm({ ...form, client: text })}
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Date d'émission *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={colors.textSoft}
                                        value={form.issueDate}
                                        onChangeText={(text) =>
                                            setForm({ ...form, issueDate: text })
                                        }
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Date de paiement</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={colors.textSoft}
                                        value={form.paidDate}
                                        onChangeText={(text) =>
                                            setForm({ ...form, paidDate: text })
                                        }
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Montant (HT) *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0.00"
                                        placeholderTextColor={colors.textSoft}
                                        keyboardType="numeric"
                                        value={form.amount}
                                        onChangeText={(text) => setForm({ ...form, amount: text })}
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>TVA *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0.00"
                                        placeholderTextColor={colors.textSoft}
                                        keyboardType="numeric"
                                        value={form.tax}
                                        onChangeText={(text) => setForm({ ...form, tax: text })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Statut</Text>
                                <View style={styles.statusButtons}>
                                    {statusOptions.map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[
                                                styles.statusButton,
                                                form.status === status && styles.statusButtonActive,
                                            ]}
                                            onPress={() => setForm({ ...form, status })}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusButtonText,
                                                    form.status === status &&
                                                    styles.statusButtonTextActive,
                                                ]}
                                            >
                                                {status}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {formError ? (
                                <Text style={styles.errorText}>{formError}</Text>
                            ) : null}

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnSecondary]}
                                    onPress={closeModal}
                                >
                                    <Text style={styles.btnSecondaryText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnPrimary]}
                                    onPress={saveInvoice}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.btnText}>
                                            {editing ? "Enregistrer" : "Créer"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Validate Modal */}
            <Modal visible={showValidate} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                ✅ Valider facture → Créer transaction
                            </Text>
                            <TouchableOpacity onPress={closeValidateModal}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Client</Text>
                            <TextInput
                                style={[styles.input, styles.inputDisabled]}
                                value={validatingInvoice?.client || ""}
                                editable={false}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Date de paiement *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={colors.textSoft}
                                    value={validateForm.paidDate}
                                    onChangeText={(text) =>
                                        setValidateForm({ ...validateForm, paidDate: text })
                                    }
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Total (€) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.textSoft}
                                    keyboardType="numeric"
                                    value={validateForm.total.toString()}
                                    onChangeText={(text) =>
                                        setValidateForm({
                                            ...validateForm,
                                            total: parseFloat(text) || 0,
                                        })
                                    }
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Catégorie (revenu) *</Text>
                            <View style={styles.pickerContainer}>
                                {incomeCategories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        style={[
                                            styles.pickerOption,
                                            validateForm.categoryId === cat.id.toString() &&
                                            styles.pickerOptionActive,
                                        ]}
                                        onPress={() =>
                                            setValidateForm({
                                                ...validateForm,
                                                categoryId: cat.id.toString(),
                                            })
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.pickerOptionText,
                                                validateForm.categoryId === cat.id.toString() &&
                                                styles.pickerOptionTextActive,
                                            ]}
                                        >
                                            {cat.icon || "📂"} {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Description de la transaction"
                                placeholderTextColor={colors.textSoft}
                                value={validateForm.description}
                                onChangeText={(text) =>
                                    setValidateForm({ ...validateForm, description: text })
                                }
                            />
                        </View>

                        {validateError ? (
                            <Text style={styles.errorText}>{validateError}</Text>
                        ) : null}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnSecondary]}
                                onPress={closeValidateModal}
                            >
                                <Text style={styles.btnSecondaryText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnSuccess]}
                                onPress={validateAndCreateTransaction}
                                disabled={validating}
                            >
                                {validating ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.btnText}>Valider & Créer</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal visible={deleteInvoice !== null} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { maxHeight: 200 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Confirmer la suppression</Text>
                            <TouchableOpacity onPress={() => setDeleteInvoice(null)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.confirmText}>
                            Supprimer la facture{" "}
                            <Text style={styles.confirmHighlight}>
                                {deleteInvoice?.client}
                            </Text>{" "}
                            ?
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnSecondary]}
                                onPress={() => setDeleteInvoice(null)}
                            >
                                <Text style={styles.btnSecondaryText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnDanger]}
                                onPress={deleteConfirmed}
                            >
                                <Text style={styles.btnText}>Supprimer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    loadingText: {
        color: colors.textSoft,
        marginTop: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: colors.text,
    },
    subtitle: {
        color: colors.textSoft,
        fontSize: 14,
        marginTop: 4,
    },
    btnPrimary: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    btnText: {
        color: "#fff",
        fontWeight: "600",
    },
    filterCard: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
    },
    filterTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 10,
    },
    filterRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surface2,
        color: colors.text,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputDisabled: {
        opacity: 0.6,
    },
    btnReset: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        gap: 6,
        padding: 8,
    },
    btnResetText: {
        color: colors.primary,
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    statText: {
        color: colors.textSoft,
        fontSize: 14,
    },
    statValue: {
        color: colors.text,
        fontWeight: "700",
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: 4,
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    clientName: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.text,
    },
    meta: {
        fontSize: 13,
        color: colors.textSoft,
        marginTop: 4,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    cardDetails: {
        marginBottom: 10,
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: colors.textSoft,
    },
    cardActions: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
    },
    btnAction: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    btnSuccess: {
        backgroundColor: colors.success,
    },
    btnDanger: {
        backgroundColor: colors.danger,
    },
    btnActionText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    empty: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        color: colors.textSoft,
        fontSize: 16,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        gap: 10,
    },
    btnPage: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    btnPageDisabled: {
        opacity: 0.4,
    },
    btnPageText: {
        color: colors.text,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalCard: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 20,
        width: "100%",
        maxWidth: 500,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: colors.text,
        flex: 1,
    },
    formGroup: {
        marginBottom: 16,
    },
    formRow: {
        flexDirection: "row",
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.text,
        marginBottom: 6,
    },
    statusButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    statusButton: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    statusButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    statusButtonText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "600",
    },
    statusButtonTextActive: {
        color: "#fff",
    },
    pickerContainer: {
        gap: 8,
    },
    pickerOption: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    pickerOptionActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    pickerOptionText: {
        color: colors.text,
        fontSize: 14,
    },
    pickerOptionTextActive: {
        color: "#fff",
        fontWeight: "600",
    },
    errorText: {
        color: colors.danger,
        fontSize: 13,
        marginTop: 8,
        marginBottom: 8,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 20,
    },
    btn: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 100,
    },
    btnSecondary: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    btnSecondaryText: {
        color: colors.text,
        fontWeight: "600",
    },
    confirmText: {
        fontSize: 16,
        color: colors.text,
        marginVertical: 20,
    },
    confirmHighlight: {
        fontWeight: "700",
        color: colors.primary,
    },
});