package com.mototracker.controller;

import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Gasto;
import com.mototracker.model.Moto;
import com.mototracker.repository.GastoRepository;
import com.mototracker.repository.MotoRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
                .orElseThrow(() -> new ResourceNotFoundException("Moto no encontrada."));

        validarGasto(gasto);

        gasto.setMoto(moto);

        return gastoRepository.save(gasto);
    }

    @PutMapping("/{idGasto}")
    public Gasto editarGasto(@PathVariable Long idGasto, @RequestBody Gasto gastoActualizado) {
        Gasto gasto = gastoRepository.findById(idGasto)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado."));

        validarGasto(gastoActualizado);

        gasto.setTipo(gastoActualizado.getTipo());
        gasto.setDescripcion(gastoActualizado.getDescripcion());
        gasto.setMonto(gastoActualizado.getMonto());
        gasto.setFecha(gastoActualizado.getFecha());

        return gastoRepository.save(gasto);
    }

    @DeleteMapping("/{idGasto}")
    public String eliminarGasto(@PathVariable Long idGasto) {
        if (!gastoRepository.existsById(idGasto)) {
            throw new ResourceNotFoundException("Gasto no encontrado.");
        }

        gastoRepository.deleteById(idGasto);

        return "Gasto eliminado correctamente.";
    }

    private void validarGasto(Gasto gasto) {
        if (gasto.getTipo() == null || gasto.getTipo().isBlank()) {
            throw new BadRequestException("El tipo de gasto es obligatorio.");
        }

        if (gasto.getMonto() == null || gasto.getMonto().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("El monto del gasto debe ser mayor a 0.");
        }

        if (gasto.getFecha() == null) {
            throw new BadRequestException("La fecha del gasto es obligatoria.");
        }
    }
}