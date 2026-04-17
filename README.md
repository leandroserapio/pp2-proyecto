# MotoTracker

MotoTracker es una aplicación orientada a la gestión y seguimiento del uso, mantenimiento y documentación de una moto. Permite registrar servicios, vencimientos, gastos de combustible y kilometraje, centralizando toda la información relevante del vehículo en un solo sistema.

## Funcionalidades

- Registro de datos de la moto.
- Seguimiento de cambios de aceite y cadena.
- Historial de service completo.
- Control de patente y seguro.
- Registro de gastos de nafta.
- Cálculo y almacenamiento de kilómetros recorridos.
- Integración opcional con ubicación para sumar kilometraje.

## Tecnologías

### Backend
- Java
- Spring Boot

### Frontend
- HTML
- CSS
- JavaScript

### Base de datos
- MySQL

### Herramientas
- Maven
- Postman
- Git / GitHub
- Swagger

## Arquitectura

La aplicación se desarrollará con una arquitectura cliente-servidor.  
El backend en Spring Boot expondrá una API REST para gestionar la información de la moto, mantenimientos, gastos y vencimientos.  
El frontend consumirá esos endpoints para mostrar y registrar la información de forma simple e intuitiva.

## Entidades principales

- Moto
- Mantenimiento
- Service
- Patente
- Seguro
- GastoCombustible
- Kilometraje

## Objetivo

Brindar una solución simple y escalable para administrar el estado general de una moto, permitiendo al usuario consultar historial, controlar gastos y anticiparse a mantenimientos o vencimientos importantes.
