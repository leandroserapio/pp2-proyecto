package com.mototracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "motos")
public class Moto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMoto;

    @Column(nullable = false, length = 100)
    private String marca;

    @Column(nullable = false, length = 100)
    private String modelo;

    private Integer anio;

    @Column(length = 20)
    private String patente;

    private Integer kilometrajeActual;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    public Moto() {
    }

    public Moto(Long idMoto, String marca, String modelo, Integer anio, String patente, Integer kilometrajeActual, Usuario usuario) {
        this.idMoto = idMoto;
        this.marca = marca;
        this.modelo = modelo;
        this.anio = anio;
        this.patente = patente;
        this.kilometrajeActual = kilometrajeActual;
        this.usuario = usuario;
    }

    public Long getIdMoto() {
        return idMoto;
    }

    public void setIdMoto(Long idMoto) {
        this.idMoto = idMoto;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public Integer getAnio() {
        return anio;
    }

    public void setAnio(Integer anio) {
        this.anio = anio;
    }

    public String getPatente() {
        return patente;
    }

    public void setPatente(String patente) {
        this.patente = patente;
    }

    public Integer getKilometrajeActual() {
        return kilometrajeActual;
    }

    public void setKilometrajeActual(Integer kilometrajeActual) {
        this.kilometrajeActual = kilometrajeActual;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
}