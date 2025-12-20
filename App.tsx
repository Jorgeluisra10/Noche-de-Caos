import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import HomeScreen from "./src/screens/HomeScreen";
import ImpostorGame from "./src/screens/ImpostorGame";

import { SettingsProvider } from "./src/context/SettingsContext";
import { PremiumProvider } from "./src/premium/PremiumContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PremiumProvider>
      <SettingsProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: "fade_from_bottom",
              contentStyle: { backgroundColor: "#000" },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Impostor" component={ImpostorGame} />
          </Stack.Navigator>
        </NavigationContainer>
      </SettingsProvider>
    </PremiumProvider>
  );
}
