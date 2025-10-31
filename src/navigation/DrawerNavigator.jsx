// src/navigation/DrawerNavigator.jsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import CustomDrawerContent from "../components/CustomDrawerContent";
import Tabs from "./MainTabs"; // extracted from your current MainNavigator
import AnalyticsScreen from "../screens/analytic/analyticsScreen";

// Optional: add other standalone screens (Profile, Settings)
import ProfileScreen from "../screens/profile/ProfileScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
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
                    title: "Tableau de bord",
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="grid" color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: "Profil",
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="person-circle" color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="Analytics"
                component={AnalyticsScreen}
                options={{
                    title: "Analytics",
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
}
