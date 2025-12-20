import React from "react";
import { View, Text } from "react-native";
import { usePremium } from "../premium/PremiumContext";

/**
 * Placeholder: aquí luego conectas AdMob / Google Mobile Ads.
 * Pero ya queda perfecto el gating: si Premium => no se muestra.
 */
export default function AdBanner() {
  const { features } = usePremium();

  if (features.adsDisabled) return null;

  return (
    <View
      style={{
        marginHorizontal: 18,
        marginBottom: 14,
        padding: 14,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "rgba(255,255,255,0.75)", fontWeight: "900" }}>
        Anuncio (demo)
      </Text>
      <Text style={{ color: "rgba(255,255,255,0.50)", marginTop: 4 }}>
        Con Premium desaparece.
      </Text>
    </View>
  );
}
