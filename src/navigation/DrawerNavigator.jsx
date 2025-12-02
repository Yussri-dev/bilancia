// src/navigation/DrawerNavigator.jsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import CustomDrawerContent from "@components/CustomDrawerContent";
import { useTheme } from "@contexts/ThemeContext";

import Tabs from "./MainTabs";

import {
    AnalyticsScreen,
    AdviceScreen,
    GoalsScreen,
    InvoiceScreen,
    TransactionScreen,
    recurringPaymentScreen,
    ProfileScreen,
} from "@screens";

import CategoryStack from "@navigation/CategoryStack";
import InvoiceStack from "@navigation/InvoiceStack";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    const { t } = useTranslation();
    const { mode, toggleTheme, colors } = useTheme();

    return (
        <Drawer.Navigator
            initialRouteName="DashboardTab"
            drawerContent={(props) => (
                <View style={{ flex: 1 }}>
                    <CustomDrawerContent {...props} />

                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={{
                            padding: 16,
                            alignItems: "center",
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                        }}
                    >
                        <Text style={{ color: colors.text, fontSize: 16 }}>
                            {mode === "light"
                                ? `🌙  ${t("theme.dark")}`
                                : `☀️  ${t("theme.light")}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: colors.textSecondary,
                drawerStyle: {
                    backgroundColor: colors.background,
                    width: 260,
                },
                drawerLabelStyle: { fontSize: 16 },
            }}
        >

            <Drawer.Screen
                name="DashboardTab"
                component={Tabs}
                initialParams={{ screen: "Home" }}
                options={{
                    title: t("dashboard.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home" color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="TransactionTab"
                component={Tabs}
                initialParams={{ screen: "Transaction" }}
                options={{
                    title: t("transactions.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="card" color={color} size={size} />
                    ),
                }}
            />

            {/* <Drawer.Screen
                name="InvoiceTab"
                component={Tabs}
                initialParams={{ screen: "Invoice" }}
                options={{
                    title: t("invoices.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="newspaper" color={color} size={size} />
                    ),
                }}
            /> */}


            <Drawer.Screen
                name="Invoice"
                component={InvoiceStack}
                options={{
                    title: t("invoices.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="apps" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: t("profile.accountDetails"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-circle" color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Advices"
                component={AdviceScreen}
                options={{
                    title: t("advice.headerTitle"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="bulb" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                    title: t("analytics.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Category"
                component={CategoryStack}
                options={{
                    title: t("categories.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="apps" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Goal"
                component={GoalsScreen}
                options={{
                    title: t("goals.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="football" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Recurring"
                component={recurringPaymentScreen}
                options={{
                    title: t("recurring.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="calculator" size={size} color={color} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}
