import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Moto } from '../types/models';
import { eliminarMoto as apiEliminarMoto, listarMotosPorUsuario } from '../api/motos';

const STORAGE_SELECTED_MOTO = '@mototracker/selectedMotoId';

type MotoContextValue = {
  motos: Moto[];
  selectedMotoId: number | null;
  selectedMoto: Moto | null;
  loading: boolean;
  error: string | null;
  refreshMotos: () => Promise<void>;
  setSelectedMotoId: (id: number) => Promise<void>;
  eliminarMoto: (idMoto: number) => Promise<void>;
};

const MotoContext = createContext<MotoContextValue | null>(null);

type Props = PropsWithChildren<{ idUsuario: number }>;

export function MotoProvider({ idUsuario, children }: Props) {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [selectedMotoId, setSelectedMotoIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listarMotosPorUsuario(idUsuario);
      setMotos(list);
      if (list.length === 0) {
        await AsyncStorage.removeItem(STORAGE_SELECTED_MOTO);
        setSelectedMotoIdState(null);
        return;
      }
      const raw = await AsyncStorage.getItem(STORAGE_SELECTED_MOTO);
      const storedId = raw ? Number(raw) : NaN;
      const storedOk = Number.isFinite(storedId) && list.some((m) => m.idMoto === storedId);
      const nextId = storedOk ? storedId : (list[0].idMoto as number);
      setSelectedMotoIdState(nextId);
      await AsyncStorage.setItem(STORAGE_SELECTED_MOTO, String(nextId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las motos');
    } finally {
      setLoading(false);
    }
  }, [idUsuario]);

  useEffect(() => {
    void refreshMotos();
  }, [refreshMotos]);

  const setSelectedMotoId = useCallback(async (id: number) => {
    setSelectedMotoIdState(id);
    await AsyncStorage.setItem(STORAGE_SELECTED_MOTO, String(id));
  }, []);

  const eliminarMoto = useCallback(
    async (idMoto: number) => {
      await apiEliminarMoto(idMoto);
      await refreshMotos();
    },
    [refreshMotos],
  );

  const selectedMoto = useMemo(
    () => motos.find((m) => m.idMoto === selectedMotoId) ?? null,
    [motos, selectedMotoId],
  );

  const value = useMemo(
    () => ({
      motos,
      selectedMotoId,
      selectedMoto,
      loading,
      error,
      refreshMotos,
      setSelectedMotoId,
      eliminarMoto,
    }),
    [motos, selectedMotoId, selectedMoto, loading, error, refreshMotos, setSelectedMotoId, eliminarMoto],
  );

  return <MotoContext.Provider value={value}>{children}</MotoContext.Provider>;
}

export function useMoto(): MotoContextValue {
  const ctx = useContext(MotoContext);
  if (!ctx) throw new Error('useMoto debe usarse dentro de MotoProvider');
  return ctx;
}
