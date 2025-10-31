// import "react-native-gesture-handler";
// import "react-native-reanimated";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/contexts/authContext";
import AppNavigator from "./src/navigation/appNavigator";

import { Buffer } from "buffer";
global.Buffer = Buffer;

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
