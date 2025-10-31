// src/navigation/MainTabs.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import {
    HomeScreen,
    CategoriesScreen,
    CategoryModel,
    AnalyticsScreen,
    AdviceScreen,
    GoalsScreen,
    InvoiceScreen,
    TransactionScreen,
} from "../screens";

const Tab = createBottomTabNavigator();

const TAB_SCREENS = [
    { name: "Home", title: "Accueil", icon: "home", component: HomeScreen },
    { name: "Categories", title: "Catégories", icon: "folder", component: CategoriesScreen },
    { name: "Analytics", title: "Analytics", icon: "stats-chart", component: AnalyticsScreen },
    // { name: "Advices", title: "Conseils", icon: "bulb", component: AdviceScreen },
    { name: "Goals", title: "Objectifs", icon: "locate", component: GoalsScreen },
    { name: "Invoice", title: "Factures", icon: "newspaper", component: InvoiceScreen },
    { name: "Transaction", title: "Transactions", icon: "card", component: TransactionScreen },
];

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const screen = TAB_SCREENS.find((s) => s.name === route.name);
                return {
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: "#0B1221",
                        borderTopColor: "#1E293B",
                        height: 60,
                        paddingBottom: 6,
                    },
                    tabBarActiveTintColor: "#7C3AED",
                    tabBarInactiveTintColor: "#94A3B8",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name={screen?.icon || "ellipse"} size={22} color={color} />
                    ),
                };
            }}
        >
            {TAB_SCREENS.map((s) => (
                <Tab.Screen
                    key={s.name}
                    name={s.name}
                    component={s.component}
                    options={{ title: s.title }}
                />
            ))}
        </Tab.Navigator>
    );
}
