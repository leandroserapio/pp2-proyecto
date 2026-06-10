# Validaciones - MotoTracker

Este documento resume las validaciones principales implementadas en MotoTracker para evitar datos incompletos o incorrectos.

## Registro de usuario

En el frontend se valida que:

- Nombre, email, contrasena, pregunta secreta y respuesta secreta sean obligatorios.
- El email tenga un formato basico valido.
- La contrasena tenga al menos 4 caracteres.
- Marca y modelo de la moto inicial sean obligatorios.
- El anio de la moto sea coherente.
- El kilometraje inicial no sea negativo.

En el backend se valida que:

- El nombre sea obligatorio.
- El email sea obligatorio y tenga formato valido.
- El email no este repetido.
- La contrasena sea obligatoria.
- La pregunta y respuesta secreta sean obligatorias.
- La marca y el modelo de la moto inicial sean obligatorios.
- El kilometraje inicial no sea negativo.

## Login y recuperacion de contrasena

En el backend se valida que:

- El email y la contrasena sean obligatorios para iniciar sesion.
- El usuario exista.
- La contrasena coincida.
- Para recuperar contrasena, el email, la respuesta secreta y la nueva contrasena sean obligatorios.
- La respuesta secreta coincida con la guardada.

## Motos

En el frontend se valida que:

- Marca y modelo sean obligatorios.
- El anio sea valido.
- El kilometraje no sea negativo.

En el backend se valida que:

- La moto pertenezca a un usuario existente.
- Marca y modelo sean obligatorios.
- El kilometraje no sea negativo.
- Al actualizar kilometraje, el nuevo valor no puede ser menor al kilometraje actual.

## Gastos

En el frontend se valida que:

- Exista una moto seleccionada.
- El tipo de gasto sea obligatorio.
- El monto sea mayor a 0.

En el backend se valida que:

- La moto exista.
- El tipo de gasto sea obligatorio.
- El monto sea mayor a 0.
- La fecha sea obligatoria.

## Mantenimientos

En el frontend se valida que:

- Exista una moto seleccionada.
- El tipo de mantenimiento sea obligatorio.
- El kilometraje, si se carga, sea valido y no negativo.
- El costo, si se carga, sea valido y no negativo.

En el backend se valida que:

- La moto exista.
- El tipo de mantenimiento sea obligatorio.
- La fecha sea obligatoria.
- El kilometraje no sea negativo.
- El costo no sea negativo.

## Viajes

En el frontend se valida que:

- Exista una moto seleccionada.
- El titulo o destino sea obligatorio.
- Los kilometros estimados no sean negativos.
- El presupuesto, si se carga, sea valido y no negativo.
- Para estimar ruta, salida y destino sean obligatorios.
- El rendimiento de la moto en KM/L sea valido.

En el backend se valida que:

- La moto exista.
- El destino sea obligatorio.
- La fecha de salida sea obligatoria.
- Los kilometros estimados no sean negativos.
- El presupuesto estimado no sea negativo.

## Recordatorios

En el backend se valida que:

- La moto exista.
- El titulo del recordatorio sea obligatorio.
- El recordatorio tenga fecha o kilometraje.
- El kilometraje no sea negativo.
- Al eliminar, el recordatorio exista.

## Tests agregados

Se agregaron tests de backend para verificar:

- Creacion correcta de usuario.
- Rechazo de gasto con monto negativo.
- Rechazo de actualizacion de kilometraje menor al actual.
- Rechazo de recordatorio con titulo vacio.
