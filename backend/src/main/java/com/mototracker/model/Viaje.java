package com.mototracker.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "viajes")
public class Viaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idViaje;

    @Column(nullable = false, length = 150)
    private String destino;

    @Column(nullable = false)
    private LocalDate fechaSalida;

    private Integer kilometrosEstimados;

    private BigDecimal presupuestoEstimado;

    @Column(length = 255)
    private String notas;

    @Column(length = 50)
    private String estado;

    @JsonIgnoreProperties({"usuario"})
    @ManyToOne
    @JoinColumn(name = "id_moto", nullable = false)
    private Moto moto;

    public Viaje() {
    }

    public Viaje(Long idViaje, String destino, LocalDate fechaSalida, Integer kilometrosEstimados, BigDecimal presupuestoEstimado, String notas, String estado, Moto moto) {
        this.idViaje = idViaje;
        this.destino = destino;
        this.fechaSalida = fechaSalida;
        this.kilometrosEstimados = kilometrosEstimados;
        this.presupuestoEstimado = presupuestoEstimado;
        this.notas = notas;
        this.estado = estado;
        this.moto = moto;
    }

    public Long getIdViaje() {
        return idViaje;
    }

    public void setIdViaje(Long idViaje) {
        this.idViaje = idViaje;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public LocalDate getFechaSalida() {
        return fechaSalida;
    }

    public void setFechaSalida(LocalDate fechaSalida) {
        this.fechaSalida = fechaSalida;
    }

    public Integer getKilometrosEstimados() {
        return kilometrosEstimados;
    }

    public void setKilometrosEstimados(Integer kilometrosEstimados) {
        this.kilometrosEstimados = kilometrosEstimados;
    }

    public BigDecimal getPresupuestoEstimado() {
        return presupuestoEstimado;
    }

    public void setPresupuestoEstimado(BigDecimal presupuestoEstimado) {
        this.presupuestoEstimado = presupuestoEstimado;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Moto getMoto() {
        return moto;
    }

    public void setMoto(Moto moto) {
        this.moto = moto;
    }
}