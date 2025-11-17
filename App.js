// import "react-native-gesture-handler";
// import "react-native-reanimated";

import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@contexts/authContext";
import AppNavigator from "@navigation/appNavigator";
import { ThemeProvider } from "@contexts/ThemeContext";
import * as Updates from "expo-updates";
import { Alert } from "react-native";
import "./src/lang";

import { Buffer } from "buffer";
global.Buffer = Buffer;

export default function App() {
  
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();
  
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
  
          Alert.alert(
            "New Update Available",
            "A new version is ready. Restart now?",
            [
              { text: "Later", style: "cancel" },
              { text: "Restart", onPress: () => Updates.reloadAsync() }
            ]
          );
        }
      } catch (error) {
        console.log("Updates check failed:", error);
      }
    }
    
    checkForUpdates();
  }, []);

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
