import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import ScreenBackground from "../components/ScreenBackground";
import HeaderBar from "../components/HeaderBar";
import { usePremium } from "../premium/PremiumContext";
import { useSettings, type BackgroundId } from "../context/SettingsContext";

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children?: React.ReactNode;
}) {
  return (
    <View
      style={{
        marginTop: 12,
        borderRadius: 20,
        padding: 14,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
        {title}
      </Text>
      {!!desc && (
        <Text style={{ color: "rgba(255,255,255,0.72)", marginTop: 6 }}>
          {desc}
        </Text>
      )}
      {children}
    </View>
  );
}

function Btn({
  label,
  onPress,
  variant = "solid",
}: {
  label: string;
  onPress: () => void;
  variant?: "solid" | "action" | "ghost";
}) {
  const bg =
    variant === "action"
      ? "rgba(59,130,246,0.28)"
      : variant === "ghost"
      ? "transparent"
      : "rgba(255,255,255,0.10)";

  const brd =
    variant === "action" ? "rgba(59,130,246,0.55)" : "rgba(255,255,255,0.14)";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingVertical: 12,
          borderRadius: 16,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: brd,
          alignItems: "center",
          justifyContent: "center",
        },
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

export default function PremiumScreen({ navigation }: any) {
  const {
    isPremium,
    loading,
    purchaseMonthly,
    purchaseYearly,
    restore,
    devTogglePremium,
  } = usePremium();
  const { state, setBackgroundId } = useSettings();

  const backgrounds: Array<{
    id: BackgroundId;
    name: string;
    premium: boolean;
  }> = [
    { id: "bg_home_image", name: "Neón City (Imagen)", premium: false },
    { id: "bg_chaos_gradient", name: "Caos (Gradient)", premium: false },
    { id: "bg_midnight", name: "Midnight (Premium)", premium: true },
  ];

  return (
    <ScreenBackground>
      <HeaderBar title="Premium" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginTop: 6 }}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900" }}>
            {isPremium ? "✅ Premium Activo" : "🚀 Activa Premium"}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.70)",
              textAlign: "center",
              marginTop: 10,
              lineHeight: 20,
            }}
          >
            Quita anuncios y desbloquea palabras hot, categorías especiales,
            modos avanzados y fondos premium.
          </Text>
        </View>

        <Card
          title="Beneficios"
          desc="Esto es lo que desbloqueas al activar Premium:"
        >
          <View style={{ marginTop: 10, gap: 8 }}>
            <Text
              style={{ color: "rgba(255,255,255,0.85)", fontWeight: "800" }}
            >
              🔹 Sin anuncios
            </Text>
            <Text
              style={{ color: "rgba(255,255,255,0.85)", fontWeight: "800" }}
            >
              🔹 Palabras HOT + categorías especiales
            </Text>
            <Text
              style={{ color: "rgba(255,255,255,0.85)", fontWeight: "800" }}
            >
              🔹 Modos extra para juegos
            </Text>
            <Text
              style={{ color: "rgba(255,255,255,0.85)", fontWeight: "800" }}
            >
              🔹 Fondos Premium + personalización
            </Text>
          </View>
        </Card>

        {!isPremium && (
          <Card title="Suscripción">
            <View style={{ marginTop: 12, gap: 10 }}>
              <Btn
                label={loading ? "Cargando..." : "Premium Mensual"}
                onPress={() => purchaseMonthly()}
                variant="action"
              />
              <Btn
                label={loading ? "Cargando..." : "Premium Anual (Mejor precio)"}
                onPress={() => purchaseYearly()}
                variant="solid"
              />
              <Btn
                label="Restaurar compras"
                onPress={() => restore()}
                variant="ghost"
              />
            </View>

            {__DEV__ && (
              <View style={{ marginTop: 12 }}>
                <Btn
                  label="(DEV) Alternar Premium"
                  onPress={() => devTogglePremium()}
                  variant="ghost"
                />
              </View>
            )}

            <Text
              style={{
                color: "rgba(255,255,255,0.55)",
                marginTop: 10,
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              * Para compras reales necesitas Dev Client / EAS Build. Esta UI ya
              queda lista.
            </Text>
          </Card>
        )}

        <Card title="Cambiar Fondo" desc="Algunos fondos son Premium.">
          <View style={{ marginTop: 12, gap: 10 }}>
            {backgrounds.map((b) => {
              const locked = b.premium && !isPremium;
              const selected = state.backgroundId === b.id;

              return (
                <Pressable
                  key={b.id}
                  onPress={() => {
                    if (locked) return;
                    setBackgroundId(b.id);
                  }}
                  style={({ pressed }) => [
                    {
                      padding: 14,
                      borderRadius: 16,
                      backgroundColor: selected
                        ? "rgba(59,130,246,0.22)"
                        : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: selected
                        ? "rgba(59,130,246,0.55)"
                        : "rgba(255,255,255,0.12)",
                      opacity: locked ? 0.55 : 1,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>
                    {b.name} {locked ? "🔒" : selected ? "✅" : ""}
                  </Text>
                  <Text
                    style={{ color: "rgba(255,255,255,0.65)", marginTop: 4 }}
                  >
                    {locked ? "Requiere Premium" : "Toca para seleccionar"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </ScreenBackground>
  );
}
