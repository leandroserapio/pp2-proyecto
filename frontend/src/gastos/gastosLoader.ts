import type { Moto, Gasto } from '../types/models';
import type { GastoListNavItem } from '../navigation/types';
import { listarGastosPorMoto } from '../api/gastos';

export function motoLabel(m: Moto): string {
  return [m.marca, m.modelo].filter(Boolean).join(' ').trim() || 'Moto';
}

export async function loadGastosItems(motos: Moto[], filtro: 'todas' | number): Promise<GastoListNavItem[]> {
  const targets = filtro === 'todas' ? motos : motos.filter((m) => m.idMoto === filtro);
  const out: GastoListNavItem[] = [];
  for (const m of targets) {
    const id = m.idMoto;
    if (id == null) continue;
    const list: Gasto[] = await listarGastosPorMoto(id);
    const label = motoLabel(m);
    for (const g of list) {
      out.push({ ...g, idMoto: id, motoLabel: label });
    }
  }
  out.sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  return out;
}

export function sumMontos(items: GastoListNavItem[]): number {
  return items.reduce((acc, g) => {
    const v = typeof g.monto === 'string' ? Number(g.monto.replace(',', '.')) : g.monto;
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
}
