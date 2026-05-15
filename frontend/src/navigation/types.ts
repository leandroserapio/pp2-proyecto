import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Gasto } from '../types/models';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type GastosStackParamList = {
  GastosHome: undefined;
  GastosAdd: { idMoto?: number } | undefined;
  GastosDetail: { item: GastoListNavItem };
};

export type GastoListNavItem = Gasto & {
  idMoto: number;
  motoLabel: string;
};

export type MainTabParamList = {
  Garage: undefined;
  GastosStack: undefined;
  Mantenimiento: undefined;
  Viajes: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type GastosHomeProps = NativeStackScreenProps<GastosStackParamList, 'GastosHome'>;
export type GastosAddProps = NativeStackScreenProps<GastosStackParamList, 'GastosAdd'>;
export type GastosDetailProps = NativeStackScreenProps<GastosStackParamList, 'GastosDetail'>;
