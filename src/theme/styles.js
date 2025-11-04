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
            borderColor: colors.border,
            borderWidth: 1,
            color: colors.text,
            padding: 14,
            borderRadius: 12,
            marginBottom: 16,
            fontSize: 16,
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
        // === DASHBOARD DATE SELECTOR ===
        dateCard: {
            flex: 1,
            minWidth: "45%",
            borderRadius: 14,
            backgroundColor: colors.primary,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 14,
            paddingHorizontal: 16,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 3 },
            shadowRadius: 4,
            elevation: 5,
        },
        dateText: {
            color: "#fff",
            fontSize: 18,
            fontWeight: "700",
            letterSpacing: 0.4,
        },
        dateIcon: {
            marginRight: 8,
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
        chip: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 6,
        },
        chipSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        chipText: {
            color: colors.text,
            fontSize: 14,
        },
        chipTextSelected: {
            color: "#fff",
            fontWeight: "600",
        },
        categoryChip: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 6,
            marginRight: 8,
            marginTop: 6,
        },
        categoryChipSelected: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        categoryText: {
            color: colors.text,
        },
        categoryTextSelected: {
            color: "#fff",
            fontWeight: "600",
        },
        btnSuccess: {
            backgroundColor: colors.success,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
        },

        modalCardCentered: {
            width: "100%",
            maxWidth: 420,
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 8,
        },

        modalHeader: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingBottom: 10,
            marginBottom: 16,
        },

        modalTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
        },

        formGroup: {
            marginBottom: 16,
        },
        label: {
            fontSize: 14,
            color: colors.text,
            fontWeight: "600",
            marginBottom: 6,
        },
        inputRounded: {
            backgroundColor: colors.input,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 12,
            fontSize: 15,
            color: colors.text,
        },

        toggleRow: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
        },
        toggleButtonRounded: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 14,
        },
        toggleButtonActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        toggleButtonText: {
            color: colors.text,
            fontWeight: "500",
        },
        toggleButtonTextActive: {
            color: "#fff",
            fontWeight: "600",
        },

        modalFooterButtons: {
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 14,
        },

        btnPrimaryRounded: {
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 24,
        },
        btnPrimaryText: {
            color: "#fff",
            fontWeight: "600",
            fontSize: 16,
        },
        btnCancelRounded: {
            backgroundColor: colors.input,
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 24,
        },
        btnCancelText: {
            color: colors.text,
            fontWeight: "600",
            fontSize: 16,
        },
        // === INVOICE-SPECIFIC STYLES ===
        clientName: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 2,
        },
        cardDetails: {
            backgroundColor: colors.surface2,
            padding: 10,
            borderRadius: 8,
            marginBottom: 10,
        },
        detailText: {
            fontSize: 13,
            color: colors.textSoft,
            marginBottom: 4,
        },
        cardActions: {
            flexDirection: "row",
            gap: 8,
            flexWrap: "wrap",
        },
        cardName: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 10,
        },
        cardButtons: {
            flexDirection: "row",
            gap: 8,
        },
        btn: {
            width: 36,
            height: 36,
            borderRadius: 8,
            justifyContent: "center",
            alignItems: "center",
        },
        formRow: {
            flexDirection: "row",
            gap: 10,
        },
        emptyIcon: {
            fontSize: 48,
            marginBottom: 12,
        },
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "center",
            alignItems: "center",
            padding: 12,
        },
        modalContainer: {
            backgroundColor: colors.background,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            width: "100%",
            maxHeight: "90%",
            overflow: "hidden",
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: { fontSize: 18, fontWeight: "700", color: colors.text },
        closeBtn: { padding: 6 },
        body: { padding: 16 },
        formGroup: { marginBottom: 14 },
        formGroupRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            gap: 10,
        },
        label: { color: colors.textSoft, fontWeight: "600", marginBottom: 6 },
        typeSelector: {
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
        },
        typeOption: {
            flex: 1,
            backgroundColor: colors.surface2,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: "center",
        },
        typeSelected: {
            borderColor: colors.primary,
            backgroundColor: "#1e1b4b",
        },
        typeText: { fontWeight: "600" },
        footer: {
            flexDirection: "row",
            justifyContent: "flex-end",
            borderTopWidth: 1,
            borderTopColor: colors.border,
            padding: 14,
            gap: 10,
        },
        btnPrimary: {
            backgroundColor: colors.primary,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        btnPrimaryText: { color: "#fff", fontWeight: "700" },
        btnSecondary: {
            backgroundColor: "transparent",
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 20,
        },
        btnSecondaryText: { color: colors.textSoft },
        fab: {
            position: "absolute",
            bottom: 24,
            right: 24,
            backgroundColor: colors.primary,
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: "center",
            alignItems: "center",
            elevation: 6,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
        },

        gradient: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        container: {
            width: "100%",
            paddingHorizontal: 24,
        },
        cardLogin: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 10,
        },
        title: {
            fontSize: 32,
            fontWeight: "bold",
            color: "#A78BFA",
            textAlign: "center",
            marginBottom: 6,
        },
        subtitle: {
            fontSize: 14,
            color: "#94A3B8",
            textAlign: "center",
            marginBottom: 28,
        },
        eyeButton: {
            position: "absolute",
            right: 10,
            top: 14,
        },
        button: {
            borderRadius: 12,
            overflow: "hidden",
        },
        buttonGradient: {
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
        },
        buttonText: {
            color: "#fff",
            textAlign: "center",
            fontWeight: "600",
            fontSize: 16,
        },
        linkRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 16,
        },
        linkHighlight: {
            color: "#A78BFA",
            fontWeight: "600",
        },
        linkSecondary: {
            color: "#CBD5E1",
        },
    });
