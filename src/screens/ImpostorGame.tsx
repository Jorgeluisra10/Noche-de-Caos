import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Vibration,
  KeyboardAvoidingView,
  StatusBar,
  BackHandler,
  Alert,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from "react-native";

import ScreenBackground from "../components/ScreenBackground";
import { useSettings } from "../context/SettingsContext";

/* ===================== Configuración (LayoutAnimation Android) ===================== */
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ===================== Tipos ===================== */
type Phase =
  | "home"
  | "setup"
  | "reveal_pass"
  | "reveal_secret"
  | "discussion"
  | "vote_pass"
  | "vote_pick"
  | "results";

type Player = { id: string; name: string };

type Tier = "free" | "pro";
type CategoryId =
  | "food"
  | "places"
  | "animals"
  | "objects"
  | "jobs"
  | "transport"
  | "movies"
  | "sports"
  | "music"
  | "tech";

type Category = {
  id: CategoryId;
  label: string;
  emoji: string;
  tier: Tier;
};

type Word = { categoryId: CategoryId; word: string };
type VoteChoice = { voterId: string; targetId: string | "skip" };

/* ===================== Categorías (10) | 5 FREE + 5 PRO ===================== */
const CATEGORIES: Category[] = [
  { id: "food", label: "Comida", emoji: "🍔", tier: "free" },
  { id: "places", label: "Lugar", emoji: "🏥", tier: "free" },
  { id: "animals", label: "Animal", emoji: "🦈", tier: "free" },
  { id: "objects", label: "Objeto", emoji: "🪞", tier: "free" },
  { id: "jobs", label: "Profesión", emoji: "🧑‍🚀", tier: "free" },

  { id: "transport", label: "Transporte", emoji: "✈️", tier: "pro" },
  { id: "movies", label: "Cine", emoji: "🎬", tier: "pro" },
  { id: "sports", label: "Deportes", emoji: "⚽", tier: "pro" },
  { id: "music", label: "Música", emoji: "🎵", tier: "pro" },
  { id: "tech", label: "Tecnología", emoji: "💻", tier: "pro" },
];

const CAT_MAP = new Map<CategoryId, Category>(
  CATEGORIES.map((c) => [c.id, c] as const)
);

const FREE_DEFAULT: CategoryId[] = CATEGORIES.filter(
  (c) => c.tier === "free"
).map((c) => c.id);

/* ===================== Banco de Palabras (respeta categoryId) ===================== */
const WORD_BANK: Word[] = [
  // FREE - Comida
  { categoryId: "food", word: "Hamburguesa" },
  { categoryId: "food", word: "Sushi" },
  { categoryId: "food", word: "Pizza" },
  { categoryId: "food", word: "Tacos" },

  // FREE - Lugar
  { categoryId: "places", word: "Hospital" },
  { categoryId: "places", word: "Cementerio" },
  { categoryId: "places", word: "Escuela" },
  { categoryId: "places", word: "Cine" },

  // FREE - Animal
  { categoryId: "animals", word: "Jirafa" },
  { categoryId: "animals", word: "Pingüino" },
  { categoryId: "animals", word: "Tiburón" },
  { categoryId: "animals", word: "Elefante" },

  // FREE - Objeto
  { categoryId: "objects", word: "Paraguas" },
  { categoryId: "objects", word: "Espejo" },
  { categoryId: "objects", word: "Linterna" },
  { categoryId: "objects", word: "Candado" },

  // FREE - Profesión
  { categoryId: "jobs", word: "Astronauta" },
  { categoryId: "jobs", word: "Bombero" },
  { categoryId: "jobs", word: "Payaso" },
  { categoryId: "jobs", word: "Cirujano" },

  // PRO - Transporte
  { categoryId: "transport", word: "Submarino" },
  { categoryId: "transport", word: "Avión" },
  { categoryId: "transport", word: "Tren bala" },
  { categoryId: "transport", word: "Helicóptero" },

  // PRO - Cine
  { categoryId: "movies", word: "Titanic" },
  { categoryId: "movies", word: "Harry Potter" },
  { categoryId: "movies", word: "Matrix" },
  { categoryId: "movies", word: "El Padrino" },

  // PRO - Deportes
  { categoryId: "sports", word: "Maratón" },
  { categoryId: "sports", word: "Boxeo" },
  { categoryId: "sports", word: "Fútbol" },
  { categoryId: "sports", word: "NBA" },

  // PRO - Música
  { categoryId: "music", word: "Reggaetón" },
  { categoryId: "music", word: "Rock" },
  { categoryId: "music", word: "Concierto" },
  { categoryId: "music", word: "DJ" },

  // PRO - Tecnología
  { categoryId: "tech", word: "Inteligencia Artificial" },
  { categoryId: "tech", word: "Robots" },
  { categoryId: "tech", word: "iPhone" },
  { categoryId: "tech", word: "Criptomonedas" },
];

/* ===================== Utilidades ===================== */
function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sanitizeName(s: string) {
  return s.trim().replace(/\s+/g, " ").slice(0, 18);
}

function categoryLabel(id: CategoryId) {
  return CAT_MAP.get(id)?.label || "General";
}

function pickRandomWord(allowedCategories: CategoryId[]): Word {
  const filtered = WORD_BANK.filter((w) =>
    allowedCategories.includes(w.categoryId)
  );
  const pool = filtered.length ? filtered : WORD_BANK;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ===================== Componentes UI ===================== */
function GlassCard({
  children,
  style,
  color = "rgba(255,255,255,0.08)",
}: {
  children: React.ReactNode;
  style?: any;
  color?: string;
}) {
  return (
    <View
      style={[
        {
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.15)",
          backgroundColor: color,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Btn({
  label,
  onPress,
  variant = "solid",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "solid" | "ghost" | "danger" | "action";
  disabled?: boolean;
}) {
  const getBg = () => {
    if (variant === "danger") return "rgba(255,80,80,0.2)";
    if (variant === "action") return "#3b82f6";
    if (variant === "solid") return "rgba(255,255,255,0.15)";
    return "transparent";
  };

  return (
    <TouchableOpacity
      onPress={() => {
        if (!disabled) {
          Vibration.vibrate(10);
          onPress();
        }
      }}
      disabled={disabled}
      activeOpacity={0.7}
      style={{
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: "rgba(255,255,255,0.3)",
        backgroundColor: getBg(),
        opacity: disabled ? 0.5 : 1,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 100,
      }}
    >
      <Text style={{ fontSize: 17, fontWeight: "800", color: "white" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function BigTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontSize: 36,
        fontWeight: "900",
        color: "white",
        textAlign: "center",
        marginBottom: 10,
      }}
    >
      {children}
    </Text>
  );
}

/* ===================== Pantalla ===================== */
export default function ImpostorGame({ navigation }: any) {
  const { state } = useSettings();

  // PRO flag (no rompe si no existe)
  const isPro = !!(state as any)?.isPro || (state as any)?.plan === "pro";

  const [phase, setPhase] = useState<Phase>("home");

  // Datos
  const [players, setPlayers] = useState<Player[]>([
    { id: uid(), name: "Jugador 1" },
    { id: uid(), name: "Jugador 2" },
    { id: uid(), name: "Jugador 3" },
  ]);

  const [newName, setNewName] = useState("");
  const [customWord, setCustomWord] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomWord, setUseCustomWord] = useState(false);

  // Categorías seleccionadas (por defecto: FREE)
  const [selectedCategories, setSelectedCategories] =
    useState<CategoryId[]>(FREE_DEFAULT);

  const allowedCategories = useMemo(() => {
    if (isPro)
      return selectedCategories.length
        ? selectedCategories
        : (CATEGORIES.map((c) => c.id) as CategoryId[]);
    // FREE: filtra cualquier PRO por seguridad
    const onlyFree = selectedCategories.filter(
      (id) => (CAT_MAP.get(id)?.tier || "free") === "free"
    );
    return onlyFree.length ? onlyFree : FREE_DEFAULT;
  }, [isPro, selectedCategories]);

  // Ronda
  const [roundPlayers, setRoundPlayers] = useState<Player[]>([]);
  const [impostorId, setImpostorId] = useState<string>("");
  const [secret, setSecret] = useState<
    Word | { category: string; word: string } | null
  >(null);

  // Índices
  const [revealIndex, setRevealIndex] = useState(0);
  const [voteIndex, setVoteIndex] = useState(0);
  const [votes, setVotes] = useState<VoteChoice[]>([]);

  // “Mantener presionado”
  const [isHoldingSecret, setIsHoldingSecret] = useState(false);

  // Timer discussion
  const [discussionEndsAt, setDiscussionEndsAt] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [discussionRunning, setDiscussionRunning] = useState(false);

  /* ===================== Back Handler ===================== */
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const backAction = () => {
      if (phase === "home") return false;

      Alert.alert("¿Salir?", "Se perderá el progreso de esta ronda.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => {
            setDiscussionRunning(false);
            setIsHoldingSecret(false);
            setPhase("home");
          },
        },
      ]);
      return true;
    };

    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => handler.remove();
  }, [phase]);

  /* ===================== Timer Effect ===================== */
  useEffect(() => {
    if (!discussionRunning) return;

    const interval = setInterval(() => {
      const t = Math.max(0, Math.ceil((discussionEndsAt - Date.now()) / 1000));
      setTimeLeft(t);
      if (t <= 0) {
        setDiscussionRunning(false);
        Vibration.vibrate([0, 500]);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [discussionRunning, discussionEndsAt]);

  /* ===================== Lógica del Juego ===================== */
  const startNewRound = () => {
    if (players.length < 3) {
      Alert.alert("Error", "Mínimo 3 jugadores.");
      return;
    }

    setDiscussionRunning(false);
    setTimeLeft(0);
    setIsHoldingSecret(false);

    const rp = shuffle([...players]);
    const imp = rp[Math.floor(Math.random() * rp.length)].id;

    const w = useCustomWord
      ? {
          category: (customCategory.trim() || "General").slice(0, 18),
          word: (customWord.trim() || "Secreto").slice(0, 28),
        }
      : pickRandomWord(allowedCategories);

    setRoundPlayers(rp);
    setImpostorId(imp);
    setSecret(w);

    setRevealIndex(0);
    setVoteIndex(0);
    setVotes([]);

    setPhase("reveal_pass");
  };

  const addPlayer = () => {
    const name = sanitizeName(newName);
    if (name.length < 2) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlayers((prev) => [...prev, { id: uid(), name }]);
    setNewName("");
  };

  const removePlayer = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const nextReveal = () => {
    setIsHoldingSecret(false);

    if (revealIndex + 1 < roundPlayers.length) {
      setRevealIndex((i) => i + 1);
      setPhase("reveal_pass");
    } else {
      setPhase("discussion");
    }
  };

  const vote = (targetId: string | "skip") => {
    const voter = roundPlayers[voteIndex];

    setVotes((prev) => [
      ...prev.filter((v) => v.voterId !== voter.id),
      { voterId: voter.id, targetId },
    ]);

    if (voteIndex + 1 < roundPlayers.length) {
      setVoteIndex((i) => i + 1);
      setPhase("vote_pass");
    } else {
      setPhase("results");
    }
  };

  const toggleCategory = (id: CategoryId) => {
    const cat = CAT_MAP.get(id);
    if (!cat) return;

    if (cat.tier === "pro" && !isPro) {
      Alert.alert(
        "Categoría PRO",
        "Esta categoría es exclusiva para usuarios PRO."
      );
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategories((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((c) => c !== id);
      return [...prev, id];
    });
  };

  const selectAllAllowed = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isPro) setSelectedCategories(CATEGORIES.map((c) => c.id));
    else setSelectedCategories(FREE_DEFAULT);
  };

  const clearCategories = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCategories([]);
  };

  /* ===================== Revelación ===================== */
  const currentPlayer = roundPlayers[revealIndex];
  const isImpostor = currentPlayer?.id === impostorId;

  const secretWord = secret && "word" in secret ? secret.word : "";
  const secretCategory = secret
    ? "categoryId" in secret
      ? categoryLabel(secret.categoryId)
      : (secret as any).category
    : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />

      <ScreenBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 20 }}>
            {/* Barra superior (salir) */}
            <View
              style={{
                height: 48,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Pressable
                onPress={() => {
                  if (phase === "home") {
                    navigation?.goBack?.();
                    return;
                  }
                  Alert.alert(
                    "¿Salir?",
                    "Se perderá el progreso de esta ronda.",
                    [
                      { text: "Cancelar", style: "cancel" },
                      {
                        text: "Salir",
                        style: "destructive",
                        onPress: () => {
                          setDiscussionRunning(false);
                          setIsHoldingSecret(false);
                          setPhase("home");
                        },
                      },
                    ]
                  );
                }}
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
                <Text
                  style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}
                >
                  ←
                </Text>
              </Pressable>

              <Text
                style={{ color: "#fff", fontWeight: "900", letterSpacing: 0.5 }}
              >
                IMPOSTOR
              </Text>

              <View style={{ width: 44, height: 44 }} />
            </View>

            {/* HOME */}
            {phase === "home" && (
              <View style={{ flex: 1, justifyContent: "center" }}>
                <BigTitle>IMPOSTOR</BigTitle>
                <Text
                  style={{
                    textAlign: "center",
                    color: "rgba(255,255,255,0.72)",
                    marginBottom: 28,
                    fontSize: 15,
                    lineHeight: 22,
                  }}
                >
                  Descubre al impostor antes de que sea tarde.
                </Text>

                <GlassCard>
                  <Btn
                    label="JUEGO RÁPIDO"
                    onPress={startNewRound}
                    variant="action"
                  />
                  <View style={{ height: 14 }} />
                  <Btn
                    label="Configurar jugadores"
                    onPress={() => setPhase("setup")}
                    variant="solid"
                  />
                </GlassCard>

                <Text
                  style={{
                    marginTop: 14,
                    textAlign: "center",
                    color: "rgba(255,255,255,0.45)",
                    fontWeight: "800",
                  }}
                >
                  Plan: {isPro ? "PRO ✅" : "FREE"}
                </Text>
              </View>
            )}

            {/* SETUP */}
            {phase === "setup" && (
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: "white",
                    marginBottom: 10,
                  }}
                >
                  Jugadores ({players.length})
                </Text>

                <View style={{ flexDirection: "row", marginBottom: 16 }}>
                  <TextInput
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Nombre..."
                    placeholderTextColor="#666"
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.35)",
                      color: "white",
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.12)",
                      marginRight: 10,
                    }}
                  />
                  <Btn
                    label="+"
                    onPress={addPlayer}
                    variant="action"
                    disabled={sanitizeName(newName).length < 2}
                  />
                </View>

                <FlatList
                  data={players}
                  keyExtractor={(item) => item.id}
                  style={{ marginBottom: 10 }}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        padding: 14,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        marginBottom: 8,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.10)",
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontSize: 16,
                          fontWeight: "800",
                        }}
                      >
                        {item.name}
                      </Text>

                      <TouchableOpacity
                        onPress={() => removePlayer(item.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ color: "#ff6b6b", fontWeight: "900" }}>
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />

                {/* Selector de Categorías */}
                {!useCustomWord && (
                  <GlassCard style={{ marginTop: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "900",
                          fontSize: 16,
                        }}
                      >
                        Categorías ({isPro ? "PRO" : "FREE"})
                      </Text>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontWeight: "800",
                        }}
                      >
                        Seleccionadas: {allowedCategories.length}
                      </Text>
                    </View>

                    <View style={{ height: 12 }} />

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {CATEGORIES.map((c) => {
                        const selected = selectedCategories.includes(c.id);
                        const locked = c.tier === "pro" && !isPro;

                        return (
                          <Pressable
                            key={c.id}
                            onPress={() => toggleCategory(c.id)}
                            style={({ pressed }) => [
                              {
                                paddingVertical: 10,
                                paddingHorizontal: 14,
                                borderRadius: 999,
                                marginRight: 10,
                                borderWidth: 1,
                                borderColor: selected
                                  ? "rgba(59,130,246,0.55)"
                                  : "rgba(255,255,255,0.14)",
                                backgroundColor: selected
                                  ? "rgba(59,130,246,0.20)"
                                  : "rgba(255,255,255,0.06)",
                                opacity: locked ? 0.45 : 1,
                              },
                              pressed && { opacity: 0.75 },
                            ]}
                          >
                            <Text style={{ color: "#fff", fontWeight: "900" }}>
                              {c.emoji} {c.label}{" "}
                              {c.tier === "pro"
                                ? locked
                                  ? "🔒"
                                  : "PRO"
                                : "FREE"}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    <View style={{ height: 12 }} />

                    <View style={{ flexDirection: "row" }}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Btn
                          label="Seleccionar todo"
                          onPress={selectAllAllowed}
                          variant="solid"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Btn
                          label="Limpiar"
                          onPress={clearCategories}
                          variant="ghost"
                        />
                      </View>
                    </View>

                    <Text
                      style={{
                        marginTop: 10,
                        color: "rgba(255,255,255,0.55)",
                        lineHeight: 18,
                      }}
                    >
                      Tip: si no eliges ninguna, se usarán las categorías
                      disponibles de tu plan.
                    </Text>
                  </GlassCard>
                )}

                <View style={{ height: 12 }} />

                <Btn
                  label={
                    useCustomWord ? "Palabra: Manual" : "Palabra: Aleatoria"
                  }
                  onPress={() => setUseCustomWord((v) => !v)}
                  variant="ghost"
                />

                {useCustomWord && (
                  <View style={{ marginTop: 12 }}>
                    <TextInput
                      placeholder="Categoría (ej: Lugar, Comida...)"
                      value={customCategory}
                      onChangeText={setCustomCategory}
                      placeholderTextColor="#777"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.35)",
                        color: "white",
                        padding: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                        marginBottom: 10,
                      }}
                    />
                    <TextInput
                      placeholder="Escribe la palabra secreta..."
                      value={customWord}
                      onChangeText={setCustomWord}
                      placeholderTextColor="#777"
                      style={{
                        backgroundColor: "rgba(0,0,0,0.35)",
                        color: "white",
                        padding: 12,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                      }}
                    />
                  </View>
                )}

                <View style={{ flexDirection: "row", marginTop: 14 }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Btn
                      label="Volver"
                      onPress={() => setPhase("home")}
                      variant="ghost"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Btn
                      label="Jugar"
                      onPress={startNewRound}
                      variant="action"
                      disabled={players.length < 3}
                    />
                  </View>
                </View>
              </KeyboardAvoidingView>
            )}

            {/* REVEAL: PASO 1 */}
            {phase === "reveal_pass" && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 16,
                    marginBottom: 10,
                  }}
                >
                  Turno de
                </Text>
                <BigTitle>{currentPlayer?.name || "Jugador"}</BigTitle>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    textAlign: "center",
                    marginBottom: 34,
                    paddingHorizontal: 20,
                    lineHeight: 22,
                  }}
                >
                  Asegúrate de que nadie más esté mirando la pantalla.
                </Text>
                <Btn
                  label={`SOY ${(currentPlayer?.name || "YO").toUpperCase()}`}
                  onPress={() => setPhase("reveal_secret")}
                  variant="action"
                />
              </View>
            )}

            {/* REVEAL: PASO 2 (Mantener Presionado) */}
            {phase === "reveal_secret" && (
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <View style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      textAlign: "center",
                      fontSize: 15,
                    }}
                  >
                    Hola,{" "}
                    <Text style={{ color: "white", fontWeight: "900" }}>
                      {currentPlayer?.name || "Jugador"}
                    </Text>
                  </Text>
                </View>

                <Pressable
                  onPressIn={() => {
                    setIsHoldingSecret(true);
                    Vibration.vibrate(35);
                  }}
                  onPressOut={() => setIsHoldingSecret(false)}
                  style={{
                    flex: 1,
                    marginVertical: 18,
                    borderRadius: 26,
                    backgroundColor: isHoldingSecret
                      ? isImpostor
                        ? "rgba(255,80,80,0.16)"
                        : "rgba(85,255,153,0.14)"
                      : "rgba(0,0,0,0.35)",
                    borderWidth: 2,
                    borderColor: isHoldingSecret
                      ? isImpostor
                        ? "rgba(255,80,80,0.85)"
                        : "rgba(85,255,153,0.85)"
                      : "rgba(255,255,255,0.14)",
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: isHoldingSecret
                      ? isImpostor
                        ? "#ff4d4d"
                        : "#55ff99"
                      : "#000",
                    shadowOpacity: 0.35,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 10 },
                    elevation: 10,
                  }}
                >
                  {isHoldingSecret ? (
                    <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 78, marginBottom: 18 }}>
                        {isImpostor ? "🤫" : "🗺️"}
                      </Text>

                      <Text
                        style={{
                          fontSize: 34,
                          fontWeight: "900",
                          color: isImpostor ? "#ff6b6b" : "#55ff99",
                          letterSpacing: 2,
                        }}
                      >
                        {isImpostor ? "IMPOSTOR" : "TRIPULACIÓN"}
                      </Text>

                      {!isImpostor && (
                        <View style={{ marginTop: 26, alignItems: "center" }}>
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.6)",
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: 1.2,
                            }}
                          >
                            Palabra secreta
                          </Text>
                          <Text
                            style={{
                              color: "white",
                              fontSize: 40,
                              fontWeight: "900",
                              marginTop: 6,
                              textAlign: "center",
                            }}
                          >
                            {secretWord}
                          </Text>
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.55)",
                              marginTop: 10,
                            }}
                          >
                            Categoría: {secretCategory}
                          </Text>
                        </View>
                      )}

                      {isImpostor && (
                        <Text
                          style={{
                            color: "rgba(255,140,140,0.9)",
                            marginTop: 18,
                            textAlign: "center",
                            paddingHorizontal: 30,
                            lineHeight: 20,
                          }}
                        >
                          No sabes la palabra. Engaña a todos.
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={{ alignItems: "center", opacity: 0.85 }}>
                      <Text style={{ fontSize: 58, marginBottom: 16 }}>👆</Text>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 19,
                          fontWeight: "900",
                        }}
                      >
                        MANTÉN PRESIONADO
                      </Text>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.65)",
                          marginTop: 8,
                        }}
                      >
                        para ver tu rol
                      </Text>
                    </View>
                  )}
                </Pressable>

                <View style={{ marginBottom: 10 }}>
                  <Text
                    style={{
                      textAlign: "center",
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: 12,
                      fontSize: 12,
                    }}
                  >
                    Suelta el dedo para ocultar la información al instante.
                  </Text>
                  <Btn
                    label="YA LO VI, SIGUIENTE"
                    onPress={nextReveal}
                    variant="solid"
                  />
                </View>
              </View>
            )}

            {/* DISCUSIÓN */}
            {phase === "discussion" && (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BigTitle>DEBATE</BigTitle>
                <Text
                  style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24 }}
                >
                  El tiempo corre. Descubran al mentiroso.
                </Text>

                <View
                  style={{
                    width: 220,
                    height: 220,
                    borderRadius: 110,
                    borderWidth: 4,
                    borderColor: discussionRunning
                      ? "#3b82f6"
                      : "rgba(255,255,255,0.18)",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 30,
                    backgroundColor: "rgba(0,0,0,0.25)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 70,
                      fontWeight: "900",
                      color: "white",
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {discussionRunning ? timeLeft : "0"}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.5)" }}>
                    segundos
                  </Text>
                </View>

                <View style={{ flexDirection: "row", marginBottom: 18 }}>
                  <View style={{ marginRight: 10 }}>
                    <Btn
                      label="60s"
                      disabled={discussionRunning}
                      onPress={() => {
                        setDiscussionRunning(true);
                        setDiscussionEndsAt(Date.now() + 61000);
                      }}
                      variant={discussionRunning ? "ghost" : "solid"}
                    />
                  </View>
                  <Btn
                    label="120s"
                    disabled={discussionRunning}
                    onPress={() => {
                      setDiscussionRunning(true);
                      setDiscussionEndsAt(Date.now() + 121000);
                    }}
                    variant={discussionRunning ? "ghost" : "solid"}
                  />
                </View>

                <View style={{ width: "100%", paddingHorizontal: 8 }}>
                  <Btn
                    label="VOTAR AHORA"
                    onPress={() => {
                      setVoteIndex(0);
                      setPhase("vote_pass");
                    }}
                    variant="action"
                  />
                </View>
              </View>
            )}

            {/* VOTACIÓN: PASO 1 */}
            {phase === "vote_pass" && (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
                  Turno de votar
                </Text>
                <BigTitle>
                  {roundPlayers[voteIndex]?.name || "Jugador"}
                </BigTitle>
                <View style={{ height: 34 }} />
                <Btn
                  label="ABRIR VOTACIÓN"
                  onPress={() => setPhase("vote_pick")}
                  variant="action"
                />
              </View>
            )}

            {/* VOTACIÓN: PASO 2 */}
            {phase === "vote_pick" && (
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    textAlign: "center",
                    marginTop: 6,
                  }}
                >
                  Votando como:{" "}
                  <Text style={{ color: "white", fontWeight: "900" }}>
                    {roundPlayers[voteIndex]?.name || "Jugador"}
                  </Text>
                </Text>

                <BigTitle>¿Quién es el impostor?</BigTitle>

                <FlatList
                  style={{ marginTop: 14 }}
                  data={[
                    ...roundPlayers.filter(
                      (p) => p.id !== roundPlayers[voteIndex]?.id
                    ),
                    { id: "skip", name: "Salvar / No sé" },
                  ]}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => vote(item.id as any)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.10)",
                        padding: 18,
                        marginBottom: 10,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 22, marginRight: 12 }}>
                        {item.id === "skip" ? "🏳️" : "👉"}
                      </Text>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 18,
                          fontWeight: "900",
                        }}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* RESULTADOS */}
            {phase === "results" &&
              (() => {
                const voteMap = new Map<string, number>();
                votes.forEach((v) =>
                  voteMap.set(v.targetId, (voteMap.get(v.targetId) || 0) + 1)
                );

                let topId: string | null = null;
                let maxVotes = -1;
                let tie = false;

                voteMap.forEach((count, id) => {
                  if (count > maxVotes) {
                    maxVotes = count;
                    topId = id;
                    tie = false;
                  } else if (count === maxVotes) tie = true;
                });

                const caught = !tie && topId === impostorId;
                const skipped = topId === "skip";
                const impostorName = roundPlayers.find(
                  (p) => p.id === impostorId
                )?.name;

                return (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 80, marginBottom: 10 }}>
                      {caught ? "🎉" : "💀"}
                    </Text>

                    <BigTitle>
                      {tie
                        ? "EMPATE"
                        : skipped
                        ? "NADIE FUE EXPULSADO"
                        : caught
                        ? "IMPOSTOR ATRAPADO"
                        : "INOCENTE EXPULSADO"}
                    </BigTitle>

                    <View
                      style={{
                        backgroundColor: caught
                          ? "rgba(85,255,153,0.14)"
                          : "rgba(255,80,80,0.16)",
                        padding: 18,
                        borderRadius: 20,
                        width: "100%",
                        alignItems: "center",
                        marginVertical: 18,
                        borderWidth: 1,
                        borderColor: caught
                          ? "rgba(85,255,153,0.35)"
                          : "rgba(255,80,80,0.35)",
                      }}
                    >
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.65)",
                          fontWeight: "800",
                        }}
                      >
                        El impostor era:
                      </Text>
                      <Text
                        style={{
                          color: "white",
                          fontSize: 32,
                          fontWeight: "900",
                          marginTop: 6,
                        }}
                      >
                        {impostorName || "—"}
                      </Text>
                    </View>

                    <Text
                      style={{ color: "rgba(255,255,255,0.75)", fontSize: 15 }}
                    >
                      Palabra secreta:{" "}
                      <Text style={{ color: "white", fontWeight: "900" }}>
                        {secretWord}
                      </Text>
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 26,
                        width: "100%",
                      }}
                    >
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Btn
                          label="Inicio"
                          onPress={() => setPhase("home")}
                          variant="ghost"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Btn
                          label="Jugar Otra Vez"
                          onPress={startNewRound}
                          variant="action"
                        />
                      </View>
                    </View>
                  </View>
                );
              })()}
          </View>
        </SafeAreaView>
      </ScreenBackground>
    </View>
  );
}
