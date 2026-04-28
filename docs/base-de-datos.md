# Base de datos - MotoTracker

La base de datos elegida para MotoTracker es MySQL.

## Tablas principales

- usuarios
- motos
- gastos
- mantenimientos
- viajes

## Relaciones

usuarios 1 ─── N motos

motos 1 ─── N gastos

motos 1 ─── N mantenimientos

motos 1 ─── N viajes

## Uso

La base de datos se usará para guardar usuarios, motos registradas, gastos, mantenimientos y viajes programados.