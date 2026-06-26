import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Gasto, Mantenimiento, Viaje } from '../types/models';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type GastosStackParamList = {
  GastosHome: { openAdd?: boolean; idMoto?: number } | undefined;
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

export type HomeStackParamList = {
  Home: undefined;
  Cuenta: undefined;
};

export type MotosStackParamList = {
  MisMotosHome: undefined;
  MisMotosEdit: { idMoto: number };
};

export type MantenimientoListNavItem = Mantenimiento & {
  idMoto: number;
};

export type MantenimientoStackParamList = {
  MantenimientoHome: { openAdd?: boolean } | undefined;
  MantenimientoEdit: { item: MantenimientoListNavItem };
};

export type MainTabParamList = {
  Inicio: NavigatorScreenParams<HomeStackParamList> | undefined;
  Recordatorios: { hideTabBar?: boolean } | undefined;
  GastosStack: { hideTabBar?: boolean } | NavigatorScreenParams<GastosStackParamList> | undefined;
  MantenimientoStack: { hideTabBar?: boolean } | NavigatorScreenParams<MantenimientoStackParamList> | undefined;
  ViajesStack: NavigatorScreenParams<ViajesStackParamList> | undefined;
  MotosStack: NavigatorScreenParams<MotosStackParamList> | undefined;
  Ajustes: undefined;
};


export type RootStackParamList = {

  Auth: undefined;

  Main: NavigatorScreenParams<MainTabParamList> | undefined;

};

export type GastosHomeProps = NativeStackScreenProps<GastosStackParamList, 'GastosHome'>;
export type GastosDetailProps = NativeStackScreenProps<GastosStackParamList, 'GastosDetail'>;
export type GastosEditProps = NativeStackScreenProps<GastosStackParamList, 'GastosEdit'>;
export type ViajesHomeProps = NativeStackScreenProps<ViajesStackParamList, 'ViajesHome'>;
export type ViajesAddProps = NativeStackScreenProps<ViajesStackParamList, 'ViajesAdd'>;
export type ViajesDetailProps = NativeStackScreenProps<ViajesStackParamList, 'ViajesDetail'>;
export type ViajesEditProps = NativeStackScreenProps<ViajesStackParamList, 'ViajesEdit'>;
export type MisMotosHomeProps = NativeStackScreenProps<MotosStackParamList, 'MisMotosHome'>;
export type MisMotosEditProps = NativeStackScreenProps<MotosStackParamList, 'MisMotosEdit'>;
export type MantenimientoHomeProps = NativeStackScreenProps<MantenimientoStackParamList, 'MantenimientoHome'>;
export type MantenimientoEditProps = NativeStackScreenProps<MantenimientoStackParamList, 'MantenimientoEdit'>;
