package com.mototracker.controller;

import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Moto;
import com.mototracker.model.Viaje;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.ViajeRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/viajes")
@CrossOrigin(origins = "*")
public class ViajeController {

    private final ViajeRepository viajeRepository;
    private final MotoRepository motoRepository;

    public ViajeController(ViajeRepository viajeRepository, MotoRepository motoRepository) {
        this.viajeRepository = viajeRepository;
        this.motoRepository = motoRepository;
    }

    @GetMapping
    public List<Viaje> listarViajes() {
        return viajeRepository.findAll();
    }

    @GetMapping("/moto/{idMoto}")
    public List<Viaje> listarViajesPorMoto(@PathVariable Long idMoto) {
        return viajeRepository.findByMotoIdMoto(idMoto);
    }

    @PostMapping("/moto/{idMoto}")
    public Viaje crearViaje(@PathVariable Long idMoto, @RequestBody Viaje viaje) {
        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new ResourceNotFoundException("Moto no encontrada."));

        validarViaje(viaje);

        viaje.setMoto(moto);

        if (viaje.getEstado() == null || viaje.getEstado().isBlank()) {
            viaje.setEstado("Programado");
        }

        return viajeRepository.save(viaje);
    }

    @PutMapping("/{idViaje}")
    public Viaje editarViaje(@PathVariable Long idViaje, @RequestBody Viaje viajeActualizado) {
        Viaje viaje = viajeRepository.findById(idViaje)
                .orElseThrow(() -> new ResourceNotFoundException("Viaje no encontrado."));

        validarViaje(viajeActualizado);

        viaje.setDestino(viajeActualizado.getDestino());
        viaje.setFechaSalida(viajeActualizado.getFechaSalida());
        viaje.setKilometrosEstimados(viajeActualizado.getKilometrosEstimados());
        viaje.setPresupuestoEstimado(viajeActualizado.getPresupuestoEstimado());
        viaje.setNotas(viajeActualizado.getNotas());
        viaje.setEstado(viajeActualizado.getEstado());

        if (viaje.getEstado() == null || viaje.getEstado().isBlank()) {
            viaje.setEstado("Programado");
        }

        return viajeRepository.save(viaje);
    }

    @DeleteMapping("/{idViaje}")
    public String eliminarViaje(@PathVariable Long idViaje) {
        if (!viajeRepository.existsById(idViaje)) {
            throw new ResourceNotFoundException("Viaje no encontrado.");
        }

        viajeRepository.deleteById(idViaje);

        return "Viaje eliminado correctamente.";
    }

    private void validarViaje(Viaje viaje) {
        if (viaje.getDestino() == null || viaje.getDestino().isBlank()) {
            throw new BadRequestException("El destino del viaje es obligatorio.");
        }

        if (viaje.getFechaSalida() == null) {
            throw new BadRequestException("La fecha de salida es obligatoria.");
        }

        if (viaje.getKilometrosEstimados() != null && viaje.getKilometrosEstimados() < 0) {
            throw new BadRequestException("Los kilometros estimados no pueden ser negativos.");
        }

        if (viaje.getPresupuestoEstimado() != null && viaje.getPresupuestoEstimado().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("El presupuesto estimado no puede ser negativo.");
        }
    }
}
