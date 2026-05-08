package com.mototracker.controller;

import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Moto;
import com.mototracker.model.Usuario;
import com.mototracker.repository.GastoRepository;
import com.mototracker.repository.MantenimientoRepository;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.UsuarioRepository;
import com.mototracker.repository.ViajeRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/motos")
@CrossOrigin(origins = "*")
public class MotoController {

    private final MotoRepository motoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GastoRepository gastoRepository;
    private final MantenimientoRepository mantenimientoRepository;
    private final ViajeRepository viajeRepository;

    public MotoController(
            MotoRepository motoRepository,
            UsuarioRepository usuarioRepository,
            GastoRepository gastoRepository,
            MantenimientoRepository mantenimientoRepository,
            ViajeRepository viajeRepository
    ) {
        this.motoRepository = motoRepository;
        this.usuarioRepository = usuarioRepository;
        this.gastoRepository = gastoRepository;
        this.mantenimientoRepository = mantenimientoRepository;
        this.viajeRepository = viajeRepository;
    }

    @GetMapping
    public List<Moto> listarMotos() {
        return motoRepository.findAll();
    }

    @GetMapping("/usuario/{idUsuario}")
    public List<Moto> listarMotosPorUsuario(@PathVariable Long idUsuario) {
        return motoRepository.findByUsuarioIdUsuario(idUsuario);
    }

    @PostMapping("/usuario/{idUsuario}")
    public Moto crearMoto(@PathVariable Long idUsuario, @RequestBody Moto moto) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        validarMoto(moto);

        moto.setUsuario(usuario);

        if (moto.getKilometrajeActual() == null) {
            moto.setKilometrajeActual(0);
        }

        return motoRepository.save(moto);
    }

    @PutMapping("/{idMoto}")
    public Moto editarMoto(@PathVariable Long idMoto, @RequestBody Moto motoActualizada) {
        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new ResourceNotFoundException("Moto no encontrada."));

        validarMoto(motoActualizada);

        moto.setMarca(motoActualizada.getMarca());
        moto.setModelo(motoActualizada.getModelo());
        moto.setAnio(motoActualizada.getAnio());
        moto.setPatente(motoActualizada.getPatente());

        if (motoActualizada.getKilometrajeActual() != null) {
            if (motoActualizada.getKilometrajeActual() < 0) {
                throw new BadRequestException("El kilometraje no puede ser negativo.");
            }

            moto.setKilometrajeActual(motoActualizada.getKilometrajeActual());
        }

        return motoRepository.save(moto);
    }

    @PatchMapping("/{idMoto}/sumar-kilometros")
    public Moto sumarKilometros(@PathVariable Long idMoto, @RequestBody Map<String, Integer> body) {
        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new ResourceNotFoundException("Moto no encontrada."));

        Integer kilometros = body.get("kilometros");

        if (kilometros == null || kilometros <= 0) {
            throw new BadRequestException("Los kilómetros deben ser mayores a 0.");
        }

        Integer kilometrajeActual = moto.getKilometrajeActual();

        if (kilometrajeActual == null) {
            kilometrajeActual = 0;
        }

        moto.setKilometrajeActual(kilometrajeActual + kilometros);

        return motoRepository.save(moto);
    }

    @DeleteMapping("/{idMoto}")
    public String eliminarMoto(@PathVariable Long idMoto) {
        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() -> new ResourceNotFoundException("Moto no encontrada."));

        gastoRepository.deleteAll(gastoRepository.findByMotoIdMoto(idMoto));
        mantenimientoRepository.deleteAll(mantenimientoRepository.findByMotoIdMoto(idMoto));
        viajeRepository.deleteAll(viajeRepository.findByMotoIdMoto(idMoto));

        motoRepository.delete(moto);

        return "Moto eliminada correctamente.";
    }

    private void validarMoto(Moto moto) {
        if (moto.getMarca() == null || moto.getMarca().isBlank()) {
            throw new BadRequestException("La marca de la moto es obligatoria.");
        }

        if (moto.getModelo() == null || moto.getModelo().isBlank()) {
            throw new BadRequestException("El modelo de la moto es obligatorio.");
        }

        if (moto.getKilometrajeActual() != null && moto.getKilometrajeActual() < 0) {
            throw new BadRequestException("El kilometraje no puede ser negativo.");
        }
    }
}