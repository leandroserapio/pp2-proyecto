
# MotoTracker

MotoTracker es una aplicación móvil pensada para usuarios de motos. Permite registrar una o varias motos y llevar un control básico de kilometraje, gastos, mantenimientos y viajes programados.

## Objetivo

El objetivo de MotoTracker es centralizar la información principal de la moto en una sola aplicación, ayudando al usuario a organizar gastos, controlar el estado de mantenimiento y planificar viajes.

## Vistas principales

### Login

Permite que el usuario acceda a la aplicación con su cuenta.

### Inicio

Muestra los datos principales de la moto seleccionada, como marca, modelo, patente y kilometraje actual. También permite sumar kilómetros recorridos.

### Gastos

Permite registrar gastos relacionados con la moto, como nafta, seguro, patente, reparaciones, service y otros gastos.

### Estado

Permite controlar el mantenimiento de la moto, registrando services, cambios de aceite, transmisión, frenos, cubiertas y otros controles importantes.

### Viajes

Permite programar viajes, indicando destino, fecha, kilómetros estimados, presupuesto aproximado y notas.

### Configuración

Permite modificar datos del usuario, datos de las motos registradas y preferencias generales de la aplicación.

## Tecnologías utilizadas

### Frontend Mobile

- React Native
- Expo
- TypeScript

### Backend

- Java
- Spring Boot

### Base de datos

- MySQL

## Uso de la base de datos

La base de datos se utilizará para guardar la información principal de la aplicación:

- usuarios
- motos
- gastos
- mantenimientos
- viajes

## Relaciones principales


usuarios 1 ─── N motos

motos 1 ─── N gastos

motos 1 ─── N mantenimientos

motos 1 ─── N viajes


Un usuario puede registrar una o varias motos.
Cada moto puede tener muchos gastos, mantenimientos y viajes asociados.

## Estructura general del sistema


React Native
     |
     v
Spring Boot API REST
     |
     v
MySQL


## Justificación del proyecto

Muchas personas que utilizan moto no llevan un control ordenado del kilometraje, los gastos o los mantenimientos realizados. Esto puede generar olvidos importantes, como no realizar un service a tiempo o no saber cuánto dinero se gasta en la moto.

MotoTracker busca resolver este problema ofreciendo una herramienta simple para registrar y consultar la información principal de la moto desde el celular.

## Estado del proyecto

Proyecto en etapa inicial de desarrollo.

