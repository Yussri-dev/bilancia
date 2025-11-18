// src/navigation/InvoiceStack.jsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InvoiceScreen, InvoiceModel } from "@screens";

const Stack = createNativeStackNavigator();

export default function InvoiceStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="InvoicesList" component={InvoiceScreen} />
            <Stack.Screen
                name="InvoiceModel"
                component={InvoiceModel}
                options={{ presentation: "modal" }}
            />
        </Stack.Navigator>
    );
}
