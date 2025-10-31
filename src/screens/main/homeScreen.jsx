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
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useAuth } from "../../contexts/authContext";
import apiClient from "../../api/apiClient";
import { useThemeColors } from "../../theme/color";
import { getStyles } from "../../theme/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen({ navigation }) {
    const { token } = useAuth();
    const colors = useThemeColors();
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

    // Charts
    const [revExpData, setRevExpData] = useState(null);
    const [pieData, setPieData] = useState([]);

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

    //  Refresh when screen focused or month changes
    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            loadAll();
        });
        return unsubscribe;
    }, [navigation, loadAll, currentMonth]);

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

    const formatCurrency = (amount) => `€ ${amount.toFixed(2)}`;
    const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");
    const getMonthLabel = () =>
        `${String(currentMonth.getMonth() + 1).padStart(
            2,
            "0"
        )}/${currentMonth.getFullYear()}`;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                    Chargement du tableau de bord...
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
                {/* 🧾 Header with Drawer Button */}
                <View
                    style={[
                        styles.header,
                        {
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        },
                    ]}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity
                            onPress={() => navigation.openDrawer()}
                            style={{ marginRight: 12 }}
                        >
                            <Ionicons name="menu" size={28} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>📊 Tableau de bord</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={styles.monthLabel}>{getMonthLabel()}</Text>
                        <TouchableOpacity
                            onPress={loadAll}
                            style={{ marginLeft: 8 }}
                        >
                            <Ionicons
                                name="refresh"
                                size={22}
                                color={colors.textSoft}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {!isOnline && (
                    <View style={styles.warningContainer}>
                        <Text style={styles.warningText}>
                            Vous êtes hors ligne. Les graphiques utilisent les
                            données locales.
                        </Text>
                    </View>
                )}

                {/* KPIs */}
                <View style={styles.kpiGrid}>
                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Revenus</Text>
                        <Text style={[styles.kpiValue, styles.success]}>
                            {formatCurrency(totalIncome)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Dépenses</Text>
                        <Text style={[styles.kpiValue, styles.danger]}>
                            {formatCurrency(totalExpense)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Transferts</Text>
                        <Text style={[styles.kpiValue, styles.warning]}>
                            {formatCurrency(totalTransfer)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Solde net</Text>
                        <Text
                            style={[
                                styles.kpiValue,
                                netBalance >= 0
                                    ? styles.success
                                    : styles.danger,
                            ]}
                        >
                            {formatCurrency(netBalance)}
                        </Text>
                    </View>

                    <View style={styles.kpiCard}>
                        <Text style={styles.kpiTitle}>Taux d'épargne</Text>
                        <Text style={styles.kpiValue}>
                            {(savingsRate * 100).toFixed(0)}%
                        </Text>
                    </View>
                </View>

                {/* Revenus / Dépenses Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Revenus / Dépenses / Transferts
                    </Text>
                    {revExpData ? (
                        <LineChart
                            data={revExpData}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={{
                                backgroundColor: "#1E293B",
                                backgroundGradientFrom: "#1E293B",
                                backgroundGradientTo: "#1E293B",
                                decimalPlaces: 0,
                                color: (opacity = 1) =>
                                    `rgba(124, 58, 237, ${opacity})`,
                                labelColor: (opacity = 1) =>
                                    `rgba(229, 231, 235, ${opacity})`,
                            }}
                            bezier
                            style={styles.chart}
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            Aucune donnée disponible.
                        </Text>
                    )}
                </View>

                {/* Dépenses par catégorie */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Dépenses par catégorie ({getMonthLabel()})
                    </Text>
                    {pieData.length > 0 ? (
                        <PieChart
                            data={pieData}
                            width={screenWidth - 48}
                            height={220}
                            chartConfig={{
                                color: (opacity = 1) =>
                                    `rgba(255,255,255,${opacity})`,
                            }}
                            accessor="amount"
                            backgroundColor="transparent"
                            absolute
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            Aucune dépense ce mois.
                        </Text>
                    )}
                </View>

                {/* À venir */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>À venir (14 jours)</Text>
                    {upcomingPayments.length === 0 ? (
                        <Text style={styles.emptyText}>
                            Aucune échéance à venir 🎉
                        </Text>
                    ) : (
                        upcomingPayments.map((p) => (
                            <View key={p.id} style={styles.upcomingItem}>
                                <View style={styles.upcomingLeft}>
                                    <Text style={styles.upcomingName}>
                                        {p.name}
                                    </Text>
                                    <Text style={styles.upcomingMeta}>
                                        {p.categoryName} ·{" "}
                                        {formatDate(p.nextDueDate)}
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
