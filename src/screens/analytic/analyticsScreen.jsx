import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { getStyles } from "../../theme/styles";
import AnalyticsApi from "../../api/analyticsApi";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

export default function AnalyticsScreen({ navigation }) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [overview, setOverview] = useState(null);
    const [ratio, setRatio] = useState(null);
    const [avg, setAvg] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [top, setTop] = useState([]);
    const [history, setHistory] = useState([]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [
                overviewRes,
                historyRes,
                topRes,
                ratioRes,
                avgRes,
                predictionRes,
            ] = await Promise.all([
                AnalyticsApi.getOverview(),
                AnalyticsApi.getMonthlyHistory(),
                AnalyticsApi.getTopExpenseCategories(),
                AnalyticsApi.getIncomeExpenseRatio(),
                AnalyticsApi.getAverageMonthlyExpense(),
                AnalyticsApi.getNextMonthPrediction(),
            ]);

            setOverview(overviewRes);
            setHistory(historyRes || []);
            setTop(topRes || []);
            setRatio(ratioRes);
            setAvg(avgRes);
            setPrediction(predictionRes);
        } catch (err) {
            console.error(err);
            setError("Erreur lors du chargement des données analytics.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ✅ Export to PDF / Excel (Expo-safe)
    const exportFile = async (format) => {
        try {
            const res = await AnalyticsApi.exportReport(format);

            // Convert to base64 via Buffer (polyfilled in App.js)
            const base64 = Buffer.from(res.data, "binary").toString("base64");

            const fileName =
                format === "pdf"
                    ? "rapport_analytics.pdf"
                    : "rapport_analytics.xlsx";
            const path = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(path, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert("✅ Export réussi", `Fichier enregistré :\n${path}`);
        } catch (err) {
            console.error("Export error:", err);
            Alert.alert("Erreur", `Échec de l'export ${format.toUpperCase()}`);
        }
    };

    if (loading)
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>Chargement des analytics...</Text>
            </View>
        );

    if (error)
        return (
            <View style={[styles.container, { padding: 20 }]}>
                <Text style={{ color: colors.danger }}>{error}</Text>
            </View>
        );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
            >
                {/* === HEADER === */}
                <View style={[styles.header, { marginBottom: 20 }]}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu" size={26} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontSize: 22 }]}>📊 Analytics</Text>
                    <View style={{ width: 26 }} />
                </View>

                {/* === KPI GRID === */}
                {overview && (
                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="cash-outline"
                            label="Revenus"
                            value={overview.totalIncome}
                            color={colors.success}
                        />
                        <StatCard
                            icon="trending-down-outline"
                            label="Dépenses"
                            value={overview.totalExpense}
                            color={colors.danger}
                        />
                        <StatCard
                            icon="wallet-outline"
                            label="Solde net"
                            value={overview.netBalance}
                            color={colors.text}
                        />
                        <StatCard
                            icon="swap-horizontal-outline"
                            label="Transactions"
                            value={overview.transactionCount}
                            color={colors.text}
                        />
                        <StatCard
                            icon="file-tray-outline"
                            label="Factures en attente"
                            value={overview.pendingInvoicesTotal}
                            color={colors.warning}
                        />
                    </View>
                )}

                {/* === RATIO === */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💹 Ratio Revenus / Dépenses</Text>
                    {ratio && (
                        <Text style={{ color: colors.text, fontSize: 16 }}>
                            {`${ratio.income.toFixed(2)} / ${ratio.expense.toFixed(2)} → `}
                            <Text style={{ fontWeight: "700", color: colors.primary }}>
                                {ratio.ratio.toFixed(2)}
                            </Text>
                        </Text>
                    )}
                </View>

                {/* === MOYENNE + PRÉVISION === */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📆 Dépense mensuelle moyenne</Text>
                    {avg && (
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: 20,
                                fontWeight: "bold",
                                marginBottom: 6,
                            }}
                        >
                            {avg.averageMonthlyExpense.toFixed(2)} €
                        </Text>
                    )}
                    {prediction && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={styles.cardTitle}>📈 Prévision mois prochain</Text>
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: 20,
                                    fontWeight: "bold",
                                }}
                            >
                                {prediction.predictedExpenseNextMonth.toFixed(2)} €
                            </Text>
                        </View>
                    )}
                </View>

                {/* === TOP CATÉGORIES === */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏷️ Top catégories de dépenses</Text>
                    {top.length === 0 ? (
                        <Text style={styles.muted}>Aucune dépense.</Text>
                    ) : (
                        top.map((t, i) => (
                            <View key={t.category} style={{ marginVertical: 8 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginBottom: 4,
                                    }}
                                >
                                    <Text style={{ color: colors.text }}>{t.category}</Text>
                                    <Text style={{ color: colors.text }}>
                                        {t.totalSpent.toFixed(2)} €
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        backgroundColor: colors.surface2,
                                        height: 8,
                                        borderRadius: 8,
                                        overflow: "hidden",
                                    }}
                                >
                                    <View
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                (t.totalSpent / top[0].totalSpent) * 100
                                            )}%`,
                                            backgroundColor:
                                                i === 0
                                                    ? colors.primary
                                                    : i === 1
                                                        ? colors.success
                                                        : colors.warning,
                                            height: "100%",
                                        }}
                                    />
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* === HISTORIQUE === */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🗓️ Historique mensuel</Text>
                    {history.map((item) => (
                        <View
                            key={item.month}
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                paddingVertical: 8,
                                borderBottomColor: colors.border,
                                borderBottomWidth: 1,
                            }}
                        >
                            <Text style={{ color: colors.textSoft }}>{item.month}</Text>
                            <Text style={{ color: colors.success }}>
                                +{item.income.toFixed(2)}
                            </Text>
                            <Text style={{ color: colors.danger }}>
                                -{item.expense.toFixed(2)}
                            </Text>
                            <Text
                                style={{
                                    color:
                                        item.income - item.expense >= 0
                                            ? colors.success
                                            : colors.danger,
                                    fontWeight: "600",
                                }}
                            >
                                {(item.income - item.expense).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* === EXPORT === */}
                <View style={[styles.card, { marginBottom: 30 }]}>
                    <Text style={styles.cardTitle}>📤 Exporter vos rapports</Text>
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={() => exportFile("pdf")}
                            style={[styles.btnPrimary, { marginRight: 10 }]}
                        >
                            <Ionicons name="document-text-outline" size={18} color="#fff" />
                            <Text style={styles.btnText}>PDF</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => exportFile("excel")}
                            style={styles.btnPrimary}
                        >
                            <Ionicons name="document-outline" size={18} color="#fff" />
                            <Text style={styles.btnText}>Excel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* === COMPONENT: StatCard === */
const StatCard = ({ icon, label, value, color }) => {
    return (
        <View style={{ ...statCardStyle, borderColor: color }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name={icon} size={20} color={color} />
                <Text style={{ color: color, fontWeight: "700", fontSize: 16 }}>
                    € {value?.toFixed(2) ?? "0.00"}
                </Text>
            </View>
            <Text style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>
                {label}
            </Text>
        </View>
    );
};

const statCardStyle = {
    flexBasis: "48%",
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 12,
};
