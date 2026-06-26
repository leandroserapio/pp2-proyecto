package com.mototracker.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "recordatorios")
public class Recordatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRecordatorio;

    @Column(nullable = false, length = 50)
    private String tipoRecordatorio;

    @Column(nullable = false, length = 20)
    private String modoAlerta;

    private Integer intervaloKm;

    private Integer intervaloDias;

    private LocalDate fechaInicio;

    private Integer kmInicio;

    private Boolean activo = true;

    @ManyToOne
    @JoinColumn(name = "id_moto", nullable = false)
    private Moto moto;

    public Long getIdRecordatorio() {
        return idRecordatorio;
    }

    public void setIdRecordatorio(Long idRecordatorio) {
        this.idRecordatorio = idRecordatorio;
    }

    public String getTipoRecordatorio() {
        return tipoRecordatorio;
    }

    public void setTipoRecordatorio(String tipoRecordatorio) {
        this.tipoRecordatorio = tipoRecordatorio;
    }

    public String getModoAlerta() {
        return modoAlerta;
    }

    public void setModoAlerta(String modoAlerta) {
        this.modoAlerta = modoAlerta;
    }

    public Integer getIntervaloKm() {
        return intervaloKm;
    }

    public void setIntervaloKm(Integer intervaloKm) {
        this.intervaloKm = intervaloKm;
    }

    public Integer getIntervaloDias() {
        return intervaloDias;
    }

    public void setIntervaloDias(Integer intervaloDias) {
        this.intervaloDias = intervaloDias;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public Integer getKmInicio() {
        return kmInicio;
    }

    public void setKmInicio(Integer kmInicio) {
        this.kmInicio = kmInicio;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Moto getMoto() {
        return moto;
    }

    public void setMoto(Moto moto) {
        this.moto = moto;
    }
}
