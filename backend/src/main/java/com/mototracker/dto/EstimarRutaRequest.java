package com.mototracker.dto;

public class EstimarRutaRequest {
    private String salida;
    private String destino;
    private Double kilometrosPorLitro;

    public String getSalida() {
        return salida;
    }

    public void setSalida(String salida) {
        this.salida = salida;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public Double getKilometrosPorLitro() {
        return kilometrosPorLitro;
    }

    public void setKilometrosPorLitro(Double kilometrosPorLitro) {
        this.kilometrosPorLitro = kilometrosPorLitro;
    }
}
