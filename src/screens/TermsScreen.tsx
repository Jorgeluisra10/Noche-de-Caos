import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import ScreenBackground from "../components/ScreenBackground";
import HeaderBar from "../components/HeaderBar";
import { useSettings } from "../context/SettingsContext";

type Props = NativeStackScreenProps<RootStackParamList, "Terms">;

export default function TermsScreen({ navigation }: Props) {
  const { t } = useSettings();

  return (
    <ScreenBackground>
      <HeaderBar title={t("termsTitle")} onBack={() => navigation.goBack()} />

      <View style={styles.card}>
        <Text style={styles.intro}>{t("termsIntro")}</Text>

        <ScrollView
          style={{ marginTop: 12 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.body}>{t("termsBody")}</Text>
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    flex: 1,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  intro: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  body: {
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
    fontWeight: "600",
  },
});
