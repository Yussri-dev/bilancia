import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import CustomDrawerContent from "@components/CustomDrawerContent";
import Tabs from "./MainTabs";

import {
    AnalyticsScreen,
    AdviceScreen,
    GoalsScreen,
    InvoiceScreen,
    TransactionScreen,
    ProfileScreen,
} from "@screens";

import CategoryStack from "@navigation/CategoryStack";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    const { t } = useTranslation();

    return (
        <Drawer.Navigator
            initialRouteName="Tabs"
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: "#7C3AED",
                drawerInactiveTintColor: "#94A3B8",
                drawerStyle: {
                    backgroundColor: "#0B1221",
                    width: 260,
                },
                drawerLabelStyle: { fontSize: 16 },
            }}
        >
            <Drawer.Screen
                name="Tabs"
                component={Tabs}
                options={{
                    title: t("dashboard.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="grid" color={color} size={size} />
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
                name="Invoice"
                component={InvoiceScreen}
                options={{
                    title: t("invoices.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="newspaper" size={size} color={color} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Transaction"
                component={TransactionScreen}
                options={{
                    title: t("transactions.title"),
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="card" size={size} color={color} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}
