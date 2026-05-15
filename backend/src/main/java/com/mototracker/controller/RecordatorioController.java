package com.mototracker.controller;

import com.mototracker.model.Moto;
import com.mototracker.model.Recordatorio;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.RecordatorioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recordatorios")
@CrossOrigin(origins = "*")
public class RecordatorioController {

    private final RecordatorioRepository recordatorioRepository;
    private final MotoRepository motoRepository;

    public RecordatorioController(
            RecordatorioRepository recordatorioRepository,
            MotoRepository motoRepository
    ) {
        this.recordatorioRepository = recordatorioRepository;
        this.motoRepository = motoRepository;
    }

    @GetMapping
    public List<Recordatorio> listarRecordatorios() {
        return recordatorioRepository.findAll();
    }

    @GetMapping("/moto/{idMoto}")
    public List<Recordatorio> listarPorMoto(@PathVariable Long idMoto) {
        return recordatorioRepository.findByMotoIdMoto(idMoto);
    }

    @PostMapping("/moto/{idMoto}")
    public Recordatorio crearRecordatorio(
            @PathVariable Long idMoto,
            @RequestBody Recordatorio recordatorio
    ) {

        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new RuntimeException("Moto no encontrada"));

        recordatorio.setMoto(moto);

        return recordatorioRepository.save(recordatorio);
    }

    @DeleteMapping("/{idRecordatorio}")
    public String eliminarRecordatorio(@PathVariable Long idRecordatorio) {

        recordatorioRepository.deleteById(idRecordatorio);

        return "Recordatorio eliminado";
    }
}