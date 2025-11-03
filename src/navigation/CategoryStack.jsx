// src/navigation/CategoryStack.jsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CategoriesScreen, CategoryModel } from "../screens";

const Stack = createNativeStackNavigator();

export default function CategoryStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CategoriesList" component={CategoriesScreen} />
            <Stack.Screen
                name="CategoryModel"
                component={CategoryModel}
                options={{ presentation: "modal" }}
            />
        </Stack.Navigator>
    );
}
