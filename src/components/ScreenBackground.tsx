import React, { useMemo } from "react";
import { View, ImageBackground, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSettings } from "../context/SettingsContext";
import { usePremium } from "../premium/PremiumContext";

const BG_HOME_IMAGE = require("../../assets/images/bg-home.png");

export default function ScreenBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useSettings();
  const { isPremium } = usePremium();

  const bg = useMemo(() => {
    // Algunos fondos pueden ser premium. Ejemplo:
    const premiumLocked = state.backgroundId === "bg_midnight"; // lock demo
    const locked = premiumLocked && !isPremium;

    return { id: state.backgroundId, locked };
  }, [state.backgroundId, isPremium]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {/* Fondo base */}
      {bg.id === "bg_home_image" && (
        <ImageBackground
          source={BG_HOME_IMAGE}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      )}

      {bg.id !== "bg_home_image" && (
        <LinearGradient
          colors={
            bg.id === "bg_chaos_gradient"
              ? ["#2b054a", "#1a0b2e", "#000000"]
              : ["#050510", "#0b1220", "#000000"]
          }
          style={{ position: "absolute", width: "100%", height: "100%" }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Oscurecer + contraste para texto */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.82)"]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Neblina caótica */}
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(200, 50, 255, 0.18)",
          "transparent",
          "rgba(59, 130, 246, 0.14)",
        ]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        start={{ x: 0, y: 0.15 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Overlay de bloqueo si eligió un fondo premium sin premium */}
      {bg.locked && (
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.60)",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <View
            style={{
              padding: 14,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.10)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.14)",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
              🔒 Fondo Premium
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
              Activa Premium para usar este fondo.
            </Text>
          </View>
        </View>
      )}

      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
