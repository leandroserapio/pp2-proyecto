import type { Moto, Viaje } from '../types/models';
import type { ViajeListNavItem } from '../navigation/types';
import { listarViajesPorMoto } from '../api/viajes';
import { motoLabel } from '../gastos/gastosLoader';

export { motoLabel };

export async function loadViajesItems(motos: Moto[], filtro: 'todas' | number): Promise<ViajeListNavItem[]> {
  const targets = filtro === 'todas' ? motos : motos.filter((m) => m.idMoto === filtro);
  const out: ViajeListNavItem[] = [];
  for (const m of targets) {
    const id = m.idMoto;
    if (id == null) continue;
    const list: Viaje[] = await listarViajesPorMoto(id);
    const label = motoLabel(m);
    for (const v of list) {
      out.push({ ...v, idMoto: id, motoLabel: label });
    }
  }
  out.sort((a, b) => String(b.fechaSalida).localeCompare(String(a.fechaSalida)));
  return out;
}
