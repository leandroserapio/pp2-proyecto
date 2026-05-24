package com.mototracker.dto;

import com.mototracker.model.Moto;

public class ActualizarKilometrajeResponse {

    private String mensaje;

    private Integer kilometrosRecorridos;

    private Moto moto;

    public ActualizarKilometrajeResponse() {
    }

    public ActualizarKilometrajeResponse(
            String mensaje,
            Integer kilometrosRecorridos,
            Moto moto
    ) {
        this.mensaje = mensaje;
        this.kilometrosRecorridos = kilometrosRecorridos;
        this.moto = moto;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Integer getKilometrosRecorridos() {
        return kilometrosRecorridos;
    }

    public void setKilometrosRecorridos(Integer kilometrosRecorridos) {
        this.kilometrosRecorridos = kilometrosRecorridos;
    }

    public Moto getMoto() {
        return moto;
    }

    public void setMoto(Moto moto) {
        this.moto = moto;
    }
}