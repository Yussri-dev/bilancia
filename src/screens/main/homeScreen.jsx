import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Alert,
    RefreshControl,
    TouchableOpacity,
    DeviceEventEmitter
} from "react-native";
import { useTranslation } from "react-i18next";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useAuth } from "@contexts/authContext";
import apiClient from "@apiClient";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const { t, i18n } = useTranslation();
    const styles = getStyles(colors);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isOnline, setIsOnline] = useState(true);

    // Data
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [upcomingPayments, setUpcomingPayments] = useState([]);

    // KPIs
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalTransfer, setTotalTransfer] = useState(0);
    const [netBalance, setNetBalance] = useState(0);
    const [savingsRate, setSavingsRate] = useState(0);
    const [lifetimeNet, setLifetimeNet] = useState(0);

    // Charts
    const [revExpData, setRevExpData] = useState(null);
    const [pieData, setPieData] = useState([]);

    // Date Picker 
    const [showDatePicker, setShowDatePicker] = useState(false);

    //  Load all dashboard data
    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            apiClient.setAuthToken(token);

            const [catRes, txRes, payRes] = await Promise.all([
                apiClient.get("/category"),
                apiClient.get("/transaction"),
                apiClient.get("/recurringpayment"),
            ]);

            setCategories(catRes.data || []);
            setTransactions(txRes.data || []);
            setUpcomingPayments(processUpcomingPayments(payRes.data || []));
        } catch (error) {
            console.error("Error loading dashboard:", error);
            Alert.alert("Erreur", "Impossible de charger les données.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadAll);
        return unsubscribe;
    }, [navigation, loadAll, currentMonth]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener("transactions:updated", loadAll);
        return () => sub.remove();
    }, [loadAll]);


    //  Process payments due in next 14 days
    const processUpcomingPayments = (all) => {
        const now = new Date();
        const end = new Date();
        end.setDate(end.getDate() + 14);

        return all
            .filter((p) => p.isActive)
            .filter((p) => {
                const dueDate = new Date(p.nextDueDate);
                return dueDate >= now && dueDate <= end;
            })
            .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
            .slice(0, 10);
    };

    //  Compute KPIs
    useEffect(() => {
        if (transactions.length === 0) return;

        const monthStart = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1
        );
        const monthEnd = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0
        );

        const monthTransactions = transactions.filter((t) => {
            const date = new Date(t.date);
            return date >= monthStart && date <= monthEnd;
        });

        const income = monthTransactions
            .filter((t) => t.type?.toLowerCase() === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthTransactions
            .filter((t) => t.type?.toLowerCase() === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const transfer = monthTransactions
            .filter((t) => t.type?.toLowerCase() === "transfer")
            .reduce((sum, t) => sum + t.amount, 0);

        setTotalIncome(income);
        setTotalExpense(expense);
        setTotalTransfer(transfer);

        const net = income - expense;
        setNetBalance(net);

        const allIncome = transactions
            .filter(t => t.type?.toLowerCase() === "income")
            .reduce((sum, t) => sum + t.amount, 0);

        const allExpense = transactions
            .filter(t => t.type?.toLowerCase() === "expense")
            .reduce((sum, t) => sum + t.amount, 0);

        setLifetimeNet(allIncome - allExpense);


        setSavingsRate(income > 0 ? net / income : 0);

        buildRevExpChart(transactions);
        buildCategoryPie(transactions);
    }, [transactions, currentMonth]);

    //  Chart - Revenus / Dépenses / Transferts
    const buildRevExpChart = (transactions) => {
        const months = [];
        const revenues = [];
        const expenses = [];
        const transfers = [];

        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentMonth);
            month.setMonth(month.getMonth() - i);

            const start = new Date(month.getFullYear(), month.getMonth(), 1);
            const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);

            const monthTx = transactions.filter((t) => {
                const d = new Date(t.date);
                return d >= start && d <= end;
            });

            months.push(
                `${String(month.getMonth() + 1).padStart(2, "0")}/${String(
                    month.getFullYear()
                ).slice(-2)}`
            );

            revenues.push(
                monthTx
                    .filter((t) => t.type?.toLowerCase() === "income")
                    .reduce((s, t) => s + t.amount, 0)
            );
            expenses.push(
                monthTx
                    .filter((t) => t.type?.toLowerCase() === "expense")
                    .reduce((s, t) => s + t.amount, 0)
            );
            transfers.push(
                monthTx
                    .filter((t) => t.type?.toLowerCase() === "transfer")
                    .reduce((s, t) => s + t.amount, 0)
            );
        }

        if (
            revenues.some((v) => v > 0) ||
            expenses.some((v) => v > 0) ||
            transfers.some((v) => v > 0)
        ) {
            setRevExpData({
                labels: months,
                datasets: [
                    {
                        data: revenues,
                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                        strokeWidth: 2,
                    },
                    {
                        data: expenses,
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                        strokeWidth: 2,
                    },
                    {
                        data: transfers,
                        color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`,
                        strokeWidth: 2,
                    },
                ],
                legend: ["Revenus", "Dépenses", "Transferts"],
            });
        } else {
            setRevExpData(null);
        }
    };

    //  Chart - Dépenses par catégorie
    const buildCategoryPie = (transactions) => {
        const monthStart = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            1
        );
        const monthEnd = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0
        );

        const monthTransactions = transactions.filter((t) => {
            const date = new Date(t.date);
            return (
                date >= monthStart &&
                date <= monthEnd &&
                t.type?.toLowerCase() === "expense"
            );
        });

        const totals = {};
        monthTransactions.forEach((t) => {
            const cat = t.categoryName || "Autre";
            totals[cat] = (totals[cat] || 0) + t.amount;
        });

        const colors = [
            "#7C3AED",
            "#EC4899",
            "#F59E0B",
            "#10B981",
            "#3B82F6",
            "#EF4444",
        ];

        const data = Object.entries(totals)
            .map(([name, amount], index) => ({
                name,
                amount,
                color: colors[index % colors.length],
                legendFontColor: "#E5E7EB",
                legendFontSize: 12,
            }))
            .sort((a, b) => b.amount - a.amount);

        setPieData(data.length > 0 ? data : []);
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // On change le mois entier selon la date choisie
            const newMonth = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                1
            );
            setCurrentMonth(newMonth);
            loadAll();
        }
    };

    const formatCurrency = (amount) => `€ ${amount.toFixed(2)}`;
    const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");
    const getMonthLabel = () =>
        `${String(currentMonth.getMonth() + 1).padStart(
            2,
            "0"
        )}/${currentMonth.getFullYear()}`;


    const chartConfig = {
        backgroundColor: colors.chartBg,
        backgroundGradientFrom: colors.chartBg,
        backgroundGradientTo: colors.chartBg,
        decimalPlaces: 0,
        color: (opacity = 1) => colors.chartLine + (opacity === 1 ? "" : `${Math.round(opacity * 255).toString(16)}`),
        labelColor: (opacity = 1) => colors.chartLabel,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: colors.primary,
        },
    };
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                    {t('dashboard.loading')}
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            loadAll();
                        }}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* HEADER */}
                <View style={[styles.header, { marginBottom: 16 }]}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()}>
                        <Ionicons name="menu" size={26} color={colors.text} />
                    </TouchableOpacity>

                    <View style={{ flex: 1, alignItems: "center" }}>
                        <Text style={styles.title}>📊 {t("dashboard.title")}</Text>
                        <Text style={styles.subtitle}>
                            {t("dashboard.subtitle")}
                        </Text>
                    </View>

                    <View style={{ width: 26 }} />
                </View>

                {/* DATE SELECTOR */}
                {showDatePicker && (
                    <DateTimePicker
                        value={currentMonth}
                        mode="date"
                        display="calendar"
                        onChange={onChangeDate}
                    />
                )}

                {!isOnline && (
                    <View style={styles.warningContainer}>
                        <Text style={styles.warningText}>
                            {t("dashboard.offlineWarning")}
                        </Text>
                    </View>
                )}

                {/* KPI GRID */}
                <View style={styles.kpiGrid}>
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        activeOpacity={0.85}
                        style={styles.dateCard}
                    >
                        <Ionicons
                            name="calendar"
                            size={22}
                            color="#fff"
                            style={styles.dateIcon}
                        />
                        <Text style={styles.dateText}>{getMonthLabel()}</Text>
                    </TouchableOpacity>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Lifetime Balance</Text>
                        <Text
                            style={[
                                styles.kpiValue,
                                lifetimeNet >= 0 ? styles.primary : styles.danger,
                            ]}
                        >
                            {formatCurrency(lifetimeNet)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>{t("dashboard.income")} (This Month)</Text>
                        <Text style={[styles.kpiValue, styles.success]}>
                            {formatCurrency(totalIncome)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>{t("dashboard.expense")} (This Month)</Text>
                        <Text style={[styles.kpiValue, styles.danger]}>
                            {formatCurrency(totalExpense)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>{t("dashboard.transfer")} (This Month)</Text>
                        <Text style={[styles.kpiValue, styles.warning]}>
                            {formatCurrency(totalTransfer)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>{t("dashboard.netBalance")} (This Month)</Text>
                        <Text
                            style={[
                                styles.kpiValue,
                                netBalance >= 0 ? styles.success : styles.danger,
                            ]}
                        >
                            {formatCurrency(netBalance)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>{t("dashboard.savingsRate")}</Text>
                        <Text style={styles.kpiValue}>
                            {(savingsRate * 100).toFixed(0)}%
                        </Text>
                    </View>
                </View>

                {/* REVENUE VS EXPENSE CHART */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {t("dashboard.income")} / {t("dashboard.expense")} /{" "}
                        {t("dashboard.transfer")}
                    </Text>

                    {revExpData ? (
                        <LineChart
                            data={revExpData}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    ) : (
                        <Text style={styles.emptyText}>{t("dashboard.noData")}</Text>
                    )}
                </View>

                {/* PIE CHART */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        {t("dashboard.expenseByCategory")} ({getMonthLabel()})
                    </Text>

                    {pieData.length > 0 ? (
                        <PieChart
                            data={pieData}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={{
                                backgroundColor: colors.chartBg,
                                color: () => colors.text,
                                labelColor: () => colors.chartLabel,
                            }}
                            accessor="amount"
                            backgroundColor="transparent"
                            absolute
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            {t("dashboard.noExpenseThisMonth")}
                        </Text>
                    )}
                </View>

                {/* UPCOMING PAYMENTS */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t("dashboard.upcoming")}</Text>

                    {upcomingPayments.length === 0 ? (
                        <Text style={styles.emptyText}>
                            {t("dashboard.noUpcoming")} 🎉
                        </Text>
                    ) : (
                        upcomingPayments.map((p) => (
                            <View key={p.id} style={styles.upcomingItem}>
                                <View style={styles.upcomingLeft}>
                                    <Text style={styles.upcomingName}>{p.name}</Text>
                                    <Text style={styles.upcomingMeta}>
                                        {p.categoryName} · {formatDate(p.nextDueDate)}
                                    </Text>
                                </View>
                                <Text style={styles.upcomingAmount}>
                                    {formatCurrency(p.amount)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );

}
