import React from "react";
import { View, Text, Pressable } from "react-native";

export default function HeaderBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Pressable
        onPress={onBack}
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
          },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
          ←
        </Text>
      </Pressable>

      <Text style={{ color: "#fff", fontWeight: "900", letterSpacing: 0.5 }}>
        {title}
      </Text>

      <View
        style={{
          width: 44,
          height: 44,
          alignItems: "flex-end",
          justifyContent: "center",
        }}
      >
        {right ?? null}
      </View>
    </View>
  );
}
