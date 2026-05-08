# Endpoints API - MotoTracker

## Base URL

http://localhost:8080

---

## Usuarios

GET /api/usuarios

POST /api/usuarios

Body:

{
  "nombre": "Luciano",
  "email": "luciano@mail.com",
  "password": "1234"
}

---

## Login

POST /api/usuarios/login

Body:

{
  "email": "luciano@mail.com",
  "password": "1234"
}

---

## Motos

GET /api/motos

GET /api/motos/usuario/{idUsuario}

POST /api/motos/usuario/{idUsuario}

Ejemplo:

POST /api/motos/usuario/1

Body:

{
  "marca": "Siam",
  "modelo": "QU 110",
  "anio": 2023,
  "patente": "A123BCD",
  "kilometrajeActual": 3500
}

PATCH /api/motos/{idMoto}/sumar-kilometros

Ejemplo:

PATCH /api/motos/1/sumar-kilometros

Body:

{
  "kilometros": 35
}

PUT /api/motos/{idMoto}

Ejemplo:

PUT /api/motos/1

Body:

{
  "marca": "Honda",
  "modelo": "Wave 110",
  "anio": 2022,
  "patente": "ABC123",
  "kilometrajeActual": 5000
}

DELETE /api/motos/{idMoto}

Ejemplo:

DELETE /api/motos/1

Este endpoint elimina la moto indicada. También elimina los gastos, mantenimientos y viajes asociados a esa moto.

---

## Gastos

GET /api/gastos

GET /api/gastos/moto/{idMoto}

POST /api/gastos/moto/{idMoto}

Ejemplo:

POST /api/gastos/moto/1

Body:

{
  "tipo": "Nafta",
  "descripcion": "Carga de combustible",
  "monto": 5000,
  "fecha": "2026-04-28"
}

PUT /api/gastos/{idGasto}

Ejemplo:

PUT /api/gastos/1

Body:

{
  "tipo": "Nafta",
  "descripcion": "Carga de combustible actualizada",
  "monto": 7000,
  "fecha": "2026-04-29"
}

DELETE /api/gastos/{idGasto}

Ejemplo:

DELETE /api/gastos/1

Este endpoint elimina el gasto indicado.

---

## Mantenimientos

GET /api/mantenimientos

GET /api/mantenimientos/moto/{idMoto}

POST /api/mantenimientos/moto/{idMoto}

Ejemplo:

POST /api/mantenimientos/moto/1

Body:

{
  "tipo": "Aceite",
  "descripcion": "Cambio de aceite 20W50",
  "fecha": "2026-04-28",
  "kilometraje": 3535,
  "costo": 12000
}

PUT /api/mantenimientos/{idMantenimiento}

Ejemplo:

PUT /api/mantenimientos/1

Body:

{
  "tipo": "Aceite",
  "descripcion": "Cambio de aceite 20W50 actualizado",
  "fecha": "2026-04-29",
  "kilometraje": 4000,
  "costo": 15000
}

DELETE /api/mantenimientos/{idMantenimiento}

Ejemplo:

DELETE /api/mantenimientos/1

Este endpoint elimina el mantenimiento indicado.

---

## Viajes

GET /api/viajes

GET /api/viajes/moto/{idMoto}

POST /api/viajes/moto/{idMoto}

Ejemplo:

POST /api/viajes/moto/1

Body:

{
  "destino": "Punta Lara",
  "fechaSalida": "2026-05-10",
  "kilometrosEstimados": 80,
  "presupuestoEstimado": 15000,
  "notas": "Revisar aceite, cubiertas, frenos y luces antes de salir",
  "estado": "Programado"
}

PUT /api/viajes/{idViaje}

Ejemplo:

PUT /api/viajes/1

Body:

{
  "destino": "Chascomús",
  "fechaSalida": "2026-05-20",
  "kilometrosEstimados": 220,
  "presupuestoEstimado": 30000,
  "notas": "Revisar cubiertas antes de salir",
  "estado": "Programado"
}

DELETE /api/viajes/{idViaje}

Ejemplo:

DELETE /api/viajes/1

Este endpoint elimina el viaje indicado.

---

## Resumen de DELETE

DELETE /api/motos/{idMoto}

Ejemplo:

DELETE /api/motos/1

Elimina una moto y sus datos asociados.

DELETE /api/gastos/{idGasto}

Ejemplo:

DELETE /api/gastos/1

Elimina un gasto.

DELETE /api/mantenimientos/{idMantenimiento}

Ejemplo:

DELETE /api/mantenimientos/1

Elimina un mantenimiento.

DELETE /api/viajes/{idViaje}

Ejemplo:

DELETE /api/viajes/1

Elimina un viaje.

---

## Reglas importantes

El kilometraje solo se actualiza desde:

PATCH /api/motos/{idMoto}/sumar-kilometros

Los gastos no modifican el kilometraje.

Los mantenimientos sí pueden guardar kilometraje, porque indican en qué kilometraje se realizó un service, cambio de aceite, transmisión u otro mantenimiento.

Cuando se crea un mantenimiento con costo, también puede generar un gasto automáticamente.