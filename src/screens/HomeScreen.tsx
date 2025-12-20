import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import ScreenBackground from "../components/ScreenBackground";
import { useSettings } from "../context/SettingsContext";
import { usePremium } from "../premium/PremiumContext";

const TERMS_KEY = "@noche_terms_v1";

export default function HomeScreen({ navigation }: any) {
  const { state, setLanguage, setMusicEnabled, setMusicVolume } = useSettings();
  const {
    isPremium,
    loading,
    purchaseMonthly,
    purchaseYearly,
    restore,
    devTogglePremium,
  } = usePremium();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await import("@react-native-async-storage/async-storage");
        const AsyncStorage = raw.default;
        const v = await AsyncStorage.getItem(TERMS_KEY);
        setTermsAccepted(v === "1");
      } catch {}
    })();
  }, []);

  const copy = useMemo(() => {
    const es = {
      subtitle: "La colección definitiva para fiestas.",
      popular: "POPULAR",
      impostorTitle: "Impostor",
      impostorDesc: "Descubre quién miente.",
      soon: "PRÓXIMAMENTE",
      truth: "Verdad o Reto",
      never: "Yo Nunca",
      settingsTitle: "Configuración",
      language: "Idioma",
      music: "Música",
      volume: "Volumen",
      terms: "Términos y condiciones",
      close: "Cerrar",
      accepted: "Aceptados",
      pending: "Pendientes",
      accept: "Aceptar",
      mustAcceptTitle: "Términos pendientes",
      mustAcceptDesc:
        "Debes aceptar los términos y condiciones para continuar.",

      premium: "Premium",
      goPremium: "Volverse Premium",
      premiumSubtitle: "Desbloquea categorías PRO y futuras modalidades.",
      premiumActive: "Premium activo",
      premiumCTA: "Desbloquear ahora",
      premiumMonthly: "Mensual",
      premiumYearly: "Anual",
      bestValue: "Mejor precio",
      restore: "Restaurar",
      processing: "Procesando...",
      featuresTitle: "Qué obtienes",
      f1: "✅ Desbloqueas categorías PRO",
      f2: "✅ Palabras personalizadas",
      f3: "✅ Fondos premium (próximamente)",
      f4: "✅ Modos extra (próximamente)",
      dev: "DEV: Alternar Premium",
    };

    const en = {
      subtitle: "The ultimate party collection.",
      popular: "POPULAR",
      impostorTitle: "Impostor",
      impostorDesc: "Find who’s lying.",
      soon: "COMING SOON",
      truth: "Truth or Dare",
      never: "Never Have I Ever",
      settingsTitle: "Settings",
      language: "Language",
      music: "Music",
      volume: "Volume",
      terms: "Terms & conditions",
      close: "Close",
      accepted: "Accepted",
      pending: "Pending",
      accept: "Accept",
      mustAcceptTitle: "Terms required",
      mustAcceptDesc: "You must accept the terms & conditions to continue.",

      premium: "Premium",
      goPremium: "Go Premium",
      premiumSubtitle: "Unlock PRO categories and upcoming modes.",
      premiumActive: "Premium active",
      premiumCTA: "Unlock now",
      premiumMonthly: "Monthly",
      premiumYearly: "Yearly",
      bestValue: "Best value",
      restore: "Restore",
      processing: "Processing...",
      featuresTitle: "What you get",
      f1: "✅ Unlock PRO categories",
      f2: "✅ Custom words",
      f3: "✅ Premium backgrounds (soon)",
      f4: "✅ Extra modes (soon)",
      dev: "DEV: Toggle Premium",
    };

    return state.language === "en" ? en : es;
  }, [state.language]);

  const volPct = Math.round(state.musicVolume * 100);

  const volumeDown = () =>
    setMusicVolume(Math.max(0, +(state.musicVolume - 0.1).toFixed(2)));
  const volumeUp = () =>
    setMusicVolume(Math.min(1, +(state.musicVolume + 0.1).toFixed(2)));

  const acceptTerms = async () => {
    try {
      const raw = await import("@react-native-async-storage/async-storage");
      const AsyncStorage = raw.default;
      await AsyncStorage.setItem(TERMS_KEY, "1");
      setTermsAccepted(true);
      setTermsOpen(false);
    } catch {
      setTermsAccepted(true);
      setTermsOpen(false);
    }
  };

  const goImpostor = () => {
    if (!termsAccepted) {
      Alert.alert(copy.mustAcceptTitle, copy.mustAcceptDesc, [
        { text: "OK", onPress: () => setTermsOpen(true) },
      ]);
      setSettingsOpen(true);
      setTermsOpen(true);
      return;
    }
    navigation.navigate("Impostor");
  };

  const openPremium = () => {
    setSettingsOpen(false);
    setPremiumOpen(true);
  };

  const handleBuyMonthly = async () => {
    try {
      await purchaseMonthly();
      setPremiumOpen(false);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo completar la compra.");
    }
  };

  const handleBuyYearly = async () => {
    try {
      await purchaseYearly();
      setPremiumOpen(false);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo completar la compra.");
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo restaurar.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />

      <ScreenBackground>
        <SafeAreaView style={{ flex: 1 }}>
          {/* TOP BAR (bajado) */}
          <View
            style={{
              paddingHorizontal: 18,
              paddingTop: 18,
              paddingBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ width: 44, height: 44 }} />

            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontWeight: "900",
                  letterSpacing: 1,
                }}
              >
                NOCHE DE CAOS
              </Text>

              <View
                style={{
                  marginTop: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: isPremium
                    ? "rgba(85,255,153,0.14)"
                    : "rgba(255,255,255,0.06)",
                  borderWidth: 1,
                  borderColor: isPremium
                    ? "rgba(85,255,153,0.35)"
                    : "rgba(255,255,255,0.12)",
                }}
              >
                <Text
                  style={{
                    color: isPremium ? "#55ff99" : "rgba(255,255,255,0.65)",
                    fontWeight: "900",
                    fontSize: 12,
                  }}
                >
                  {isPremium
                    ? `👑 ${copy.premiumActive}`
                    : `✨ ${copy.premium}`}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setSettingsOpen(true)}
              style={({ pressed }) => [
                {
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#fff" }}>
                ⚙️
              </Text>
            </Pressable>
          </View>

          <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
            {/* HEADER */}
            <View style={{ marginBottom: 28 }}>
              <Text
                style={{
                  fontSize: 52,
                  fontWeight: "900",
                  color: "rgba(255,255,255,0.08)",
                  textShadowColor: "rgba(200, 50, 255, 0.95)",
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 26,
                  letterSpacing: 1,
                }}
              >
                NOCHE
              </Text>

              <Text
                style={{
                  fontSize: 52,
                  fontWeight: "900",
                  color: "white",
                  marginTop: -12,
                  letterSpacing: 1,
                  textShadowColor: "rgba(0, 0, 0, 0.45)",
                  textShadowOffset: { width: 0, height: 6 },
                  textShadowRadius: 12,
                }}
              >
                DE CAOS
              </Text>

              <Text
                style={{
                  color: "#bcaecf",
                  fontSize: 16,
                  marginTop: 10,
                  lineHeight: 22,
                }}
              >
                {copy.subtitle}
              </Text>
            </View>

            {/* PREMIUM BUTTON (solo si no es premium) */}
            {!isPremium && (
              <Pressable
                onPress={openPremium}
                style={({ pressed }) => [
                  {
                    marginBottom: 16,
                    borderRadius: 22,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.16)",
                    shadowColor: "#c832ff",
                    shadowOpacity: 0.25,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 10,
                    transform: [{ scale: pressed ? 0.99 : 1 }],
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    "rgba(200,50,255,0.38)",
                    "rgba(59,130,246,0.22)",
                    "rgba(255,255,255,0.06)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: 18, borderRadius: 22 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 18,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.14)",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>👑</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "900",
                          fontSize: 18,
                        }}
                      >
                        {copy.goPremium}
                      </Text>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.75)",
                          marginTop: 4,
                          lineHeight: 18,
                        }}
                      >
                        {copy.premiumSubtitle}
                      </Text>
                    </View>

                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 14,
                        backgroundColor: "rgba(0,0,0,0.25)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.14)",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "900" }}>
                        {copy.premiumCTA}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Pressable>
            )}

            {/* CARDS */}
            <View>
              <TouchableOpacity
                onPress={goImpostor}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "rgba(59, 130, 246, 0.16)",
                  borderRadius: 26,
                  padding: 22,
                  borderWidth: 1,
                  borderColor: "rgba(96, 165, 250, 0.55)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  shadowColor: "#60a5fa",
                  shadowOpacity: 0.22,
                  shadowRadius: 18,
                  shadowOffset: { width: 0, height: 10 },
                  elevation: 10,
                  marginBottom: 16,
                }}
              >
                <View style={{ paddingRight: 16 }}>
                  <Text
                    style={{
                      color: "#93c5fd",
                      fontWeight: "900",
                      letterSpacing: 1,
                      marginBottom: 6,
                      fontSize: 12,
                    }}
                  >
                    {copy.popular}
                  </Text>
                  <Text
                    style={{ color: "white", fontSize: 28, fontWeight: "900" }}
                  >
                    {copy.impostorTitle}
                  </Text>
                  <Text
                    style={{ color: "#dbeafe", marginTop: 6, opacity: 0.9 }}
                  >
                    {copy.impostorDesc}
                  </Text>

                  {!termsAccepted && (
                    <Text
                      style={{
                        marginTop: 10,
                        color: "rgba(255,255,255,0.65)",
                        fontWeight: "800",
                      }}
                    >
                      ⚠️ {copy.pending}: {copy.terms}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 42 }}>🕵️</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled
                activeOpacity={1}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 26,
                  padding: 22,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: 0.62,
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontWeight: "900",
                      letterSpacing: 1,
                      marginBottom: 6,
                      fontSize: 12,
                    }}
                  >
                    {copy.soon}
                  </Text>
                  <Text
                    style={{ color: "white", fontSize: 24, fontWeight: "900" }}
                  >
                    {copy.truth}
                  </Text>
                </View>
                <Text style={{ fontSize: 36 }}>🔥</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled
                activeOpacity={1}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 26,
                  padding: 22,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: 0.62,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      fontWeight: "900",
                      letterSpacing: 1,
                      marginBottom: 6,
                      fontSize: 12,
                    }}
                  >
                    {copy.soon}
                  </Text>
                  <Text
                    style={{ color: "white", fontSize: 24, fontWeight: "900" }}
                  >
                    {copy.never}
                  </Text>
                </View>
                <Text style={{ fontSize: 36 }}>🍺</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.25)",
              marginBottom: 18,
            }}
          >
            Versión 1.0.0
          </Text>
        </SafeAreaView>

        {/* SETTINGS MODAL */}
        <Modal
          visible={settingsOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setSettingsOpen(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.70)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                borderTopLeftRadius: 26,
                borderTopRightRadius: 26,
                backgroundColor: "rgba(12,12,16,0.98)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                padding: 18,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}
                >
                  {copy.settingsTitle}
                </Text>

                <Pressable
                  onPress={() => setSettingsOpen(false)}
                  style={({ pressed }) => [
                    { padding: 10 },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: "900",
                    }}
                  >
                    {copy.close}
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                style={{ maxHeight: 460 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Premium inside settings */}
                <Pressable
                  onPress={openPremium}
                  disabled={isPremium}
                  style={({ pressed }) => [
                    {
                      marginTop: 14,
                      borderRadius: 18,
                      overflow: "hidden",
                      borderWidth: 1,
                      borderColor: isPremium
                        ? "rgba(85,255,153,0.25)"
                        : "rgba(255,255,255,0.12)",
                      opacity: isPremium ? 0.7 : 1,
                    },
                    pressed && !isPremium && { opacity: 0.9 },
                  ]}
                >
                  <LinearGradient
                    colors={
                      isPremium
                        ? ["rgba(85,255,153,0.16)", "rgba(255,255,255,0.06)"]
                        : ["rgba(200,50,255,0.26)", "rgba(59,130,246,0.18)"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 14 }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={{ fontSize: 18, marginRight: 10 }}>
                        {isPremium ? "👑" : "✨"}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#fff", fontWeight: "900" }}>
                          {isPremium ? copy.premiumActive : copy.goPremium}
                        </Text>
                        <Text
                          style={{
                            color: "rgba(255,255,255,0.7)",
                            marginTop: 4,
                          }}
                        >
                          {isPremium ? copy.f1 : copy.premiumSubtitle}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.75)",
                          fontWeight: "900",
                        }}
                      >
                        {isPremium ? "✓" : "›"}
                      </Text>
                    </View>
                  </LinearGradient>
                </Pressable>

                {/* Language */}
                <View
                  style={{
                    marginTop: 12,
                    padding: 14,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontWeight: "900",
                      marginBottom: 10,
                    }}
                  >
                    {copy.language}
                  </Text>

                  <View style={{ flexDirection: "row" }}>
                    <Pressable
                      onPress={() => setLanguage("es")}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 14,
                        alignItems: "center",
                        backgroundColor:
                          state.language === "es"
                            ? "rgba(59,130,246,0.25)"
                            : "rgba(255,255,255,0.06)",
                        borderWidth: 1,
                        borderColor:
                          state.language === "es"
                            ? "rgba(59,130,246,0.55)"
                            : "rgba(255,255,255,0.10)",
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "900" }}>
                        Español
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setLanguage("en")}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 14,
                        alignItems: "center",
                        backgroundColor:
                          state.language === "en"
                            ? "rgba(200,50,255,0.20)"
                            : "rgba(255,255,255,0.06)",
                        borderWidth: 1,
                        borderColor:
                          state.language === "en"
                            ? "rgba(200,50,255,0.45)"
                            : "rgba(255,255,255,0.10)",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "900" }}>
                        English
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Music */}
                <View
                  style={{
                    marginTop: 12,
                    padding: 14,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.10)",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: "900",
                      }}
                    >
                      {copy.music}
                    </Text>
                    <Switch
                      value={state.musicEnabled}
                      onValueChange={setMusicEnabled}
                    />
                  </View>

                  <View style={{ marginTop: 14 }}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.65)",
                        fontWeight: "800",
                        marginBottom: 10,
                      }}
                    >
                      {copy.volume}: {volPct}%
                    </Text>

                    <View style={{ flexDirection: "row" }}>
                      <Pressable
                        onPress={volumeDown}
                        disabled={!state.musicEnabled}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 14,
                            alignItems: "center",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.12)",
                            opacity: state.musicEnabled ? 1 : 0.4,
                            marginRight: 10,
                          },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "900",
                            fontSize: 18,
                          }}
                        >
                          −
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={volumeUp}
                        disabled={!state.musicEnabled}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 14,
                            alignItems: "center",
                            backgroundColor: "rgba(255,255,255,0.08)",
                            borderWidth: 1,
                            borderColor: "rgba(255,255,255,0.12)",
                            opacity: state.musicEnabled ? 1 : 0.4,
                          },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "900",
                            fontSize: 18,
                          }}
                        >
                          +
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Terms */}
                <Pressable
                  onPress={() => setTermsOpen(true)}
                  style={({ pressed }) => [
                    {
                      marginTop: 12,
                      padding: 14,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.10)",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: "900",
                      }}
                    >
                      {copy.terms}
                    </Text>
                    <Text
                      style={{ color: "rgba(255,255,255,0.55)", marginTop: 6 }}
                    >
                      {termsAccepted
                        ? `✅ ${copy.accepted}`
                        : `⚠️ ${copy.pending}`}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontWeight: "900",
                    }}
                  >
                    ›
                  </Text>
                </Pressable>

                {/* Dev toggle */}
                {__DEV__ && (
                  <Pressable
                    onPress={devTogglePremium}
                    style={({ pressed }) => [
                      {
                        marginTop: 12,
                        padding: 14,
                        borderRadius: 18,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.10)",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: "900",
                      }}
                    >
                      {copy.dev}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: "900",
                      }}
                    >
                      {isPremium ? "ON" : "OFF"}
                    </Text>
                  </Pressable>
                )}

                <View style={{ height: 10 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* PREMIUM MODAL */}
        <Modal
          visible={premiumOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setPremiumOpen(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.82)",
              justifyContent: "center",
              padding: 18,
            }}
          >
            <View
              style={{
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "rgba(12,12,16,0.98)",
              }}
            >
              <LinearGradient
                colors={[
                  "rgba(200,50,255,0.25)",
                  "rgba(59,130,246,0.16)",
                  "rgba(0,0,0,0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 16 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 22, marginRight: 10 }}>👑</Text>
                    <Text
                      style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}
                    >
                      {copy.goPremium}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => setPremiumOpen(false)}
                    style={({ pressed }) => [
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 14,
                        backgroundColor: "rgba(255,255,255,0.08)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900" }}>
                      {copy.close}
                    </Text>
                  </Pressable>
                </View>

                <View style={{ marginTop: 12 }}>
                  <View
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.10)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "900",
                        marginBottom: 10,
                      }}
                    >
                      {copy.featuresTitle}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.78)",
                        lineHeight: 22,
                      }}
                    >
                      {copy.f1}
                      {"\n"}
                      {copy.f2}
                      {"\n"}
                      {copy.f3}
                      {"\n"}
                      {copy.f4}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 14 }}>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <Pressable
                      onPress={handleBuyMonthly}
                      disabled={loading}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 16,
                          alignItems: "center",
                          backgroundColor: "rgba(255,255,255,0.08)",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.12)",
                          opacity: loading ? 0.6 : 1,
                        },
                        pressed && !loading && { opacity: 0.85 },
                      ]}
                    >
                      <Text style={{ color: "#fff", fontWeight: "900" }}>
                        {copy.premiumMonthly}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={handleBuyYearly}
                      disabled={loading}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          paddingVertical: 12,
                          borderRadius: 16,
                          alignItems: "center",
                          backgroundColor: "rgba(59,130,246,0.28)",
                          borderWidth: 1,
                          borderColor: "rgba(59,130,246,0.55)",
                          opacity: loading ? 0.6 : 1,
                        },
                        pressed && !loading && { opacity: 0.85 },
                      ]}
                    >
                      <Text style={{ color: "#fff", fontWeight: "900" }}>
                        {copy.premiumYearly} · {copy.bestValue}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={handleRestore}
                    disabled={loading}
                    style={({ pressed }) => [
                      {
                        marginTop: 10,
                        paddingVertical: 12,
                        borderRadius: 16,
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.25)",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                        opacity: loading ? 0.6 : 1,
                      },
                      pressed && !loading && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontWeight: "900",
                      }}
                    >
                      {copy.restore}
                    </Text>
                  </Pressable>

                  {loading && (
                    <View
                      style={{
                        marginTop: 12,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <ActivityIndicator />
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          marginLeft: 10,
                        }}
                      >
                        {copy.processing}
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* TERMS MODAL */}
        <Modal
          visible={termsOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setTermsOpen(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.78)",
              justifyContent: "center",
              padding: 18,
            }}
          >
            <View
              style={{
                borderRadius: 22,
                backgroundColor: "rgba(12,12,16,0.98)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                padding: 16,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
                {copy.terms}
              </Text>

              <ScrollView
                style={{ maxHeight: 340, marginTop: 12 }}
                showsVerticalScrollIndicator={false}
              >
                <Text
                  style={{ color: "rgba(255,255,255,0.72)", lineHeight: 20 }}
                >
                  Aquí van tus términos reales. Ejemplo:
                  {"\n\n"}
                  1) Uso bajo responsabilidad del usuario.
                  {"\n"}
                  2) No nos hacemos responsables por mal uso en fiestas.
                  {"\n"}
                  3) La música y contenido pueden cambiar con actualizaciones.
                  {"\n\n"}
                  Reemplaza este texto por tus términos definitivos.
                </Text>
              </ScrollView>

              <View style={{ flexDirection: "row", marginTop: 14 }}>
                <Pressable
                  onPress={() => setTermsOpen(false)}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      alignItems: "center",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                      marginRight: 10,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>
                    {copy.close}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={acceptTerms}
                  style={({ pressed }) => [
                    {
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      alignItems: "center",
                      backgroundColor: "rgba(59,130,246,0.28)",
                      borderWidth: 1,
                      borderColor: "rgba(59,130,246,0.55)",
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>
                    {copy.accept}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScreenBackground>
    </View>
  );
}
