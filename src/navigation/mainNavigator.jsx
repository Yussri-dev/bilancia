// src/navigation/MainNavigator.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/main/homeScreen";
import CategoriesScreen from "../screens/categories/categoriesScreen";
import CategoryModel from "../screens/categories/categoryModel";
import AnalyticsScreen from "../screens/analytic/analyticsScreen";
import AdviceScreen from "../screens/advice/adviceScreen";
import GoalsScreen from "../screens/goals/goalsScreen";
import InvoiceScreen from "../screens/invoice/invoiceScreen";
import TransactionScreen from "../screens/transaction/transactionScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#0B1221",
                    borderTopColor: "#1E293B",
                    height: 60,
                    paddingBottom: 6,
                },
                tabBarActiveTintColor: "#7C3AED",
                tabBarInactiveTintColor: "#94A3B8",
                tabBarIcon: ({ color }) => {
                    let iconName = "home";
                    if (route.name === "Home") iconName = "home";
                    else if (route.name === "Categories") iconName = "folder";
                    else if (route.name === "Analytics") iconName = "stats-chart";
                    else if (route.name === "Advices") iconName = "bulb";
                    else if (route.name === "Goals") iconName = "locate";
                    else if (route.name === "Invoice") iconName = "newspaper";
                    else if (route.name === "Transaction") iconName = "card";
                    return <Ionicons name={iconName} size={22} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Accueil" }} />
            <Tab.Screen name="Categories" component={CategoriesScreen} options={{ title: "Catégories" }} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: "Analytics" }} />
            <Tab.Screen name="Advices" component={AdviceScreen} options={{ title: "Conseils" }} />
            <Tab.Screen name="Goals" component={GoalsScreen} options={{ title: "Objectifs" }} />
            <Tab.Screen name="Invoice" component={InvoiceScreen} options={{ title: "Invoices" }} />
            <Tab.Screen name="Transaction" component={TransactionScreen} options={{ title: "Transactions" }} />
        </Tab.Navigator>
    );
}

// main stack with tabs + modal
export default function MainNavigator() {
    return (
        <Stack.Navigator>
            {/* Tabs (main screens) */}
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />

            {/* Category modal */}
            <Stack.Screen
                name="CategoryModel"
                component={CategoryModel}
                options={{
                    presentation: "modal", // modal effect
                    headerShown: false,
                }}
            />
        </Stack.Navigator>
    );
}
