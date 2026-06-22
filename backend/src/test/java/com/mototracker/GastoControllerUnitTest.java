package com.mototracker;

import com.mototracker.controller.GastoController;
import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Gasto;
import com.mototracker.model.Moto;
import com.mototracker.repository.GastoRepository;
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
class GastoControllerUnitTest {

    @Mock
    private GastoRepository gastoRepository;

    @Mock
    private MotoRepository motoRepository;

    @InjectMocks
    private GastoController gastoController;

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

        Gasto gasto = new Gasto();
        gasto.setTipo("");
        gasto.setMonto(new BigDecimal("100.00"));
        gasto.setFecha(LocalDate.now());

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> gastoController.crearGasto(1L, gasto)
        );

        assertEquals("El tipo de gasto es obligatorio.", ex.getMessage());
    }

    @Test
    void crearGastoConMontoNegativoLanzaBadRequest() {
        when(motoRepository.findById(1L)).thenReturn(Optional.of(moto));

        Gasto gasto = new Gasto();
        gasto.setTipo("Combustible");
        gasto.setMonto(new BigDecimal("-100.00"));
        gasto.setFecha(LocalDate.now());

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> gastoController.crearGasto(1L, gasto)
        );

        assertEquals("El monto del gasto debe ser mayor a 0.", ex.getMessage());
    }

}