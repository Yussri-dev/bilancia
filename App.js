// import "react-native-gesture-handler";
// import "react-native-reanimated";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@contexts/authContext";
import AppNavigator from "./src/navigation/appNavigator";
import { ThemeProvider } from "@contexts/ThemeContext";

import { Buffer } from "buffer";
global.Buffer = Buffer;

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
