// src/screens/tabs/HomeScreen.tsx

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { sumarKilometros } from '../../api/motos';
import { ApiError } from '../../api/client';
import { AppHeader } from '../../components/AppHeader';
import { AppTextInput } from '../../components/AppTextInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppSettings } from '../../context/AppSettingsContext';
import { useMoto } from '../../context/MotoContext';
import { fontFamily } from '../../theme/fonts';
import { light } from '../../theme/mototrackerLight';

export function HomeScreen() {
  const { selectedMoto, selectedMotoId, refreshMotos } = useMoto();
  const { theme } = useAppSettings();
  const [kmOpen, setKmOpen] = useState(false);
  const [kmAdd, setKmAdd] = useState('');
  const [saving, setSaving] = useState(false);

  const onSumarKm = async () => {
    if (!selectedMotoId) return;

    const n = Number(kmAdd);
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert('Valor inválido', 'Ingresá un número mayor a 0.');
      return;
    }

    setSaving(true);
    try {
      await sumarKilometros(selectedMotoId, n);
      setKmAdd('');
      setKmOpen(false);
      await refreshMotos();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'No se pudieron sumar km';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: theme.bg
        }
      ]}
      edges={['top']}
    >
      {!kmOpen ? <AppHeader title="Inicio" /> : null}

      <ScrollView contentContainerStyle={styles.content}>
        {selectedMoto ? (
          <>
            <View style={[
              styles.heroCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }
            ]}>
              <Text style={[
                styles.eyebrow,
                {
                  color: theme.textMuted
                }
              ]}>
                MOTO ACTIVA
              </Text>

              <Text style={[
                styles.motoTitle,
                {
                  color: theme.text
                }
              ]}>
                {selectedMoto.marca} {selectedMoto.modelo}
              </Text>

              <View style={styles.infoGrid}>
                <InfoTile
                  label="Kilometraje"
                  value={`${selectedMoto.kilometrajeActual ?? 0} km`}
                />
                <InfoTile
                  label="Año"
                  value={selectedMoto.anio ? String(selectedMoto.anio) : '-'}
                />
                <InfoTile
                  label="Patente"
                  value={selectedMoto.patente || '-'}
                />
              </View>

              {kmOpen ? (
                <View style={styles.kmForm}>
                  <AppTextInput
                    label="Kilómetros recorridos"
                    variant="light"
                    placeholder="Ej: 50"
                    keyboardType="number-pad"
                    value={kmAdd}
                    onChangeText={setKmAdd}
                  />

                  <View style={styles.formActions}>
                    <Pressable
                      style={[
                        styles.secondaryButton,
                        {
                          borderColor: theme.border
                        }
                      ]}
                      onPress={() => {
                        setKmAdd('');
                        setKmOpen(false);
                      }}
                    >
                      <Text style={[
                        styles.secondaryButtonText,
                        {
                          color: theme.text
                        }
                      ]}>
                        Cancelar
                      </Text>
                    </Pressable>

                    <PrimaryButton
                      title="Sumar"
                      variant="blue"
                      loading={saving}
                      onPress={onSumarKm}
                      style={styles.primaryAction}
                    />
                  </View>
                </View>
              ) : (
                <PrimaryButton
                  title="Sumar kilómetros"
                  variant="blue"
                  onPress={() => setKmOpen(true)}
                  style={styles.cta}
                />
              )}
            </View>

            <View style={styles.quickRow}>
              <StatusChip
                icon="notifications-outline"
                label="Recordatorios activos"
              />
              <StatusChip
                icon="shield-checkmark-outline"
                label="Control al día"
              />
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons
              name="bicycle-outline"
              size={64}
              color={theme.textMuted}
            />
            <Text style={[
              styles.emptyTitle,
              {
                color: theme.text
              }
            ]}>
              No hay moto activa
            </Text>
            <Text style={[
              styles.emptySub,
              {
                color: theme.textMuted
              }
            ]}>
              Registrá o seleccioná una moto desde Garage para ver el panel.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const { theme } = useAppSettings();

  return (
    <View style={[
      styles.infoTile,
      {
        backgroundColor: theme.bg,
        borderColor: theme.border,
      }
    ]}>
      <Text style={[
        styles.infoLabel,
        {
          color: theme.textMuted
        }
      ]}>
        {label}
      </Text>
      <Text style={[
        styles.infoValue,
        {
          color: theme.text
        }
      ]}>
        {value}
      </Text>
    </View>
  );
}

function StatusChip({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { theme } = useAppSettings();

  return (
    <View style={[
      styles.statusChip,
      {
        backgroundColor: theme.surface,
        borderColor: theme.border,
      }
    ]}>
      <Ionicons
        name={icon}
        size={18}
        color={theme.primary}
      />
      <Text style={[
        styles.statusText,
        {
          color: theme.text
        }
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  content: {
    padding: 18,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: light.border,
    backgroundColor: light.surface,
    padding: 18,
  },
  eyebrow: {
    color: light.textMuted,
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
    fontSize: 11,
  },
  motoTitle: {
    marginTop: 8,
    color: light.text,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 28,
  },
  infoGrid: {
    marginTop: 18,
    gap: 10,
  },
  infoTile: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
  },
  infoLabel: {
    color: light.textMuted,
    fontSize: 12,
  },
  infoValue: {
    marginTop: 6,
    color: light.text,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 18,
  },
  cta: {
    marginTop: 18,
  },
  kmForm: {
    marginTop: 18,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: fontFamily.semiBold,
    fontWeight: '600',
  },
  primaryAction: {
    flex: 1,
  },
  quickRow: {
    marginTop: 14,
    gap: 10,
  },
  statusChip: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  statusText: {
    color: light.text,
    fontFamily: fontFamily.medium,
    fontWeight: '500',
  },
  empty: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontFamily: fontFamily.bold,
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});
