// src/navigation/AppNavigator.jsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/authContext";
import LoginScreen from "../screens/auth/loginScreen";
import DrawerNavigator from "./DrawerNavigator"; // new

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { token } = useAuth();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: "fade",
            }}
        >
            {token ? (
                <Stack.Screen name="Main" component={DrawerNavigator} />
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
}
