// import "react-native-gesture-handler";
// import "react-native-reanimated";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/contexts/authContext";
import AppNavigator from "./src/navigation/appNavigator";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
