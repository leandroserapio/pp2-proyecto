import { light } from '../theme/mototrackerLight';

export type GastoCategoryVisual = {
  name: 'build' | 'shield-checkmark' | 'flash' | 'pricetag';
  color: string;
};

export function getGastoCategoryVisual(tipo: string): GastoCategoryVisual {
  const t = tipo.toLowerCase();
  if (/(seguro|patente)/.test(t)) {
    return { name: 'shield-checkmark', color: light.categoryInsurance };
  }
  if (/(nafta|combustible|combust|shell|ypf|estacion|aceite|carga)/.test(t)) {
    return { name: 'flash', color: light.categoryFuel };
  }
  if (/(service|manten|mecan|cambio|freno|cubierta|repar)/.test(t)) {
    return { name: 'build', color: light.categoryService };
  }
  return { name: 'pricetag', color: light.textMuted };
}
