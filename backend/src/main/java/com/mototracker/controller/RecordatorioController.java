package com.mototracker.controller;

import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
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
                .orElseThrow(() -> new ResourceNotFoundException("Moto no encontrada."));

        validarRecordatorio(recordatorio);

        recordatorio.setMoto(moto);
        if (recordatorio.getCompletado() == null) {
            recordatorio.setCompletado(false);
        }

        return recordatorioRepository.save(recordatorio);
    }

    @DeleteMapping("/{idRecordatorio}")
    public String eliminarRecordatorio(@PathVariable Long idRecordatorio) {
        if (!recordatorioRepository.existsById(idRecordatorio)) {
            throw new ResourceNotFoundException("Recordatorio no encontrado.");
        }

        recordatorioRepository.deleteById(idRecordatorio);

        return "Recordatorio eliminado correctamente.";
    }

    private void validarRecordatorio(Recordatorio recordatorio) {
        if (recordatorio.getTitulo() == null || recordatorio.getTitulo().isBlank()) {
            throw new BadRequestException("El titulo del recordatorio es obligatorio.");
        }

        if (recordatorio.getFecha() == null && recordatorio.getKilometraje() == null) {
            throw new BadRequestException("El recordatorio debe tener fecha o kilometraje.");
        }

        if (recordatorio.getKilometraje() != null && recordatorio.getKilometraje() < 0) {
            throw new BadRequestException("El kilometraje no puede ser negativo.");
        }
    }
}
