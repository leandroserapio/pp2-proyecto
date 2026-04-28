package com.mototracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "mantenimientos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Mantenimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMantenimiento;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(length = 255)
    private String descripcion;

    @Column(nullable = false)
    private LocalDate fecha;

    private Integer kilometraje;

    private BigDecimal costo;

    @ManyToOne
    @JoinColumn(name = "id_moto", nullable = false)
    private Moto moto;
}