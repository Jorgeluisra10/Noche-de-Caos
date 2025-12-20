import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import type { Lang } from "../i18n/strings";
import { STRINGS } from "../i18n/strings";

export type BackgroundId =
  | "bg_home_image"
  | "bg_chaos_gradient"
  | "bg_midnight";

type SettingsState = {
  language: Lang;
  musicEnabled: boolean;
  musicVolume: number; // 0..1
  backgroundId: BackgroundId;
};

type SettingsContextValue = {
  state: SettingsState;
  setLanguage: (lang: Lang) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setBackgroundId: (id: BackgroundId) => void;
  t: (key: string) => string;
};

const STORAGE_KEY = "@noche_settings_v2";

// ✅ Ajusta esta ruta si cambias el nombre o ubicación del mp3
const BG_MUSIC = require("../../assets/audio/bg-music.mp3");

const DEFAULTS: SettingsState = {
  language: "es",
  musicEnabled: true,
  musicVolume: 0.6,
  backgroundId: "bg_home_image",
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SettingsState>(DEFAULTS);

  const soundRef = useRef<Audio.Sound | null>(null);
  const loadingRef = useRef(false);

  // Load persisted settings once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<SettingsState>;
          setState((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // defaults
      }
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  // Prepare audio mode once (compatible con varias versiones de expo-av)
  useEffect(() => {
    const A: any = Audio as any;

    const mode: any = {
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    };

    if (A?.InterruptionModeIOS?.DuckOthers != null) {
      mode.interruptionModeIOS = A.InterruptionModeIOS.DuckOthers;
    } else if (A?.INTERRUPTION_MODE_IOS_DUCK_OTHERS != null) {
      mode.interruptionModeIOS = A.INTERRUPTION_MODE_IOS_DUCK_OTHERS;
    }

    if (A?.InterruptionModeAndroid?.DuckOthers != null) {
      mode.interruptionModeAndroid = A.InterruptionModeAndroid.DuckOthers;
    } else if (A?.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS != null) {
      mode.interruptionModeAndroid = A.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS;
    }

    Audio.setAudioModeAsync(mode).catch(() => {});
  }, []);

  // Background music controller
  useEffect(() => {
    (async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        if (!state.musicEnabled) {
          if (soundRef.current) {
            try {
              await soundRef.current.stopAsync();
            } catch {}
            try {
              await soundRef.current.unloadAsync();
            } catch {}
            soundRef.current = null;
          }
          return;
        }

        if (!soundRef.current) {
          const { sound } = await Audio.Sound.createAsync(BG_MUSIC, {
            isLooping: true,
            volume: state.musicVolume,
            shouldPlay: true,
          });
          soundRef.current = sound;
        } else {
          await soundRef.current.setVolumeAsync(state.musicVolume);
          const status = await soundRef.current.getStatusAsync();
          if ("isLoaded" in status && status.isLoaded && !status.isPlaying) {
            await soundRef.current.playAsync();
          }
        }
      } catch {
        // no rompemos la app
      } finally {
        loadingRef.current = false;
      }
    })();
  }, [state.musicEnabled, state.musicVolume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const s = soundRef.current;
      soundRef.current = null;
      if (s) s.unloadAsync().catch(() => {});
    };
  }, []);

  const api = useMemo<SettingsContextValue>(() => {
    return {
      state,
      setLanguage: (language) => setState((p) => ({ ...p, language })),
      setMusicEnabled: (musicEnabled) =>
        setState((p) => ({ ...p, musicEnabled })),
      setMusicVolume: (musicVolume) =>
        setState((p) => ({
          ...p,
          musicVolume: Math.max(0, Math.min(1, musicVolume)),
        })),
      setBackgroundId: (backgroundId) =>
        setState((p) => ({ ...p, backgroundId })),
      t: (key) => STRINGS[state.language]?.[key] ?? STRINGS.es[key] ?? key,
    };
  }, [state]);

  return (
    <SettingsContext.Provider value={api}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
