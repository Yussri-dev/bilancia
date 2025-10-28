import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/loginScreen";
import { useAuth } from "../contexts/authContext";
import MainNavigator from "./mainNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { token } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {token !== null ? (
                <Stack.Screen name="Main" component={MainNavigator} />
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
}