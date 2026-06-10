# Endpoints API - MotoTracker

## Base URL

```text
http://localhost:8080
```

## Test

```http
GET /test
```

Endpoint simple para verificar que el backend esta levantado.

## Usuarios

```http
GET /api/usuarios
GET /api/usuarios/{idUsuario}
POST /api/usuarios
POST /api/usuarios/login
GET /api/usuarios/recuperacion/pregunta?email={email}
POST /api/usuarios/recuperacion/reset
```

### Crear usuario

```http
POST /api/usuarios
```

Body:

```json
{
  "nombre": "Luciano",
  "email": "luciano@mail.com",
  "password": "1234",
  "preguntaSecreta": "Color favorito",
  "respuestaSecreta": "azul",
  "marcaMoto": "Siam",
  "modeloMoto": "QU 110",
  "anioMoto": 2023,
  "patenteMoto": "A123BCD",
  "kilometrajeActualMoto": 3500
}
```

### Login

```http
POST /api/usuarios/login
```

Body:

```json
{
  "email": "luciano@mail.com",
  "password": "1234"
}
```

## Motos

```http
GET /api/motos
GET /api/motos/usuario/{idUsuario}
POST /api/motos/usuario/{idUsuario}
PUT /api/motos/{idMoto}
PATCH /api/motos/{idMoto}/actualizar-kilometraje
DELETE /api/motos/{idMoto}
```

### Crear moto

```http
POST /api/motos/usuario/1
```

Body:

```json
{
  "marca": "Siam",
  "modelo": "QU 110",
  "anio": 2023,
  "patente": "A123BCD",
  "kilometrajeActual": 3500
}
```

### Actualizar kilometraje

```http
PATCH /api/motos/1/actualizar-kilometraje
```

Body:

```json
{
  "kilometrajeActual": 3600
}
```

## Gastos

```http
GET /api/gastos
GET /api/gastos/moto/{idMoto}
POST /api/gastos/moto/{idMoto}
PUT /api/gastos/{idGasto}
DELETE /api/gastos/{idGasto}
```

### Crear gasto

```http
POST /api/gastos/moto/1
```

Body:

```json
{
  "tipo": "Nafta",
  "descripcion": "Carga de combustible",
  "monto": 5000,
  "fecha": "2026-04-28"
}
```

## Mantenimientos

```http
GET /api/mantenimientos
GET /api/mantenimientos/moto/{idMoto}
POST /api/mantenimientos/moto/{idMoto}
PUT /api/mantenimientos/{idMantenimiento}
DELETE /api/mantenimientos/{idMantenimiento}
```

### Crear mantenimiento

```http
POST /api/mantenimientos/moto/1
```

Body:

```json
{
  "tipo": "Aceite",
  "descripcion": "Cambio de aceite 20W50",
  "fecha": "2026-04-28",
  "kilometraje": 3535,
  "costo": 12000
}
```

## Viajes

```http
GET /api/viajes
GET /api/viajes/moto/{idMoto}
POST /api/viajes/moto/{idMoto}
PUT /api/viajes/{idViaje}
DELETE /api/viajes/{idViaje}
```

### Crear viaje

```http
POST /api/viajes/moto/1
```

Body:

```json
{
  "destino": "Punta Lara",
  "fechaSalida": "2026-05-10",
  "kilometrosEstimados": 80,
  "presupuestoEstimado": 15000,
  "notas": "Revisar aceite, cubiertas, frenos y luces antes de salir",
  "estado": "Programado"
}
```

## Recordatorios

```http
GET /api/recordatorios
GET /api/recordatorios/moto/{idMoto}
POST /api/recordatorios/moto/{idMoto}
DELETE /api/recordatorios/{idRecordatorio}
```

### Crear recordatorio

```http
POST /api/recordatorios/moto/1
```

Body:

```json
{
  "titulo": "Cambio de aceite",
  "descripcion": "Realizar cambio de aceite y revisar filtro",
  "fecha": "2026-06-20",
  "kilometraje": 5000,
  "completado": false
}
```

## Rutas

```http
POST /api/rutas/estimar
```

Endpoint utilizado para estimar informacion de una ruta entre origen y destino.

Body:

```json
{
  "salida": "Cordoba, Argentina",
  "destino": "Villa Carlos Paz, Argentina",
  "kilometrosPorLitro": 35
}
```

## Reglas importantes

- El kilometraje de una moto se actualiza desde `PATCH /api/motos/{idMoto}/actualizar-kilometraje`.
- Los gastos no modifican el kilometraje de la moto.
- Los mantenimientos pueden registrar el kilometraje en el que se realizo el trabajo.
- Al eliminar una moto, tambien se eliminan sus datos asociados segun la configuracion del backend.
