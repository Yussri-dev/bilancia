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
import { invoiceApi } from "../../api/invoiceApi";
import { categoryApi } from "../../api/categoryApi";
import { useAuth } from "../../contexts/authContext";
import { useThemeColors } from "../../theme/color";
import { getStyles } from "../../theme/styles";
import { SafeAreaView } from "react-native-safe-area-context";

const statusOptions = ["Pending", "Paid", "Overdue", "Cancelled"];

export default function InvoiceScreen({ navigation }) {
    const { token } = useAuth();
    const colors = useThemeColors();
    const styles = getStyles(colors);

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
    const [formError, setFormError] = useState("");

    const [showValidate, setShowValidate] = useState(false);
    const [validatingInvoice, setValidatingInvoice] = useState(null);
    const [validateForm, setValidateForm] = useState({
        paidDate: dayjs().format("YYYY-MM-DD"),
        total: 0,
        categoryId: "",
        description: "",
        direction: "Sales",
    });
    const [validating, setValidating] = useState(false);
    const [validateError, setValidateError] = useState("");

    const [deleteInvoice, setDeleteInvoice] = useState(null);

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
            paidDate: invoice.paidDate ? dayjs(invoice.paidDate).format("YYYY-MM-DD") : "",
        });
        setFormError("");
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setFormError("");
    };

    const openValidateModal = (invoice) => {
        setValidatingInvoice(invoice);
        setValidateForm({
            paidDate: dayjs().format("YYYY-MM-DD"),
            total: invoice.amount + invoice.tax,
            categoryId: "",
            description: `Facture #${invoice.id} - ${invoice.client}`,
            direction: "Sales",
        });
        setValidateError("");
        setShowValidate(true);
    };

    const confirmDelete = (invoice) => {
        setDeleteInvoice(invoice);
    };

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
            <View style={[styles.card, { borderLeftColor: statusColor, borderLeftWidth: 3 }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.clientName}>{item.client}</Text>
                        <Text style={styles.meta}>
                            {dayjs(item.issueDate).format("YYYY-MM-DD")} • €{total.toFixed(2)}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
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

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Chargement des factures...</Text>
            </SafeAreaView>
        );
    }


    return (

        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>🧾 Factures</Text>
                        <Text style={styles.subtitle}>
                            Gérez vos factures et suivez les paiements
                        </Text>
                    </View>

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
                {filtered.length === 0 ? (
                    <View style={styles.empty}>
                        <Text style={styles.emptyIcon}>📄</Text>
                        <Text style={styles.emptyText}>Aucune facture trouvée</Text>
                    </View>
                ) : (
                    <FlatList
                        data={paged}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderInvoiceItem}
                    />
                )}
            </ScrollView>

            {/* ==================== Modal Créer / Éditer ==================== */}
            <Modal visible={showModal} animationType="fade" transparent onRequestClose={closeModal}>
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {editing ? "Modifier la facture" : "Nouvelle facture"}
                            </Text>
                            <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                <Ionicons name="close" size={22} color={colors.textSoft} />
                            </TouchableOpacity>
                        </View>

                        {/* Body */}
                        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nom du client</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nom du client"
                                    placeholderTextColor={colors.textSoft}
                                    value={form.client}
                                    onChangeText={(t) => setForm({ ...form, client: t })}
                                />
                            </View>

                            <View style={styles.formGroupRow}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Montant (HT)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="0.00"
                                        placeholderTextColor={colors.textSoft}
                                        value={form.amount}
                                        onChangeText={(t) => setForm({ ...form, amount: t })}
                                    />
                                </View>

                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>TVA (€)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        placeholder="0.00"
                                        placeholderTextColor={colors.textSoft}
                                        value={form.tax}
                                        onChangeText={(t) => setForm({ ...form, tax: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroupRow}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Date d’émission</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={colors.textSoft}
                                        value={form.issueDate}
                                        onChangeText={(t) => setForm({ ...form, issueDate: t })}
                                    />
                                </View>

                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Date de paiement</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor={colors.textSoft}
                                        value={form.paidDate}
                                        onChangeText={(t) => setForm({ ...form, paidDate: t })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Statut</Text>
                                <View style={styles.typeSelector}>
                                    {statusOptions.map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            onPress={() => setForm({ ...form, status })}
                                            style={[
                                                styles.typeOption,
                                                form.status === status && styles.typeSelected,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.typeText,
                                                    {
                                                        color:
                                                            form.status === status
                                                                ? colors.primary
                                                                : colors.textSoft,
                                                    },
                                                ]}
                                            >
                                                {status}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                onPress={closeModal}
                                style={styles.btnSecondary}
                            >
                                <Text style={styles.btnSecondaryText}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => Alert.alert("Save pressed (mock)")}
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

            {/* Floating "New Invoice" Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={openCreate}
            >
                <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>

        </SafeAreaView>
    );
}
