package com.mototracker.controller;

import com.mototracker.model.Mantenimiento;
import com.mototracker.model.Moto;
import com.mototracker.repository.MantenimientoRepository;
import com.mototracker.repository.MotoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mantenimientos")
@CrossOrigin(origins = "*")
public class MantenimientoController {

    private final MantenimientoRepository mantenimientoRepository;
    private final MotoRepository motoRepository;

    public MantenimientoController(MantenimientoRepository mantenimientoRepository, MotoRepository motoRepository) {
        this.mantenimientoRepository = mantenimientoRepository;
        this.motoRepository = motoRepository;
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
    public Mantenimiento crearMantenimiento(@PathVariable Long idMoto, @RequestBody Mantenimiento mantenimiento) {
        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new RuntimeException("Moto no encontrada"));

        mantenimiento.setMoto(moto);

        return mantenimientoRepository.save(mantenimiento);
    }

    @DeleteMapping("/{idMantenimiento}")
    public String eliminarMantenimiento(@PathVariable Long idMantenimiento) {
        mantenimientoRepository.deleteById(idMantenimiento);
        return "Mantenimiento eliminado correctamente";
    }
}