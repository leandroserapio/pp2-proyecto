type GastosAddRequest = {
  idMoto?: number;
};

type MantenimientoAddRequest = Record<string, never>;

let gastosAddRequest: GastosAddRequest | null = null;
let mantenimientoAddRequest: MantenimientoAddRequest | null = null;

export function requestGastosAdd(idMoto?: number) {
  gastosAddRequest = { idMoto };
}

export function consumeGastosAddRequest(): GastosAddRequest | null {
  const request = gastosAddRequest;
  gastosAddRequest = null;
  return request;
}

export function requestMantenimientoAdd() {
  mantenimientoAddRequest = {};
}

export function consumeMantenimientoAddRequest(): MantenimientoAddRequest | null {
  const request = mantenimientoAddRequest;
  mantenimientoAddRequest = null;
  return request;
}
