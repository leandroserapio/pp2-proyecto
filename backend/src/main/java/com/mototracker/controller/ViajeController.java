package com.mototracker.controller;

import com.mototracker.model.Moto;
import com.mototracker.model.Viaje;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.ViajeRepository;
import org.springframework.web.bind.annotation.*;

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
                .orElseThrow(() -> new RuntimeException("Moto no encontrada"));

        viaje.setMoto(moto);

        if (viaje.getEstado() == null || viaje.getEstado().isBlank()) {
            viaje.setEstado("Programado");
        }

        return viajeRepository.save(viaje);
    }

    @DeleteMapping("/{idViaje}")
    public String eliminarViaje(@PathVariable Long idViaje) {
        viajeRepository.deleteById(idViaje);
        return "Viaje eliminado correctamente";
    }
}