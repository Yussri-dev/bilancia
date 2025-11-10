// src/screens/advice/AdviceScreen.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@contexts/authContext";
import { useTheme } from "@contexts/ThemeContext";
import { getStyles } from "@theme/styles";
import adviceApi from "@api/AdviceApi";

export default function AdviceScreen({ navigation }) {
    const { token } = useAuth();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [months, setMonths] = useState(3);
    const [targetPct, setTargetPct] = useState(20);
    const [advice, setAdvice] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logsBusy, setLogsBusy] = useState(false);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [a, l] = await Promise.all([
                adviceApi.getSavingsAdvice(token, months, targetPct / 100),
                adviceApi.getLogs(token),
            ]);
            setAdvice(a);
            setLogs(l);
        } catch (e) {
            console.error(e);
            Alert.alert("Erreur", "Impossible de charger les conseils.");
        } finally {
            setLoading(false);
        }
    }, [token, months, targetPct]);

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", loadAll);
        return unsubscribe;
    }, [navigation, loadAll]);

    const saveSnapshot = async () => {
        if (!advice) return;
        setSaving(true);
        try {
            // Crée une version texte propre du résumé
            const summary =
                `Résumé sur ${months} mois (objectif ${targetPct}%)\n` +
                `Revenus: €${advice.currentMonthlyIncome?.toFixed(2)}\n` +
                `Dépenses: €${advice.currentMonthlyExpenses?.toFixed(2)}\n` +
                `Épargne actuelle: €${advice.currentSavingsPerMonth?.toFixed(2)}\n` +
                `Objectif: €${advice.targetSavingsPerMonth?.toFixed(2)}\n` +
                `Écart: €${advice.gapToTarget?.toFixed(2)}\n\n` +
                (advice.items?.length
                    ? advice.items
                        .map(
                            (it) =>
                                `• ${it.title} (${it.severity}) – Impact: €${it.estimatedMonthlyImpact.toFixed(2)}`
                        )
                        .join("\n")
                    : "Aucun conseil spécifique.");

            const dto = {
                question: `Conseil ${months}m (${targetPct}%)`,
                answer: summary,
            };

            await adviceApi.createLog(token, dto);
            await loadAll();
        } catch (err) {
            Alert.alert("Erreur", err.message);
        } finally {
            setSaving(false);
        }
    };


    const deleteLog = async (id) => {
        setLogsBusy(true);
        try {
            await adviceApi.deleteLog(token, id);
            await loadAll();
        } catch {
            Alert.alert("Erreur", "Impossible de supprimer.");
        } finally {
            setLogsBusy(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { marginHorizontal: 4, marginBottom: 12 }]}>
            <Text style={styles.cardTitle}>{item.question}</Text>

            {/* Texte coloré par sévérité */}
            <View style={{ marginTop: 6 }}>
                {item.answer
                    ?.split("\n")
                    .filter((l) => l.trim().length > 0)
                    .map((line, i) => {
                        let color = colors.text;
                        const lower = line.toLowerCase();

                        if (lower.includes("(info)")) color = colors.success;
                        else if (lower.includes("(warn)")) color = colors.warning;
                        else if (lower.includes("(critical)") || lower.includes("(danger)"))
                            color = colors.danger;

                        return (
                            <Text
                                key={i}
                                style={[
                                    styles.detailText,
                                    {
                                        marginBottom: 4,
                                        color,
                                    },
                                ]}
                            >
                                {line}
                            </Text>
                        );
                    })}
            </View>

            {/* Bouton Supprimer */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 10,
                }}
            >
                <TouchableOpacity
                    style={[styles.btnAction, styles.btnDanger]}
                    onPress={() => deleteLog(item.id)}
                    disabled={logsBusy}
                >
                    <Ionicons name="trash" size={16} color="#fff" />
                    <Text style={styles.btnActionText}>Supprimer</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Analyse en cours...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={logs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={
                    <>
                        {/* === HEADER === */}
                        <View
                            style={[
                                styles.header,
                                {
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 12,
                                },
                            ]}
                        >
                            <TouchableOpacity onPress={() => navigation.openDrawer()}>
                                <Ionicons name="menu" size={26} color={colors.text} />
                            </TouchableOpacity>

                            <View style={{ flex: 1, alignItems: "center" }}>
                                <Text style={[styles.headerTitle, { fontSize: 20 }]}>
                                    💡 Conseils financiers
                                </Text>
                                <Text style={styles.subtitle}>
                                    Analyse vos dépenses et propose des optimisations
                                </Text>
                            </View>

                            <View style={{ width: 26 }} />
                        </View>

                        {/* === KPI GRID === */}
                        {advice && (
                            <View style={styles.kpiGrid}>
                                <View style={styles.kpiCard}>
                                    <Text style={styles.kpiTitle}>Revenus</Text>
                                    <Text style={[styles.kpiValue, styles.success]}>
                                        €{advice.currentMonthlyIncome?.toFixed(2) || "0.00"}
                                    </Text>
                                </View>
                                <View style={styles.kpiCard}>
                                    <Text style={styles.kpiTitle}>Dépenses</Text>
                                    <Text style={[styles.kpiValue, styles.danger]}>
                                        €{advice.currentMonthlyExpenses?.toFixed(2) || "0.00"}
                                    </Text>
                                </View>
                                <View style={styles.kpiCard}>
                                    <Text style={styles.kpiTitle}>Épargne actuelle</Text>
                                    <Text style={styles.kpiValue}>
                                        €{advice.currentSavingsPerMonth?.toFixed(2) || "0.00"}
                                    </Text>
                                </View>
                                <View style={styles.kpiCard}>
                                    <Text style={styles.kpiTitle}>Objectif</Text>
                                    <Text style={styles.kpiValue}>
                                        €{advice.targetSavingsPerMonth?.toFixed(2) || "0.00"}
                                    </Text>
                                </View>
                                <View style={styles.kpiCard}>
                                    <Text style={styles.kpiTitle}>Écart</Text>
                                    <Text
                                        style={[
                                            styles.kpiValue,
                                            advice.gapToTarget > 0
                                                ? styles.danger
                                                : styles.success,
                                        ]}
                                    >
                                        €{advice.gapToTarget?.toFixed(2) || "0.00"}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* === PARAMÈTRES === */}
                        <View style={styles.card}>
                            <Text style={styles.kpiTitle}>Paramètres d’analyse</Text>
                            <View style={styles.formRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Sur (mois)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={months.toString()}
                                        onChangeText={(t) =>
                                            setMonths(parseInt(t) || 1)
                                        }
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Objectif (%)</Text>
                                    <TextInput
                                        style={styles.input}
                                        keyboardType="numeric"
                                        value={targetPct.toString()}
                                        onChangeText={(t) =>
                                            setTargetPct(parseFloat(t) || 0)
                                        }
                                    />
                                </View>
                            </View>

                            <View style={styles.formRow}>
                                <TouchableOpacity
                                    style={[styles.btnPrimary, { flex: 1 }]}
                                    onPress={loadAll}
                                >
                                    <Text style={styles.btnPrimaryText}>Analyser</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.btnSecondary, { flex: 1 }]}
                                    onPress={saveSnapshot}
                                    disabled={saving}
                                >
                                    <Text style={styles.btnSecondaryText}>
                                        {saving ? "..." : "💾 Enregistrer"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* === CONSEILS === */}
                        {advice?.items?.length ? (
                            advice.items.map((it, i) => (
                                <View
                                    key={i}
                                    style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}
                                >
                                    <Text style={styles.clientName}>
                                        {it.title}
                                    </Text>
                                    <Text style={styles.detailText}>{it.detail}</Text>
                                    <Text style={styles.meta}>
                                        Impact estimé : €{it.estimatedMonthlyImpact?.toFixed(2)}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.empty}>
                                <Text style={styles.emptyIcon}>✨</Text>
                                <Text style={styles.emptyText}>
                                    Aucun conseil spécifique pour le moment
                                </Text>
                            </View>
                        )}

                        {/* === HISTORIQUE === */}
                        <Text style={[styles.headerTitle, { fontSize: 18, marginTop: 24 }]}>
                            📜 Historique
                        </Text>
                    </>
                }
                ListFooterComponent={<View style={{ height: 80 }} />}
            />
        </SafeAreaView>
    );
}
