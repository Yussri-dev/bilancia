// src/screens/main/DashboardScreen.jsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Alert,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { useAuth } from "../../contexts/authContext";
import { transactionApi, recurringPaymentApi, categoryApi } from "../../api";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
    const { token } = useAuth();

    // State
    const [loading, setLoading] = useState(true);
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

    // Charts data
    const [revExpData, setRevExpData] = useState(null);
    const [pieData, setPieData] = useState([]);

    useEffect(() => {
        loadAll();
    }, [currentMonth]);

    const loadAll = async () => {
        setLoading(true);
        try {
            await loadCategories();
            await loadTransactions();
            await loadUpcomingPayments();
            computeKPIs();
            buildRevExpChart();
            buildCategoryPie();
        } catch (error) {
            console.error("Error loading dashboard:", error);
            Alert.alert("Erreur", "Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await categoryApi.getCategories(token);
            setCategories(data || []);
        } catch (error) {
            console.error("Error loading categories:", error);
            setCategories([]);
        }
    };

    const loadTransactions = async () => {
        try {
            const data = await transactionApi.getMyTransactions(token);
            setTransactions(data || []);
        } catch (error) {
            console.error("Error loading transactions:", error);
            setTransactions([]);
        }
    };

    const loadUpcomingPayments = async () => {
        try {
            const all = await recurringPaymentApi.getAllAsync(token);
            const now = new Date();
            const end = new Date();
            end.setDate(end.getDate() + 14);

            const filtered = (all || [])
                .filter(p => {
                    if (!p.isActive) return false;
                    const dueDate = new Date(p.nextDueDate);
                    return dueDate >= now && dueDate <= end;
                })
                .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate))
                .slice(0, 10);

            setUpcomingPayments(filtered);
        } catch (error) {
            console.error("Error loading upcoming payments:", error);
            setUpcomingPayments([]);
        }
    };

    const computeKPIs = () => {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const monthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date >= monthStart && date <= monthEnd;
        });

        const income = monthTransactions
            .filter(t => t.type === "Income")
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthTransactions
            .filter(t => t.type === "Expense")
            .reduce((sum, t) => sum + t.amount, 0);

        const transfer = monthTransactions
            .filter(t => t.type === "Transfer")
            .reduce((sum, t) => sum + t.amount, 0);

        setTotalIncome(income);
        setTotalExpense(expense);
        setTotalTransfer(transfer);

        const net = income - expense;
        setNetBalance(net);
        setSavingsRate(income > 0 ? (net / income) : 0);
    };

    const buildRevExpChart = () => {
        const months = [];
        const revenues = [];
        const expenses = [];
        const transfers = [];

        for (let i = 5; i >= 0; i--) {
            const month = new Date(currentMonth);
            month.setMonth(month.getMonth() - i);

            const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
            const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

            const monthTransactions = transactions.filter(t => {
                const date = new Date(t.date);
                return date >= monthStart && date <= monthEnd;
            });

            months.push(`${String(month.getMonth() + 1).padStart(2, '0')}/${String(month.getFullYear()).slice(-2)}`);

            revenues.push(
                monthTransactions
                    .filter(t => t.type === "Income")
                    .reduce((sum, t) => sum + t.amount, 0)
            );

            expenses.push(
                monthTransactions
                    .filter(t => t.type === "Expense")
                    .reduce((sum, t) => sum + t.amount, 0)
            );

            transfers.push(
                monthTransactions
                    .filter(t => t.type === "Transfer")
                    .reduce((sum, t) => sum + t.amount, 0)
            );
        }

        // Only set data if there's something to show
        if (revenues.some(v => v > 0) || expenses.some(v => v > 0) || transfers.some(v => v > 0)) {
            setRevExpData({
                labels: months,
                datasets: [
                    {
                        data: revenues.length > 0 ? revenues : [0],
                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                        strokeWidth: 2,
                    },
                    {
                        data: expenses.length > 0 ? expenses : [0],
                        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                        strokeWidth: 2,
                    },
                    {
                        data: transfers.length > 0 ? transfers : [0],
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

    const buildCategoryPie = () => {
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const monthTransactions = transactions.filter(t => {
            const date = new Date(t.date);
            return date >= monthStart && date <= monthEnd && t.type === "Expense";
        });

        const categoryTotals = {};
        monthTransactions.forEach(t => {
            const cat = t.categoryName || "Autre";
            categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
        });

        const colors = [
            "#7C3AED", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444",
        ];

        const pieChartData = Object.entries(categoryTotals)
            .map(([name, amount], index) => ({
                name,
                amount,
                color: colors[index % colors.length],
                legendFontColor: "#E5E7EB",
                legendFontSize: 12,
            }))
            .sort((a, b) => b.amount - a.amount);

        setPieData(pieChartData.length > 0 ? pieChartData : []);
    };

    const formatCurrency = (amount) => `€ ${amount.toFixed(2)}`;

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('fr-FR');
    };

    const getMonthLabel = () => {
        return `${String(currentMonth.getMonth() + 1).padStart(2, '0')}/${currentMonth.getFullYear()}`;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>📊 Tableau de bord</Text>
                <Text style={styles.monthLabel}>{getMonthLabel()}</Text>
            </View>

            {/* Offline Warning */}
            {!isOnline && (
                <View style={styles.warningContainer}>
                    <Text style={styles.warningText}>
                        Vous êtes hors-ligne. Les graphiques utilisent les données locales.
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
                    <Text style={styles.kpiSub}>Mois {getMonthLabel()}</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiTitle}>Dépenses</Text>
                    <Text style={[styles.kpiValue, styles.danger]}>
                        {formatCurrency(totalExpense)}
                    </Text>
                    <Text style={styles.kpiSub}>Mois {getMonthLabel()}</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiTitle}>Transferts</Text>
                    <Text style={[styles.kpiValue, styles.warning]}>
                        {formatCurrency(totalTransfer)}
                    </Text>
                    <Text style={styles.kpiSub}>Mois {getMonthLabel()}</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiTitle}>Solde net</Text>
                    <Text style={[styles.kpiValue, netBalance >= 0 ? styles.success : styles.danger]}>
                        {formatCurrency(netBalance)}
                    </Text>
                    <Text style={styles.kpiSub}>
                        {netBalance >= 0 ? "En bonne voie" : "⚠️ À surveiller"}
                    </Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiTitle}>Taux d'épargne</Text>
                    <Text style={styles.kpiValue}>
                        {(savingsRate * 100).toFixed(0)}%
                    </Text>
                    <Text style={styles.kpiSub}>Revenus − Dépenses</Text>
                </View>
            </View>

            {/* Revenue/Expense Chart */}
            {revExpData ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Revenus / Dépenses / Transferts (6 derniers mois)
                    </Text>
                    <LineChart
                        data={revExpData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={{
                            backgroundColor: "#1E293B",
                            backgroundGradientFrom: "#1E293B",
                            backgroundGradientTo: "#1E293B",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
                            style: { borderRadius: 16 },
                            propsForDots: { r: "4", strokeWidth: "2" },
                        }}
                        bezier
                        style={styles.chart}
                    />
                </View>
            ) : (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Revenus / Dépenses / Transferts (6 derniers mois)
                    </Text>
                    <Text style={styles.emptyText}>Aucune donnée à afficher.</Text>
                </View>
            )}

            {/* Category Pie Chart */}
            {pieData.length > 0 ? (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Dépenses par catégorie ({getMonthLabel()})
                    </Text>
                    <PieChart
                        data={pieData}
                        width={screenWidth - 48}
                        height={220}
                        chartConfig={{
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        }}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft={15}
                        absolute
                    />
                </View>
            ) : (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Dépenses par catégorie ({getMonthLabel()})
                    </Text>
                    <Text style={styles.emptyText}>Aucune dépense ce mois.</Text>
                </View>
            )}

            {/* Upcoming Payments */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>À venir (14 jours)</Text>
                {upcomingPayments.length === 0 ? (
                    <Text style={styles.emptyText}>Aucune échéance à venir 🎉</Text>
                ) : (
                    <View style={styles.upcomingList}>
                        {upcomingPayments.map((payment) => (
                            <View key={payment.id} style={styles.upcomingItem}>
                                <View style={styles.upcomingLeft}>
                                    <Text style={styles.upcomingName}>{payment.name}</Text>
                                    <Text style={styles.upcomingMeta}>
                                        {payment.categoryName} · {formatDate(payment.nextDueDate)}
                                    </Text>
                                </View>
                                <Text style={styles.upcomingAmount}>
                                    {formatCurrency(payment.amount)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1221",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0B1221",
    },
    loadingText: {
        color: "#94A3B8",
        marginTop: 12,
        fontSize: 14,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#E5E7EB",
        marginBottom: 8,
    },
    monthLabel: {
        fontSize: 16,
        color: "#94A3B8",
    },
    warningContainer: {
        backgroundColor: "#854D0E",
        padding: 12,
        marginHorizontal: 24,
        marginBottom: 16,
        borderRadius: 8,
    },
    warningText: {
        color: "#FEF3C7",
        fontSize: 14,
    },
    warningColor: {
        color: "#F59E0B",
    },

    kpiGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 16,
        gap: 12,
    },
    kpiCard: {
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 12,
        flex: 1,
        minWidth: "45%",
    },
    card: {
        backgroundColor: "#1E293B",
        margin: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 12,
    },
    kpiTitle: {
        fontSize: 12,
        color: "#94A3B8",
        marginBottom: 8,
        textTransform: "uppercase",
    },
    kpiValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#E5E7EB",
        marginBottom: 4,
    },
    kpiSub: {
        fontSize: 12,
        color: "#64748B",
    },
    success: {
        color: "#22C55E",
    },
    danger: {
        color: "#EF4444",
    },
    warning: {
        color: "#F59E0B",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#E5E7EB",
        marginBottom: 16,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    emptyText: {
        color: "#94A3B8",
        textAlign: "center",
        padding: 16,
    },
    upcomingList: {
        gap: 12,
    },
    upcomingItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#334155",
    },
    upcomingLeft: {
        flex: 1,
    },
    upcomingName: {
        fontSize: 16,
        color: "#E5E7EB",
        fontWeight: "500",
        marginBottom: 4,
    },
    upcomingMeta: {
        fontSize: 12,
        color: "#64748B",
    },
    upcomingAmount: {
        fontSize: 16,
        fontWeight: "600",
        color: "#7C3AED",
    },
});