import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
  Vibration,
  KeyboardAvoidingView,
  StatusBar,
  BackHandler,
  Alert,
  TouchableOpacity,
} from "react-native";
import type { DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/* ===================== Configuración ===================== */
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
  | "reveal_pass" // Pantalla "Pásale el cel a Juan"
  | "reveal_secret" // Pantalla "Mantén para ver"
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
  style?: object;
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
      <Text style={{ fontSize: 17, fontWeight: "700", color: "white" }}>
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

/* ===================== App Principal ===================== */
export default function App() {
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

  // Lógica de "Mantener presionado"
  const [isHoldingSecret, setIsHoldingSecret] = useState(false);

  // Timer Discussion
  const [discussionEndsAt, setDiscussionEndsAt] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [discussionRunning, setDiscussionRunning] = useState(false);

  // Back Handler
  useEffect(() => {
    const backAction = () => {
      if (phase === "home") return false;
      Alert.alert("¿Salir?", "Se perderá el progreso.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: () => setPhase("home"),
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

  // Timer Effect
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
  const startNewRound = (keep: boolean) => {
    const pList = keep ? players : players;
    if (pList.length < 3) {
      Alert.alert("Error", "Mínimo 3 jugadores.");
      return;
    }

    // Preparar jugadores y roles
    const rp = shuffle([...pList]);
    const imp = rp[Math.floor(Math.random() * rp.length)].id;
    const w = useCustomWord
      ? { category: customCategory || "General", word: customWord || "Secreto" }
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
    if (newName.trim().length < 2) return;
    setPlayers([...players, { id: uid(), name: newName.trim() }]);
    setNewName("");
  };

  const nextReveal = () => {
    if (revealIndex + 1 < roundPlayers.length) {
      setRevealIndex(revealIndex + 1);
      setPhase("reveal_pass");
    } else {
      setPhase("discussion");
    }
  };

  const vote = (targetId: string | "skip") => {
    const voter = roundPlayers[voteIndex];
    setVotes([
      ...votes.filter((v) => v.voterId !== voter.id),
      { voterId: voter.id, targetId },
    ]);

    if (voteIndex + 1 < roundPlayers.length) {
      setVoteIndex(voteIndex + 1);
      setPhase("vote_pass");
    } else {
      setPhase("results");
    }
  };

  /* ===================== Componente de Revelación (EL IMPORTANTE) ===================== */
  const currentPlayer = roundPlayers[revealIndex];
  const isImpostor = currentPlayer?.id === impostorId;

  return (
    <View style={{ flex: 1, backgroundColor: "#080808" }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f0f1a"]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 20 }}>
          {/* HOME */}
          {phase === "home" && (
            <View style={{ flex: 1, justifyContent: "center" }}>
              <BigTitle>NOCHE DE CAOS</BigTitle>
              <Text
                style={{
                  textAlign: "center",
                  color: "#aaa",
                  marginBottom: 40,
                  fontSize: 16,
                }}
              >
                Descubre al impostor antes de que sea tarde.
              </Text>
              <GlassCard>
                <Btn
                  label="JUEGO RÁPIDO (3 Jugadores)"
                  onPress={() => startNewRound(true)}
                  variant="action"
                />
                <View style={{ height: 15 }} />
                <Btn
                  label="Configurar Jugadores"
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
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "white",
                  marginBottom: 10,
                }}
              >
                Jugadores ({players.length})
              </Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Nombre..."
                  placeholderTextColor="#666"
                  style={{
                    flex: 1,
                    backgroundColor: "#222",
                    color: "white",
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: "#333",
                  }}
                />
                <Btn
                  label="+"
                  onPress={addPlayer}
                  variant="action"
                  disabled={newName.length < 2}
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
                      padding: 15,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      marginBottom: 8,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 16 }}>
                      {item.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setPlayers(players.filter((p) => p.id !== item.id))
                      }
                    >
                      <Text style={{ color: "#ff5555" }}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
              <View style={{ gap: 10, marginTop: 10 }}>
                <Btn
                  label={
                    useCustomWord ? "Palabra: Manual" : "Palabra: Aleatoria"
                  }
                  onPress={() => setUseCustomWord(!useCustomWord)}
                  variant="ghost"
                />
                {useCustomWord && (
                  <TextInput
                    placeholder="Escribe la palabra secreta..."
                    value={customWord}
                    onChangeText={setCustomWord}
                    placeholderTextColor="#555"
                    style={{
                      backgroundColor: "#222",
                      color: "white",
                      padding: 12,
                      borderRadius: 12,
                    }}
                  />
                )}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
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
                      onPress={() => startNewRound(true)}
                      variant="action"
                      disabled={players.length < 3}
                    />
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          )}

          {/* REVEAL: PASO 1 (Identificación) */}
          {phase === "reveal_pass" && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#888", fontSize: 18, marginBottom: 10 }}>
                Turno de
              </Text>
              <BigTitle>{currentPlayer?.name}</BigTitle>
              <Text
                style={{
                  color: "#aaa",
                  textAlign: "center",
                  marginBottom: 40,
                  paddingHorizontal: 20,
                }}
              >
                Asegúrate de que nadie más esté mirando la pantalla.
              </Text>
              <Btn
                label={`SOY ${currentPlayer?.name?.toUpperCase()}`}
                onPress={() => setPhase("reveal_secret")}
                variant="action"
              />
            </View>
          )}

          {/* REVEAL: PASO 2 (Mantener Presionado - CORREGIDO) */}
          {phase === "reveal_secret" && (
            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{ color: "#aaa", textAlign: "center", fontSize: 16 }}
                >
                  Hola,{" "}
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {currentPlayer?.name}
                  </Text>
                </Text>
              </View>

              {/* ÁREA DE TOQUE GIGANTE */}
              <Pressable
                onPressIn={() => {
                  setIsHoldingSecret(true);
                  Vibration.vibrate(50); // Feedback inmediato
                }}
                onPressOut={() => {
                  setIsHoldingSecret(false);
                }}
                style={{
                  flex: 1,
                  marginVertical: 20,
                  borderRadius: 24,
                  backgroundColor: isHoldingSecret
                    ? isImpostor
                      ? "#3f1a1a"
                      : "#1a3f30" // Fondo Rojo si es impostor, Verde si no
                    : "#222",
                  borderWidth: 2,
                  borderColor: isHoldingSecret
                    ? isImpostor
                      ? "#ff5555"
                      : "#55ff99"
                    : "#444",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: isHoldingSecret
                    ? isImpostor
                      ? "red"
                      : "green"
                    : "black",
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                }}
              >
                {isHoldingSecret ? (
                  // CONTENIDO REVELADO
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 80, marginBottom: 20 }}>
                      {isImpostor ? "🤫" : "🗺️"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 36,
                        fontWeight: "900",
                        color: isImpostor ? "#ff5555" : "#55ff99",
                        letterSpacing: 2,
                      }}
                    >
                      {isImpostor ? "IMPOSTOR" : "TRIPULACIÓN"}
                    </Text>

                    {!isImpostor && (
                      <View style={{ marginTop: 30, alignItems: "center" }}>
                        <Text
                          style={{
                            color: "#aaa",
                            fontSize: 14,
                            textTransform: "uppercase",
                            letterSpacing: 1,
                          }}
                        >
                          Palabra Secreta
                        </Text>
                        <Text
                          style={{
                            color: "white",
                            fontSize: 42,
                            fontWeight: "bold",
                            marginTop: 5,
                          }}
                        >
                          {secret?.word}
                        </Text>
                        <Text style={{ color: "#888", marginTop: 10 }}>
                          Categoría: {secret?.category}
                        </Text>
                      </View>
                    )}

                    {isImpostor && (
                      <Text
                        style={{
                          color: "#ffaaaa",
                          marginTop: 20,
                          textAlign: "center",
                          paddingHorizontal: 30,
                        }}
                      >
                        No sabes la palabra. Engaña a todos.
                      </Text>
                    )}
                  </View>
                ) : (
                  // ESTADO OCULTO
                  <View style={{ alignItems: "center", opacity: 0.5 }}>
                    <Text style={{ fontSize: 60, marginBottom: 20 }}>👆</Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      MANTÉN PRESIONADO
                    </Text>
                    <Text style={{ color: "#aaa", marginTop: 10 }}>
                      para ver tu rol
                    </Text>
                  </View>
                )}
              </Pressable>

              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#666",
                    marginBottom: 15,
                    fontSize: 12,
                  }}
                >
                  Suelta el dedo para ocultar la información inmediatamente.
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
              <Text style={{ color: "#aaa", marginBottom: 30 }}>
                El tiempo corre. Descubran al mentiroso.
              </Text>

              <View
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  borderWidth: 4,
                  borderColor: discussionRunning ? "#3b82f6" : "#333",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 40,
                }}
              >
                <Text
                  style={{
                    fontSize: 70,
                    fontWeight: "bold",
                    color: "white",
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {discussionRunning ? timeLeft : "0"}
                </Text>
                <Text style={{ color: "#666" }}>segundos</Text>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                <Btn
                  label="60s"
                  onPress={() => {
                    setDiscussionRunning(true);
                    setDiscussionEndsAt(Date.now() + 61000);
                  }}
                  variant={discussionRunning ? "ghost" : "solid"}
                />
                <Btn
                  label="120s"
                  onPress={() => {
                    setDiscussionRunning(true);
                    setDiscussionEndsAt(Date.now() + 121000);
                  }}
                  variant={discussionRunning ? "ghost" : "solid"}
                />
              </View>

              <View style={{ width: "100%", paddingHorizontal: 20 }}>
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

          {/* VOTACIÓN: PASO 1 (Pase) */}
          {phase === "vote_pass" && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#888", fontSize: 18 }}>
                Turno de votar
              </Text>
              <BigTitle>{roundPlayers[voteIndex]?.name}</BigTitle>
              <View style={{ height: 40 }} />
              <Btn
                label="ABRIR VOTACIÓN"
                onPress={() => setPhase("vote_pick")}
                variant="action"
              />
            </View>
          )}

          {/* VOTACIÓN: PASO 2 (Elección) */}
          {phase === "vote_pick" && (
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#aaa", textAlign: "center", marginTop: 20 }}
              >
                Votando como:{" "}
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {roundPlayers[voteIndex]?.name}
                </Text>
              </Text>
              <BigTitle>¿Quién es el impostor?</BigTitle>
              <FlatList
                style={{ marginTop: 20 }}
                data={[
                  ...roundPlayers.filter(
                    (p) => p.id !== roundPlayers[voteIndex].id
                  ),
                  { id: "skip", name: "Salvar / No sé" },
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => vote(item.id)}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      padding: 20,
                      marginBottom: 10,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 24, marginRight: 15 }}>
                      {item.id === "skip" ? "🏳️" : "👉"}
                    </Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 18,
                        fontWeight: "bold",
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
              // Calcular resultados
              const voteMap = new Map();
              votes.forEach((v) =>
                voteMap.set(v.targetId, (voteMap.get(v.targetId) || 0) + 1)
              );
              let topId = null,
                maxVotes = -1,
                tie = false;
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
                      backgroundColor: caught ? "#1a3f30" : "#3f1a1a",
                      padding: 20,
                      borderRadius: 20,
                      width: "100%",
                      alignItems: "center",
                      marginVertical: 20,
                    }}
                  >
                    <Text style={{ color: "#aaa" }}>El impostor era:</Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 32,
                        fontWeight: "900",
                      }}
                    >
                      {impostorName}
                    </Text>
                  </View>

                  <Text style={{ color: "#aaa", fontSize: 16 }}>
                    Palabra secreta:{" "}
                    <Text style={{ color: "white" }}>{secret?.word}</Text>
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      marginTop: 40,
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
                        onPress={() => startNewRound(true)}
                        variant="action"
                      />
                    </View>
                  </View>
                </View>
              );
            })()}
        </View>
      </SafeAreaView>
    </View>
  );
}

