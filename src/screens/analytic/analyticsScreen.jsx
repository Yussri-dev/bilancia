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
import * as Sharing from 'expo-sharing';
import { useTranslation } from "react-i18next";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

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

    const exportFile = async (format) => {
        try {
            // 1) Android permission
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== "granted") {
                throw new Error("Permission required to save files.");
            }

            // 2) API call
            const result = await AnalyticsApi.exportReport(format);

            if (!result || !result.base64 || !result.fileName) {
                throw new Error("Invalid export data received");
            }

            const { base64, fileName } = result;

            // 3) Prefer documentDirectory on Android
            const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;

            if (!directory) throw new Error("File system not available");

            const fileUri = directory + fileName;

            // 4) Write base64 file
            await FileSystem.writeAsStringAsync(fileUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const info = await FileSystem.getInfoAsync(fileUri);
            if (!info.exists) throw new Error("Failed to create file");

            // 5) Share
            await Sharing.shareAsync(fileUri, {
                mimeType:
                    format === "pdf"
                        ? "application/pdf"
                        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                dialogTitle: "Share Report",
            });

        } catch (err) {
            console.error("Export error:", err);
            Alert.alert("Export Error", err.message || "Failed to export report.");
        }
    };

    // Format currency safely
    const formatCurrency = (val) => `€${Number(val || 0).toFixed(2)}`;

    // Calculate balance
    const balance = overview 
        ? (overview.totalIncome || 0) - (overview.totalExpense || 0) 
        : 0;

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

                {/* KPI GRID - Same style as TransactionScreen */}
                {overview && (
                    <View style={styles.kpiGrid}>
                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiTitle}>{t("analytics.income")}</Text>
                            <Text style={[styles.kpiValue, styles.success]}>
                                {formatCurrency(overview.totalIncome)}
                            </Text>
                        </View>

                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiTitle}>{t("analytics.expenses")}</Text>
                            <Text style={[styles.kpiValue, styles.danger]}>
                                {formatCurrency(overview.totalExpense)}
                            </Text>
                        </View>

                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiTitle}>{t("analytics.netBalance")}</Text>
                            <Text
                                style={[
                                    styles.kpiValue,
                                    balance >= 0 ? styles.success : styles.danger,
                                ]}
                            >
                                {formatCurrency(balance)}
                            </Text>
                        </View>

                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiTitle}>{t("analytics.transactions")}</Text>
                            <Text style={styles.kpiValue}>
                                {overview.transactionCount || 0}
                            </Text>
                        </View>

                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiTitle}>{t("analytics.pendingInvoices")}</Text>
                            <Text style={[styles.kpiValue, styles.warning]}>
                                {formatCurrency(overview.pendingInvoicesTotal)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* RATIO */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        💹 {t("analytics.incomeExpenseRatio")}
                    </Text>

                    {ratio && (
                        <Text style={styles.meta}>
                            {formatCurrency(ratio.income)} / {formatCurrency(ratio.expense)} →{" "}
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
                            {formatCurrency(avg.averageMonthlyExpense)}
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
                                {formatCurrency(prediction.predictedExpenseNextMonth)}
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
                                        {formatCurrency(tItem.totalSpent)}
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
                                    +{formatCurrency(item.income)}
                                </Text>

                                <Text style={{ color: colors.danger }}>
                                    -{formatCurrency(item.expense)}
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
                                    {formatCurrency(item.income - item.expense)}
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