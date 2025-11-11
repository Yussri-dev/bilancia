// src/navigation/AppNavigator.jsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@contexts/authContext";

// Auth screens
import LoginScreen from "@screens/auth/loginScreen";
import RegisterScreen from "@screens/auth/RegisterScreen";
import ForgotPasswordScreen from "@screens/auth/ForgotPasswordScreen";

// Main app
import DrawerNavigator from "./DrawerNavigator";

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
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                    <Stack.Screen
                        name="ForgotPassword"
                        component={ForgotPasswordScreen}
                    />
                </>
            )}
        </Stack.Navigator>
    );
}
