import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CHANNEL_ID = 'mototracker-reminders';
export const KILOMETERS_REMINDER_ID = 'mototracker-kilometers-reminder';
const KILOMETERS_REMINDER_INTERVAL_HOURS = 48;
const KILOMETERS_REMINDER_INTERVAL_SECONDS =
  KILOMETERS_REMINDER_INTERVAL_HOURS * 60 * 60;

export type RecordatorioMotoTipo =
  | 'cambio_aceite'
  | 'service'
  | 'seguro'
  | 'patente'
  | 'viaje';

export type RecordatorioPorFecha = {
  id: string;
  fecha: Date;
  mensaje: string;
  titulo?: string;
  tipo?: RecordatorioMotoTipo;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function configurarCanalAndroid() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Recordatorios MotoTracker',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function solicitarPermisosNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const permisosActuales = await Notifications.getPermissionsAsync();
  let estado = permisosActuales.status;

  if (estado !== 'granted') {
    const permisosSolicitados = await Notifications.requestPermissionsAsync();
    estado = permisosSolicitados.status;
  }

  const permitido = estado === 'granted';

  if (permitido) {
    await configurarCanalAndroid();
  }

  return permitido;
}

export async function programarRecordatorioKilometros(): Promise<string | null> {
  const permitido = await solicitarPermisosNotificaciones();
  if (!permitido) return null;

  await Notifications.cancelScheduledNotificationAsync(KILOMETERS_REMINDER_ID);

  return Notifications.scheduleNotificationAsync({
    identifier: KILOMETERS_REMINDER_ID,
    content: {
      title: 'MotoTracker',
      body: 'Actualiza los kilometros de tu moto.',
      data: {
        type: 'kilometers_inactivity_reminder',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: KILOMETERS_REMINDER_INTERVAL_SECONDS,
      repeats: true,
      channelId: CHANNEL_ID,
    },
  });
}

export async function asegurarRecordatorioKilometros(): Promise<void> {
  const permitido = await solicitarPermisosNotificaciones();
  if (!permitido) return;

  const programadas = await obtenerNotificacionesProgramadas();
  const yaProgramada = programadas.some(
    (notificacion) => notificacion.identifier === KILOMETERS_REMINDER_ID,
  );

  if (yaProgramada) return;

  await programarRecordatorioKilometros();
}

export async function programarRecordatorioPorFecha({
  fecha,
  id,
  mensaje,
  tipo,
  titulo = 'MotoTracker',
}: RecordatorioPorFecha): Promise<string | null> {
  const permitido = await solicitarPermisosNotificaciones();
  if (!permitido || fecha.getTime() <= Date.now()) return null;

  await Notifications.cancelScheduledNotificationAsync(id);

  return Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: titulo,
      body: mensaje,
      data: {
        type: tipo ?? 'recordatorio_moto',
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fecha,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelarNotificacion(id: string): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function obtenerNotificacionesProgramadas(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === 'web') return [];
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function cancelarTodasLasNotificaciones(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
