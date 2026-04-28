package com.mototracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "viajes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

    @ManyToOne
    @JoinColumn(name = "id_moto", nullable = false)
    private Moto moto;
}