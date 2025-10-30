// src/theme/styles.js
import { StyleSheet } from "react-native";

export const getStyles = (colors) =>
    StyleSheet.create({
        // === GLOBAL ===
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

        // === FILTERS ===
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

        // === STATS & CARDS ===
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
            marginBottom: 10,
        },
        cardHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 8,
        },
        cardTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
        },
        meta: {
            fontSize: 13,
            color: colors.textSoft,
            marginTop: 4,
        },

        // === BUTTONS ===
        statusBadge: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
        },
        statusText: {
            fontSize: 12,
            fontWeight: "600",
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

        // === EMPTY / PAGINATION ===
        empty: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 60,
        },
        emptyText: {
            color: colors.textSoft,
            fontSize: 16,
            textAlign: "center",
            padding: 16,
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

        // === DASHBOARD-SPECIFIC ===
        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
        },
        headerTitle: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 8,
        },
        monthLabel: {
            fontSize: 16,
            color: colors.textSoft,
        },
        warningContainer: {
            backgroundColor: colors.warning,
            padding: 12,
            marginHorizontal: 24,
            marginBottom: 16,
            borderRadius: 8,
        },
        warningText: {
            color: "#FEF3C7",
            fontSize: 14,
        },
        kpiGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            padding: 16,
            gap: 12,
        },
        kpiCard: {
            backgroundColor: colors.surface,
            padding: 16,
            borderRadius: 12,
            flex: 1,
            minWidth: "45%",
        },
        kpiTitle: {
            fontSize: 12,
            color: colors.textSoft,
            marginBottom: 8,
            textTransform: "uppercase",
        },
        kpiValue: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 4,
        },
        kpiSub: {
            fontSize: 12,
            color: colors.textSoft,
        },
        success: {
            color: colors.success,
        },
        danger: {
            color: colors.danger,
        },
        warning: {
            color: colors.warning,
        },
        chart: {
            marginVertical: 8,
            borderRadius: 16,
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
            borderBottomColor: colors.border,
        },
        upcomingLeft: {
            flex: 1,
        },
        upcomingName: {
            fontSize: 16,
            color: colors.text,
            fontWeight: "500",
            marginBottom: 4,
        },
        upcomingMeta: {
            fontSize: 12,
            color: colors.textSoft,
        },
        upcomingAmount: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.primary,
        },
        toggleRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
            gap: 8,
        },
        toggleText: {
            color: colors.textSoft,
        },
        statsGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 12,
        },
        statCard: {
            flexBasis: "47%",
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
        },
        statIcon: {
            width: 42,
            height: 42,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
        },
        statValue: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
        },
        statLabel: {
            color: colors.textSoft,
            fontSize: 12,
        },

    });
