import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import AnalyticsApi from "@api/analyticsApi";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { File, Paths } from "expo-file-system";
import * as Sharing from 'expo-sharing';
import { useTranslation } from "react-i18next";

export default function AnalyticsScreen({ navigation }) {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const { t } = useTranslation();

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
            setError(t("analytics.loadError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // EXCEL / PDF EXPORT with NEW FileSystem API
    const exportFile = async (format) => {
        try {
            const { base64, fileName } = await AnalyticsApi.exportReport(format);

            // Use the new File API
            const file = new File(Paths.cache, fileName);

            // Write the base64 content to file
            await file.write(base64, { encoding: 'base64' });

            // Check if sharing is available
            const isSharingAvailable = await Sharing.isAvailableAsync();

            if (isSharingAvailable) {
                // Share the file
                await Sharing.shareAsync(file.uri, {
                    mimeType: format === "pdf"
                        ? "application/pdf"
                        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    dialogTitle: t("analytics.shareReport") || "Share Report"
                });
            } else {
                // Fallback: just show the path
                Alert.alert(
                    t("analytics.exportSuccessTitle"),
                    `${t("analytics.exportSuccessMessage")}\n\n${fileName}`,
                    [{ text: "OK" }]
                );
            }
        } catch (err) {
            console.error("Export error:", err);
            console.error("Error response:", err.response?.data);
            console.error("Error status:", err.response?.status);

            Alert.alert(
                t("analytics.errorTitle"),
                t("analytics.exportError", { format: format.toUpperCase() }) +
                `\n${err.message || 'Unknown error'}`
            );
        }
    };

    if (loading)
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={styles.loadingText}>{t("analytics.loading")}</Text>
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
                {/* HEADER */}
                <View style={[styles.header, { marginBottom: 20 }]}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu" size={26} color={colors.text} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { fontSize: 22 }]}>
                        📊 {t("analytics.title")}
                    </Text>

                    <View style={{ width: 26 }} />
                </View>

                {/* KPI GRID */}
                {overview && (
                    <View style={styles.kpiGrid}>
                        <StatCard
                            icon="cash-outline"
                            label={t("analytics.income")}
                            value={overview.totalIncome}
                            color={colors.success}
                            colors={colors}
                        />
                        <StatCard
                            icon="trending-down-outline"
                            label={t("analytics.expenses")}
                            value={overview.totalExpense}
                            color={colors.danger}
                            colors={colors}
                        />
                        <StatCard
                            icon="wallet-outline"
                            label={t("analytics.netBalance")}
                            value={overview.netBalance}
                            color={colors.text}
                            colors={colors}
                        />
                        <StatCard
                            icon="swap-horizontal-outline"
                            label={t("analytics.transactions")}
                            value={overview.transactionCount}
                            color={colors.text}
                            colors={colors}
                        />
                        <StatCard
                            icon="file-tray-outline"
                            label={t("analytics.pendingInvoices")}
                            value={overview.pendingInvoicesTotal}
                            color={colors.warning}
                            colors={colors}
                        />
                    </View>
                )}

                {/* RATIO */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        💹 {t("analytics.incomeExpenseRatio")}
                    </Text>

                    {ratio && (
                        <Text style={styles.meta}>
                            {ratio.income.toFixed(2)} / {ratio.expense.toFixed(2)} →{" "}
                            <Text style={{ fontWeight: "700", color: colors.primary }}>
                                {ratio.ratio.toFixed(2)}
                            </Text>
                        </Text>
                    )}
                </View>

                {/* AVERAGE + PREDICTION */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        📆 {t("analytics.avgMonthlyExpense")}
                    </Text>

                    {avg && (
                        <Text
                            style={[
                                styles.kpiValue,
                                { marginBottom: 6, fontSize: 22 },
                            ]}
                        >
                            {avg.averageMonthlyExpense.toFixed(2)} €
                        </Text>
                    )}

                    {prediction && (
                        <View style={{ marginTop: 8 }}>
                            <Text style={styles.cardTitle}>
                                📈 {t("analytics.nextMonthPrediction")}
                            </Text>
                            <Text
                                style={{
                                    color: colors.primary,
                                    fontSize: 22,
                                    fontWeight: "bold",
                                }}
                            >
                                {prediction.predictedExpenseNextMonth.toFixed(2)} €
                            </Text>
                        </View>
                    )}
                </View>

                {/* TOP CATEGORIES */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        🏷️ {t("analytics.topExpenseCategories")}
                    </Text>

                    {top.length === 0 ? (
                        <Text style={styles.emptyText}>
                            {t("analytics.noExpenses")}
                        </Text>
                    ) : (
                        top.map((tItem, i) => (
                            <View key={tItem.category} style={{ marginVertical: 10 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginBottom: 6,
                                    }}
                                >
                                    <Text style={styles.meta}>{tItem.category}</Text>
                                    <Text style={styles.kpiValue}>
                                        {tItem.totalSpent.toFixed(2)} €
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        backgroundColor: colors.surface2,
                                        height: 8,
                                        borderRadius: 10,
                                        overflow: "hidden",
                                    }}
                                >
                                    <View
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                (tItem.totalSpent /
                                                    top[0].totalSpent) *
                                                100
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

                {/* HISTORY */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        🗓️ {t("analytics.monthlyHistory")}
                    </Text>

                    {history.length === 0 ? (
                        <Text style={styles.emptyText}>{t("analytics.noHistory")}</Text>
                    ) : (
                        history.map((item) => (
                            <View
                                key={item.month}
                                style={{
                                    backgroundColor: colors.surface2,
                                    padding: 12,
                                    borderRadius: 12,
                                    marginBottom: 12,
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Text style={styles.meta}>{item.month}</Text>

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
                                        fontWeight: "700",
                                    }}
                                >
                                    {(item.income - item.expense).toFixed(2)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* EXPORT */}
                <View style={[styles.card, { marginBottom: 40 }]}>
                    <Text style={styles.cardTitle}>
                        📤 {t("analytics.exportReports")}
                    </Text>

                    <View
                        style={{
                            flexDirection: "row",
                            gap: 12,
                            marginTop: 12,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => exportFile("pdf")}
                            style={styles.btnPrimaryRounded}
                        >
                            <Ionicons
                                name="document-text-outline"
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.btnPrimaryText}>PDF</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => exportFile("excel")}
                            style={styles.btnPrimaryRounded}
                        >
                            <Ionicons
                                name="document-outline"
                                size={18}
                                color="#fff"
                            />
                            <Text style={styles.btnPrimaryText}>Excel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* === COMPONENT: StatCard (REBUILT) === */
const StatCard = ({ icon, label, value, color, colors }) => {
    return (
        <View
            style={{
                backgroundColor: colors.card,
                padding: 16,
                borderRadius: 18,
                marginBottom: 16,
                flexBasis: "48%",
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 4,
                borderLeftWidth: 3,
                borderLeftColor: color,
            }}
        >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name={icon} size={20} color={color} />
                <Text style={{ color: color, fontWeight: "700", fontSize: 18 }}>
                    € {value?.toFixed(2) ?? "0.00"}
                </Text>
            </View>

            <Text style={{ color: colors.textSoft, fontSize: 13, marginTop: 6 }}>
                {label}
            </Text>
        </View>
    );
};