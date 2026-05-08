package com.mototracker.controller;

import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Gasto;
import com.mototracker.model.Mantenimiento;
import com.mototracker.model.Moto;
import com.mototracker.repository.GastoRepository;
import com.mototracker.repository.MantenimientoRepository;
import com.mototracker.repository.MotoRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/mantenimientos")
@CrossOrigin(origins = "*")
public class MantenimientoController {

    private final MantenimientoRepository mantenimientoRepository;
    private final MotoRepository motoRepository;
    private final GastoRepository gastoRepository;

    public MantenimientoController(
            MantenimientoRepository mantenimientoRepository,
            MotoRepository motoRepository,
            GastoRepository gastoRepository
    ) {
        this.mantenimientoRepository = mantenimientoRepository;
        this.motoRepository = motoRepository;
        this.gastoRepository = gastoRepository;
    }

    @GetMapping
    public List<Mantenimiento> listarMantenimientos() {
        return mantenimientoRepository.findAll();
    }

    @GetMapping("/moto/{idMoto}")
    public List<Mantenimiento> listarMantenimientosPorMoto(@PathVariable Long idMoto) {
        return mantenimientoRepository.findByMotoIdMoto(idMoto);
    }

    @PostMapping("/moto/{idMoto}")
    public Mantenimiento crearMantenimiento(
            @PathVariable Long idMoto,
            @RequestBody Mantenimiento mantenimiento
    ) {
        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new ResourceNotFoundException("Moto no encontrada."));

        validarMantenimiento(mantenimiento);

        mantenimiento.setMoto(moto);

        Mantenimiento mantenimientoGuardado = mantenimientoRepository.save(mantenimiento);

        if (mantenimiento.getCosto() != null && mantenimiento.getCosto().compareTo(BigDecimal.ZERO) > 0) {
            Gasto gasto = new Gasto();

            gasto.setTipo("Mantenimiento");
            gasto.setDescripcion(mantenimiento.getTipo() + " - " + mantenimiento.getDescripcion());
            gasto.setMonto(mantenimiento.getCosto());
            gasto.setFecha(mantenimiento.getFecha());
            gasto.setMoto(moto);

            gastoRepository.save(gasto);
        }

        return mantenimientoGuardado;
    }

    @PutMapping("/{idMantenimiento}")
    public Mantenimiento editarMantenimiento(
            @PathVariable Long idMantenimiento,
            @RequestBody Mantenimiento mantenimientoActualizado
    ) {
        Mantenimiento mantenimiento = mantenimientoRepository.findById(idMantenimiento)
                .orElseThrow(() -> new ResourceNotFoundException("Mantenimiento no encontrado."));

        validarMantenimiento(mantenimientoActualizado);

        mantenimiento.setTipo(mantenimientoActualizado.getTipo());
        mantenimiento.setDescripcion(mantenimientoActualizado.getDescripcion());
        mantenimiento.setFecha(mantenimientoActualizado.getFecha());
        mantenimiento.setKilometraje(mantenimientoActualizado.getKilometraje());
        mantenimiento.setCosto(mantenimientoActualizado.getCosto());

        return mantenimientoRepository.save(mantenimiento);
    }

    @DeleteMapping("/{idMantenimiento}")
    public String eliminarMantenimiento(@PathVariable Long idMantenimiento) {
        if (!mantenimientoRepository.existsById(idMantenimiento)) {
            throw new ResourceNotFoundException("Mantenimiento no encontrado.");
        }

        mantenimientoRepository.deleteById(idMantenimiento);

        return "Mantenimiento eliminado correctamente.";
    }

    private void validarMantenimiento(Mantenimiento mantenimiento) {
        if (mantenimiento.getTipo() == null || mantenimiento.getTipo().isBlank()) {
            throw new BadRequestException("El tipo de mantenimiento es obligatorio.");
        }

        if (mantenimiento.getFecha() == null) {
            throw new BadRequestException("La fecha del mantenimiento es obligatoria.");
        }

        if (mantenimiento.getKilometraje() != null && mantenimiento.getKilometraje() < 0) {
            throw new BadRequestException("El kilometraje no puede ser negativo.");
        }

        if (mantenimiento.getCosto() != null && mantenimiento.getCosto().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("El costo no puede ser negativo.");
        }
    }
}