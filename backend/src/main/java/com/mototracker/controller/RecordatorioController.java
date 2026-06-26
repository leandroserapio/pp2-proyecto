package com.mototracker.controller;

import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Moto;
import com.mototracker.model.Recordatorio;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.RecordatorioRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recordatorios")
@CrossOrigin(origins = "*")
public class RecordatorioController {

    private static final List<Map<String, Object>> PRESETS = List.of(
            Map.of("tipo", "PRESION_NEUMATICOS", "modo", "TIEMPO", "intervaloDias", 7),
            Map.of("tipo", "NIVEL_ACEITE", "modo", "KILOMETRAJE", "intervaloKm", 500),
            Map.of("tipo", "LUBRICACION_CADENA", "modo", "KILOMETRAJE", "intervaloKm", 750),
            Map.of("tipo", "TENSION_CADENA", "modo", "KILOMETRAJE", "intervaloKm", 1000),
            Map.of("tipo", "CAMBIO_ACEITE", "modo", "KILOMETRAJE", "intervaloKm", 4000),
            Map.of("tipo", "FILTRO_AIRE", "modo", "KILOMETRAJE", "intervaloKm", 5000)
    );

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
        if (!motoRepository.existsById(idMoto)) {
            throw new ResourceNotFoundException("Moto no encontrada.");
        }
        return recordatorioRepository.findByMotoIdMoto(idMoto);
    }

    @PostMapping("/moto/{idMoto}/inicializar")
    public List<Recordatorio> inicializarRecordatorios(@PathVariable Long idMoto) {
        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new ResourceNotFoundException("Moto no encontrada."));

        List<Recordatorio> existentes = recordatorioRepository.findByMotoIdMoto(idMoto);
        if (!existentes.isEmpty()) {
            return existentes;
        }

        LocalDate hoy = LocalDate.now();
        Integer kmActual = moto.getKilometrajeActual() != null ? moto.getKilometrajeActual() : 0;
        List<Recordatorio> creados = new ArrayList<>();

        for (Map<String, Object> preset : PRESETS) {
            Recordatorio r = new Recordatorio();
            r.setTipoRecordatorio((String) preset.get("tipo"));
            r.setModoAlerta((String) preset.get("modo"));
            r.setActivo(true);
            r.setFechaInicio(hoy);
            r.setKmInicio(kmActual);
            r.setMoto(moto);

            if ("TIEMPO".equals(preset.get("modo"))) {
                r.setIntervaloDias((Integer) preset.get("intervaloDias"));
            } else {
                r.setIntervaloKm((Integer) preset.get("intervaloKm"));
            }

            creados.add(recordatorioRepository.save(r));
        }

        return creados;
    }

    @PutMapping("/{idRecordatorio}")
    public Recordatorio actualizarRecordatorio(
            @PathVariable Long idRecordatorio,
            @RequestBody Recordatorio datos
    ) {
        Recordatorio recordatorio = recordatorioRepository.findById(idRecordatorio)
                .orElseThrow(() -> new ResourceNotFoundException("Recordatorio no encontrado."));

        validarRecordatorio(datos);

        if (datos.getModoAlerta() != null) {
            recordatorio.setModoAlerta(datos.getModoAlerta());
        }
        if (datos.getIntervaloKm() != null) {
            recordatorio.setIntervaloKm(datos.getIntervaloKm());
        }
        if (datos.getIntervaloDias() != null) {
            recordatorio.setIntervaloDias(datos.getIntervaloDias());
        }
        if (datos.getFechaInicio() != null) {
            recordatorio.setFechaInicio(datos.getFechaInicio());
        }
        if (datos.getKmInicio() != null) {
            recordatorio.setKmInicio(datos.getKmInicio());
        }
        if (datos.getActivo() != null) {
            recordatorio.setActivo(datos.getActivo());
        }

        return recordatorioRepository.save(recordatorio);
    }

    @PatchMapping("/{idRecordatorio}/toggle")
    public Recordatorio toggleRecordatorio(@PathVariable Long idRecordatorio) {
        Recordatorio recordatorio = recordatorioRepository.findById(idRecordatorio)
                .orElseThrow(() -> new ResourceNotFoundException("Recordatorio no encontrado."));

        boolean activo = recordatorio.getActivo() != null && recordatorio.getActivo();
        recordatorio.setActivo(!activo);

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
        if (recordatorio.getModoAlerta() != null
                && !recordatorio.getModoAlerta().equals("TIEMPO")
                && !recordatorio.getModoAlerta().equals("KILOMETRAJE")) {
            throw new BadRequestException("El modo de alerta debe ser TIEMPO o KILOMETRAJE.");
        }

        if ("TIEMPO".equals(recordatorio.getModoAlerta())) {
            if (recordatorio.getIntervaloDias() != null && recordatorio.getIntervaloDias() <= 0) {
                throw new BadRequestException("El intervalo en dias debe ser mayor a 0.");
            }
        }

        if ("KILOMETRAJE".equals(recordatorio.getModoAlerta())) {
            if (recordatorio.getIntervaloKm() != null && recordatorio.getIntervaloKm() <= 0) {
                throw new BadRequestException("El intervalo en kilometros debe ser mayor a 0.");
            }
        }

        if (recordatorio.getKmInicio() != null && recordatorio.getKmInicio() < 0) {
            throw new BadRequestException("El kilometraje de inicio no puede ser negativo.");
        }
    }
}
