import { apiRequest } from '../api/client';

export type RouteEstimate = {
  kilometers: number;
  durationLabel: string;
  originName: string;
  destinationName: string;
  province: string | null;
  fuelType: string | null;
  pricePerLiter: number | null;
  estimatedCost: number | null;
};

type ApiRouteEstimate = {
  kilometros: number;
  tiempoEstimado: string;
  salidaEncontrada: string;
  destinoEncontrado: string;
  provincia?: string | null;
  combustible?: string | null;
  precioPorLitro?: number | null;
  costoEstimado?: number | null;
};

export class RouteEstimateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouteEstimateError';
  }
}

export async function estimateRoute(
  origin: string,
  destination: string,
  kilometersPerLiter: number,
): Promise<RouteEstimate> {
  try {
    const estimate = await apiRequest<ApiRouteEstimate>('/api/rutas/estimar', {
      method: 'POST',
      body: JSON.stringify({
        salida: origin.trim(),
        destino: destination.trim(),
        kilometrosPorLitro: kilometersPerLiter,
      }),
    });

    return {
      kilometers: estimate.kilometros,
      durationLabel: estimate.tiempoEstimado,
      originName: estimate.salidaEncontrada,
      destinationName: estimate.destinoEncontrado,
      province: estimate.provincia ?? null,
      fuelType: estimate.combustible ?? null,
      pricePerLiter: estimate.precioPorLitro ?? null,
      estimatedCost: estimate.costoEstimado ?? null,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new RouteEstimateError(error.message);
    }
    throw new RouteEstimateError('No se pudo estimar la ruta.');
  }
}
