import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />
      {/* Fondo degradado más "Caótico" para el menú principal */}
      <LinearGradient
        colors={["#2b054a", "#1a0b2e", "#000000"]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
          {/* Header */}
          <View style={{ marginBottom: 50 }}>
            <Text
              style={{
                fontSize: 48,
                fontWeight: "900",
                color: "transparent",
                textShadowColor: "rgba(200, 50, 255, 0.8)",
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 20,
              }}
            >
              NOCHE
            </Text>
            <Text
              style={{
                fontSize: 48,
                fontWeight: "900",
                color: "white",
                marginTop: -10,
              }}
            >
              DE CAOS
            </Text>
            <Text style={{ color: "#bcaecf", fontSize: 18, marginTop: 10 }}>
              La colección definitiva para fiestas.
            </Text>
          </View>

          {/* Grid de Juegos */}
          <View style={{ gap: 20 }}>
            {/* TARJETA IMPOSTOR (Activa) */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Impostor")}
              activeOpacity={0.8}
              style={{
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(59, 130, 246, 0.5)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#60a5fa",
                    fontWeight: "bold",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  POPULAR
                </Text>
                <Text
                  style={{ color: "white", fontSize: 28, fontWeight: "900" }}
                >
                  Impostor
                </Text>
                <Text style={{ color: "#cbd5e1", marginTop: 4 }}>
                  Descubre quién miente.
                </Text>
              </View>
              <Text style={{ fontSize: 40 }}>🕵️</Text>
            </TouchableOpacity>

            {/* TARJETA PRÓXIMAMENTE (Ejemplo para rellenar) */}
            <TouchableOpacity
              disabled={true}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: 0.6,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#aaa",
                    fontWeight: "bold",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  PRÓXIMAMENTE
                </Text>
                <Text
                  style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                >
                  Verdad o Reto
                </Text>
              </View>
              <Text style={{ fontSize: 35 }}>🔥</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={true}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.1)",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                opacity: 0.6,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#aaa",
                    fontWeight: "bold",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  PRÓXIMAMENTE
                </Text>
                <Text
                  style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                >
                  Yo Nunca
                </Text>
              </View>
              <Text style={{ fontSize: 35 }}>🍺</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ textAlign: "center", color: "#444", marginBottom: 20 }}>
          Versión 1.0.0
        </Text>
      </SafeAreaView>
    </View>
  );
}
