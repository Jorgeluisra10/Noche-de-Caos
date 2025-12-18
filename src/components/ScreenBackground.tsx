import React from "react";
import { View, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ScreenBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <ImageBackground
        source={require("../../assets/images/bg-home.png")}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      {/* Oscurecer + contraste para texto */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.82)"]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* “Neblina” caótica */}
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

      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
