import React, { useEffect, useState } from "react";
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
} from "react-native";

import ScreenBackground from "../components/ScreenBackground";

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
type Word = { category: string; word: string };
type VoteChoice = { voterId: string; targetId: string | "skip" };

/* ===================== Banco de Palabras ===================== */
const WORD_BANK: Word[] = [
  { category: "Comida", word: "Hamburguesa" },
  { category: "Comida", word: "Sushi" },
  { category: "Comida", word: "Pizza" },
  { category: "Comida", word: "Tacos" },
  { category: "Lugar", word: "Hospital" },
  { category: "Lugar", word: "Cementerio" },
  { category: "Lugar", word: "Escuela" },
  { category: "Lugar", word: "Cine" },
  { category: "Animal", word: "Jirafa" },
  { category: "Animal", word: "Pingüino" },
  { category: "Animal", word: "Tiburón" },
  { category: "Animal", word: "Elefante" },
  { category: "Objeto", word: "Paraguas" },
  { category: "Objeto", word: "Espejo" },
  { category: "Profesión", word: "Astronauta" },
  { category: "Profesión", word: "Bombero" },
  { category: "Profesión", word: "Payaso" },
  { category: "Profesión", word: "Cirujano" },
  { category: "Transporte", word: "Submarino" },
  { category: "Transporte", word: "Avión" },
  { category: "Cine", word: "Titanic" },
  { category: "Cine", word: "Harry Potter" },
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
function pickRandomWord(): Word {
  return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
}
function sanitizeName(s: string) {
  return s.trim().replace(/\s+/g, " ").slice(0, 18);
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

  // Ronda
  const [roundPlayers, setRoundPlayers] = useState<Player[]>([]);
  const [impostorId, setImpostorId] = useState<string>("");
  const [secret, setSecret] = useState<Word | null>(null);

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
      // Si estás en el home interno del juego, deja que vuelva a la pantalla anterior (HomeScreen)
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

    const w: Word = useCustomWord
      ? {
          category: (customCategory.trim() || "General").slice(0, 18),
          word: (customWord.trim() || "Secreto").slice(0, 28),
        }
      : pickRandomWord();

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

  /* ===================== Revelación ===================== */
  const currentPlayer = roundPlayers[revealIndex];
  const isImpostor = currentPlayer?.id === impostorId;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />

      <ScreenBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 20 }}>
            {/* Barra superior (salir + ajustes) */}
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

                <View
                  style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}
                >
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

                <View style={{ gap: 10, marginTop: 10 }}>
                  <Btn
                    label={
                      useCustomWord ? "Palabra: Manual" : "Palabra: Aleatoria"
                    }
                    onPress={() => setUseCustomWord((v) => !v)}
                    variant="ghost"
                  />

                  {useCustomWord && (
                    <View style={{ gap: 10 }}>
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

                  <View
                    style={{ flexDirection: "row", gap: 10, marginTop: 10 }}
                  >
                    <View style={{ flex: 1 }}>
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
                <BigTitle>{currentPlayer?.name}</BigTitle>
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
                  label={`SOY ${currentPlayer?.name?.toUpperCase() || "YO"}`}
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
                      {currentPlayer?.name}
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
                            {secret?.word}
                          </Text>
                          <Text
                            style={{
                              color: "rgba(255,255,255,0.55)",
                              marginTop: 10,
                            }}
                          >
                            Categoría: {secret?.category}
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

                <View
                  style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}
                >
                  <Btn
                    label="60s"
                    disabled={discussionRunning}
                    onPress={() => {
                      setDiscussionRunning(true);
                      setDiscussionEndsAt(Date.now() + 61000);
                    }}
                    variant={discussionRunning ? "ghost" : "solid"}
                  />
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
                <BigTitle>{roundPlayers[voteIndex]?.name}</BigTitle>
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
                    {roundPlayers[voteIndex]?.name}
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
                        {secret?.word}
                      </Text>
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        marginTop: 26,
                        width: "100%",
                      }}
                    >
                      <View style={{ flex: 1 }}>
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
