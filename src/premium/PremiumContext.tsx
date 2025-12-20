import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Features = {
  adsDisabled: boolean;
  hotWords: boolean;
  customWords: boolean;
  premiumBackgrounds: boolean;
  extraModes: boolean;
};

type PremiumContextValue = {
  isPremium: boolean;
  loading: boolean;
  features: Features;
  purchaseMonthly: () => Promise<void>;
  purchaseYearly: () => Promise<void>;
  restore: () => Promise<void>;
  refresh: () => Promise<void>;
  // solo para dev (no lo muestres a usuarios finales)
  devTogglePremium: () => Promise<void>;
};

const STORAGE_KEY = "@noche_premium_fallback_v1";

// 🔥 IDs reales (cuando conectes IAP)
// iOS/Android deben ser los IDs de tus productos en stores / RevenueCat
const PRODUCT_MONTHLY = "noche_premium_monthly";
const PRODUCT_YEARLY = "noche_premium_yearly";

const PremiumContext = createContext<PremiumContextValue | null>(null);

function buildFeatures(isPremium: boolean): Features {
  return {
    adsDisabled: isPremium,
    hotWords: isPremium,
    customWords: isPremium,
    premiumBackgrounds: isPremium,
    extraModes: isPremium,
  };
}

/**
 * Intenta cargar react-native-purchases (RevenueCat).
 * Si no existe, usamos fallback local para que la app no explote.
 */
async function getPurchasesModule(): Promise<any | null> {
  try {
    const mod = await import("react-native-purchases");
    return mod?.default ?? mod;
  } catch {
    return null;
  }
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasNativeIAP, setHasNativeIAP] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const Purchases = await getPurchasesModule();

      // ✅ Si tenemos módulo nativo, aquí vas a conectar RevenueCat real.
      if (Purchases) {
        setHasNativeIAP(true);

        // ⚠️ IMPORTANTÍSIMO:
        // Debes configurar Purchases con tu API Key de RevenueCat en producción.
        // Ejemplo:
        // Purchases.configure({ apiKey: "public_sdk_key" });

        // Y luego:
        // const customerInfo = await Purchases.getCustomerInfo();
        // const active = Boolean(customerInfo?.entitlements?.active?.premium);

        // Mientras no configures, no rompemos:
        // Intentamos leer un “flag” fallback para que puedas probar UI.
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setIsPremium(raw === "1");
      } else {
        setHasNativeIAP(false);
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        setIsPremium(raw === "1");
      }
    } catch {
      // fallback
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setIsPremium(raw === "1");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const purchase = async (productId: string) => {
    const Purchases = await getPurchasesModule();

    if (!Purchases) {
      // fallback (para que puedas avanzar con UI en Expo Go / sin EAS)
      await AsyncStorage.setItem(STORAGE_KEY, "1");
      setIsPremium(true);
      return;
    }

    // ✅ Aquí va la compra real cuando conectes RevenueCat:
    // 1) Purchases.getOfferings()
    // 2) elegir package monthly/yearly
    // 3) Purchases.purchasePackage(package)
    //
    // Por ahora dejamos fallback “soft” para no bloquearte:
    await AsyncStorage.setItem(STORAGE_KEY, "1");
    setIsPremium(true);
  };

  const purchaseMonthly = async () => purchase(PRODUCT_MONTHLY);
  const purchaseYearly = async () => purchase(PRODUCT_YEARLY);

  const restore = async () => {
    const Purchases = await getPurchasesModule();
    if (!Purchases) {
      // fallback: nada que restaurar real
      await refresh();
      return;
    }

    // ✅ Real (cuando conectes):
    // const info = await Purchases.restorePurchases();
    // const active = Boolean(info?.entitlements?.active?.premium);
    // setIsPremium(active);

    await refresh();
  };

  const devTogglePremium = async () => {
    if (!__DEV__) return;
    const next = !isPremium;
    await AsyncStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    setIsPremium(next);
  };

  const value = useMemo<PremiumContextValue>(() => {
    return {
      isPremium,
      loading,
      features: buildFeatures(isPremium),
      purchaseMonthly,
      purchaseYearly,
      restore,
      refresh,
      devTogglePremium,
    };
  }, [isPremium, loading]);

  return (
    <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
  );
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error("usePremium must be used within PremiumProvider");
  return ctx;
}
