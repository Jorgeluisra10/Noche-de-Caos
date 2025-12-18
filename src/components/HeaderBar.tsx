import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HeaderBar({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        hitSlop={10}
      >
        <Text style={styles.backText}>←</Text>
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={{ width: 44 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  title: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
