import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

// Importar las pantallas
import HomeScreen from "./src/screens/HomeScreen";
import ImpostorGame from "./src/screens/ImpostorGame";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // Ocultamos la barra de arriba por defecto para usar nuestro diseño custom
          animation: "fade_from_bottom", // Animación elegante entre pantallas
          contentStyle: { backgroundColor: "#000" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Impostor" component={ImpostorGame} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
