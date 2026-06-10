# Documento funcional - MotoTracker

## Descripcion general

MotoTracker es una aplicacion movil para usuarios de motos. Permite registrar una o varias motos y llevar un control organizado del kilometraje, gastos, mantenimientos, recordatorios y viajes.

El sistema cuenta con una aplicacion mobile desarrollada con React Native y Expo, y un backend API REST desarrollado con Java y Spring Boot. La informacion se guarda en una base de datos MySQL.

## Objetivo

Centralizar la informacion principal de la moto para que el usuario pueda:

- Consultar los datos de sus motos.
- Actualizar el kilometraje.
- Registrar gastos.
- Registrar mantenimientos.
- Planificar viajes.
- Gestionar recordatorios.
- Tener una vision general del uso y costo de su moto.

## Alcance funcional

### Usuarios

El sistema permite registrar usuarios, iniciar sesion y recuperar la contrasena mediante una pregunta secreta.

### Motos

Cada usuario puede registrar una o varias motos con datos como marca, modelo, anio, patente y kilometraje actual.

### Gastos

El usuario puede cargar gastos asociados a una moto, por ejemplo combustible, seguro, patente, reparaciones o service.

### Mantenimientos

El sistema permite registrar mantenimientos realizados sobre una moto, indicando tipo, descripcion, fecha, kilometraje y costo.

### Viajes

El usuario puede planificar viajes indicando destino, fecha de salida, kilometros estimados, presupuesto, notas y estado del viaje.

### Recordatorios

El sistema permite crear recordatorios asociados a una moto, con titulo, descripcion, fecha, kilometraje y estado de completado.

### Rutas

El backend incluye un endpoint para estimar rutas, utilizado para calcular informacion aproximada de distancia entre ubicaciones.

## Tecnologias

### Frontend

- React Native
- Expo
- Expo Go
- TypeScript
- React Navigation
- Async Storage

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Maven

### Base de datos

- MySQL

## Integrantes

- Luciano Larrosa
- Leandro Serapio
- Matias Palacio
- Aylen Abalos
- Alex Trigo
