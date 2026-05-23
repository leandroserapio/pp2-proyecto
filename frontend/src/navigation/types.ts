import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Gasto, Viaje } from '../types/models';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type GastosStackParamList = {
  GastosHome: undefined;
  GastosAdd: { idMoto?: number } | undefined;
  GastosDetail: { item: GastoListNavItem };
  GastosEdit: { item: GastoListNavItem };
};

export type GastoListNavItem = Gasto & {
  idMoto: number;
  motoLabel: string;
};

export type ViajesStackParamList = {
  ViajesHome: undefined;
  ViajesAdd: { idMoto?: number } | undefined;
  ViajesDetail: { item: ViajeListNavItem };
  ViajesEdit: { item: ViajeListNavItem };
};

export type ViajeListNavItem = Viaje & {
  idMoto: number;
  motoLabel: string;
};

export type MainTabParamList = {
  Inicio: undefined;
  Garage: undefined;
  GastosStack: undefined;
  Mantenimiento: undefined;
  ViajesStack: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Cuenta: undefined;
  Ajustes: undefined;
};

export type GastosHomeProps = NativeStackScreenProps<GastosStackParamList, 'GastosHome'>;
export type GastosAddProps = NativeStackScreenProps<GastosStackParamList, 'GastosAdd'>;
export type GastosDetailProps = NativeStackScreenProps<GastosStackParamList, 'GastosDetail'>;
export type GastosEditProps = NativeStackScreenProps<GastosStackParamList, 'GastosEdit'>;
export type ViajesHomeProps = NativeStackScreenProps<ViajesStackParamList, 'ViajesHome'>;
export type ViajesAddProps = NativeStackScreenProps<ViajesStackParamList, 'ViajesAdd'>;
export type ViajesDetailProps = NativeStackScreenProps<ViajesStackParamList, 'ViajesDetail'>;
export type ViajesEditProps = NativeStackScreenProps<ViajesStackParamList, 'ViajesEdit'>;
