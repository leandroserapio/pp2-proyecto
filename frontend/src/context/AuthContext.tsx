import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginRequest, LoginResponse, UsuarioInput } from '../types/models';
import { login as apiLogin, obtenerUsuario, registrarUsuario } from '../api/usuarios';

const STORAGE_SESSION = '@mototracker/session';

export type SessionUser = LoginResponse;

type AuthContextValue = {
  user: SessionUser | null;
  bootstrapping: boolean;
  pendingMotoSetup: boolean;
  consumePendingMotoSetup: () => void;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: UsuarioInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [pendingMotoSetup, setPendingMotoSetup] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_SESSION);
        if (raw && !cancelled) {
          const stored = JSON.parse(raw) as SessionUser;
          const fresh = await obtenerUsuario(stored.idUsuario);
          if (!cancelled) {
            setUser(fresh);
            await AsyncStorage.setItem(STORAGE_SESSION, JSON.stringify(fresh));
          }
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_SESSION);
        await AsyncStorage.removeItem('@mototracker/selectedMotoId');
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: SessionUser | null) => {
    if (next) {
      await AsyncStorage.setItem(STORAGE_SESSION, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(STORAGE_SESSION);
    }
  }, []);

  const login = useCallback(
    async (req: LoginRequest) => {
      const res = await apiLogin(req);
      setUser(res);
      setPendingMotoSetup(false);
      await persist(res);
    },
    [persist],
  );

  const register = useCallback(
    async (req: UsuarioInput) => {
      await registrarUsuario(req);
      const res = await apiLogin({ email: req.email, password: req.password });
      setUser(res);
      setPendingMotoSetup(true);
      await persist(res);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setPendingMotoSetup(false);
    await persist(null);
    await AsyncStorage.removeItem('@mototracker/selectedMotoId');
  }, [persist]);

  const consumePendingMotoSetup = useCallback(() => {
    setPendingMotoSetup(false);
  }, []);

  const value = useMemo(
    () => ({ user, bootstrapping, pendingMotoSetup, consumePendingMotoSetup, login, register, logout }),
    [user, bootstrapping, pendingMotoSetup, consumePendingMotoSetup, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
