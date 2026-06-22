package com.mototracker;

import com.mototracker.controller.MantenimientoController;
import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Mantenimiento;
import com.mototracker.model.Moto;
import com.mototracker.repository.GastoRepository;
import com.mototracker.repository.MantenimientoRepository;
import com.mototracker.repository.MotoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MantenimientoControllerUnitTest {

    @Mock
    private MantenimientoRepository mantenimientoRepository;

    @Mock
    private MotoRepository motoRepository;

    @InjectMocks
    private MantenimientoController mantenimientoController;

    private Moto moto;

    @BeforeEach
    void setUp() {
        moto = new Moto();
        moto.setIdMoto(1L);
        moto.setMarca("Honda");
        moto.setModelo("Wave 110");
    }

    @Test
    void crearMantenimientoConTipoVacioLanzaBadRequest() {
        when(motoRepository.findById(1L)).thenReturn(Optional.of(moto));

        Mantenimiento mantenimiento = new Mantenimiento();
        mantenimiento.setTipo("");
        mantenimiento.setFecha(LocalDate.now());

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> mantenimientoController.crearMantenimiento(1L, mantenimiento)
        );

        assertEquals("El tipo de mantenimiento es obligatorio.", ex.getMessage());
    }

    @Test
    void crearMantenimientoConCostoNegativoLanzaBadRequest() {
        when(motoRepository.findById(1L)).thenReturn(Optional.of(moto));

        Mantenimiento mantenimiento = new Mantenimiento();
        mantenimiento.setTipo("Aceite");
        mantenimiento.setFecha(LocalDate.now());
        mantenimiento.setCosto(BigDecimal.valueOf(-500));

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> mantenimientoController.crearMantenimiento(1L, mantenimiento)
        );

        assertEquals("El costo no puede ser negativo.", ex.getMessage());
    }

    @Test
    void eliminarMantenimientoInexistenteLanzaResourceNotFound() {
        when(mantenimientoRepository.existsById(99L)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> mantenimientoController.eliminarMantenimiento(99L)
        );

        assertEquals("Mantenimiento no encontrado.", ex.getMessage());
    }
}