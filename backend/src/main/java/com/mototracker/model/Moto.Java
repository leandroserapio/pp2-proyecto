package com.mototracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "motos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    @OneToMany(mappedBy = "moto", cascade = CascadeType.ALL)
    private List<Gasto> gastos;

    @OneToMany(mappedBy = "moto", cascade = CascadeType.ALL)
    private List<Mantenimiento> mantenimientos;

    @OneToMany(mappedBy = "moto", cascade = CascadeType.ALL)
    private List<Viaje> viajes;
}