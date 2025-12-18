import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import ScreenBackground from "../components/ScreenBackground";
import HeaderBar from "../components/HeaderBar";
import { useSettings } from "../context/SettingsContext";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
  const { state, setLanguage, setMusicEnabled, setMusicVolume, t } =
    useSettings();

  const stepDown = () =>
    setMusicVolume(Number((state.musicVolume - 0.1).toFixed(2)));
  const stepUp = () =>
    setMusicVolume(Number((state.musicVolume + 0.1).toFixed(2)));

  return (
    <ScreenBackground>
      <HeaderBar title={t("settings")} onBack={() => navigation.goBack()} />

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("language")}</Text>

        <View style={styles.row}>
          <Pressable
            onPress={() => setLanguage("es")}
            style={[styles.pill, state.language === "es" && styles.pillActive]}
          >
            <Text style={styles.pillText}>Español</Text>
          </Pressable>

          <Pressable
            onPress={() => setLanguage("en")}
            style={[styles.pill, state.language === "en" && styles.pillActive]}
          >
            <Text style={styles.pillText}>English</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{t("music")}</Text>

        <View style={[styles.row, { justifyContent: "space-between" }]}>
          <Text style={styles.label}>
            {state.musicEnabled ? t("musicOn") : t("musicOff")}
          </Text>

          <Pressable
            onPress={() => setMusicEnabled(!state.musicEnabled)}
            style={[
              styles.toggle,
              state.musicEnabled ? styles.toggleOn : styles.toggleOff,
            ]}
          >
            <View
              style={[
                styles.knob,
                state.musicEnabled
                  ? { alignSelf: "flex-end" }
                  : { alignSelf: "flex-start" },
              ]}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.row,
            { marginTop: 14, justifyContent: "space-between" },
          ]}
        >
          <Text style={styles.label}>
            {t("volume")}: {Math.round(state.musicVolume * 100)}%
          </Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable onPress={stepDown} style={styles.volBtn}>
              <Text style={styles.volBtnText}>−</Text>
            </Pressable>
            <Pressable onPress={stepUp} style={styles.volBtn}>
              <Text style={styles.volBtnText}>+</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View
            style={[
              styles.progressFill,
              { width: `${state.musicVolume * 100}%` },
            ]}
          />
        </View>
      </View>

      <Pressable
        onPress={() => navigation.navigate("Terms")}
        style={({ pressed }) => [styles.linkCard, pressed && { opacity: 0.75 }]}
      >
        <Text style={styles.linkTitle}>{t("terms")}</Text>
        <Text style={styles.linkSub}>→</Text>
      </Pressable>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 10, alignItems: "center" },

  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  pillActive: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(255,255,255,0.28)",
  },
  pillText: { color: "#fff", fontWeight: "800" },

  label: { color: "rgba(255,255,255,0.85)", fontWeight: "700" },

  toggle: {
    width: 54,
    height: 30,
    borderRadius: 999,
    padding: 4,
    justifyContent: "center",
  },
  toggleOn: {
    backgroundColor: "rgba(90, 255, 160, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(90,255,160,0.45)",
  },
  toggleOff: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#fff",
  },

  volBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  volBtnText: { color: "#fff", fontSize: 18, fontWeight: "900" },

  progressWrap: {
    height: 10,
    borderRadius: 999,
    marginTop: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.65)",
  },

  linkCard: {
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkTitle: { color: "#fff", fontWeight: "900" },
  linkSub: { color: "rgba(255,255,255,0.9)", fontWeight: "900" },
});
