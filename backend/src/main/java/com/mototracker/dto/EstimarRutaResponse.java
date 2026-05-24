package com.mototracker.dto;

import java.math.BigDecimal;

public class EstimarRutaResponse {
    private Integer kilometros;
    private String tiempoEstimado;
    private String salidaEncontrada;
    private String destinoEncontrado;
    private String provincia;
    private String combustible;
    private BigDecimal precioPorLitro;
    private BigDecimal costoEstimado;

    public EstimarRutaResponse(
            Integer kilometros,
            String tiempoEstimado,
            String salidaEncontrada,
            String destinoEncontrado,
            String provincia,
            String combustible,
            BigDecimal precioPorLitro,
            BigDecimal costoEstimado
    ) {
        this.kilometros = kilometros;
        this.tiempoEstimado = tiempoEstimado;
        this.salidaEncontrada = salidaEncontrada;
        this.destinoEncontrado = destinoEncontrado;
        this.provincia = provincia;
        this.combustible = combustible;
        this.precioPorLitro = precioPorLitro;
        this.costoEstimado = costoEstimado;
    }

    public Integer getKilometros() {
        return kilometros;
    }

    public void setKilometros(Integer kilometros) {
        this.kilometros = kilometros;
    }

    public String getTiempoEstimado() {
        return tiempoEstimado;
    }

    public void setTiempoEstimado(String tiempoEstimado) {
        this.tiempoEstimado = tiempoEstimado;
    }

    public String getSalidaEncontrada() {
        return salidaEncontrada;
    }

    public void setSalidaEncontrada(String salidaEncontrada) {
        this.salidaEncontrada = salidaEncontrada;
    }

    public String getDestinoEncontrado() {
        return destinoEncontrado;
    }

    public void setDestinoEncontrado(String destinoEncontrado) {
        this.destinoEncontrado = destinoEncontrado;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getCombustible() {
        return combustible;
    }

    public void setCombustible(String combustible) {
        this.combustible = combustible;
    }

    public BigDecimal getPrecioPorLitro() {
        return precioPorLitro;
    }

    public void setPrecioPorLitro(BigDecimal precioPorLitro) {
        this.precioPorLitro = precioPorLitro;
    }

    public BigDecimal getCostoEstimado() {
        return costoEstimado;
    }

    public void setCostoEstimado(BigDecimal costoEstimado) {
        this.costoEstimado = costoEstimado;
    }
}
