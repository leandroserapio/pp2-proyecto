package com.mototracker.controller;

import com.mototracker.model.Gasto;
import com.mototracker.model.Moto;
import com.mototracker.repository.GastoRepository;
import com.mototracker.repository.MotoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gastos")
@CrossOrigin(origins = "*")
public class GastoController {

    private final GastoRepository gastoRepository;
    private final MotoRepository motoRepository;

    public GastoController(GastoRepository gastoRepository, MotoRepository motoRepository) {
        this.gastoRepository = gastoRepository;
        this.motoRepository = motoRepository;
    }

    @GetMapping
    public List<Gasto> listarGastos() {
        return gastoRepository.findAll();
    }

    @GetMapping("/moto/{idMoto}")
    public List<Gasto> listarGastosPorMoto(@PathVariable Long idMoto) {
        return gastoRepository.findByMotoIdMoto(idMoto);
    }

    @PostMapping("/moto/{idMoto}")
    public Gasto crearGasto(@PathVariable Long idMoto, @RequestBody Gasto gasto) {
        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new RuntimeException("Moto no encontrada"));

        gasto.setMoto(moto);

        return gastoRepository.save(gasto);
    }

    @DeleteMapping("/{idGasto}")
    public String eliminarGasto(@PathVariable Long idGasto) {
        gastoRepository.deleteById(idGasto);
        return "Gasto eliminado correctamente";
    }
}