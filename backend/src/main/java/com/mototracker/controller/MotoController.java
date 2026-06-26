package com.mototracker.controller;

import com.mototracker.dto.ActualizarKilometrajeRequest;
import com.mototracker.dto.ActualizarKilometrajeResponse;
import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Moto;
import com.mototracker.model.Usuario;
import com.mototracker.repository.GastoRepository;
import com.mototracker.repository.MantenimientoRepository;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.RecordatorioRepository;
import com.mototracker.repository.UsuarioRepository;
import com.mototracker.repository.ViajeRepository;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/motos")
@CrossOrigin(origins = "*")
public class MotoController {

    private final MotoRepository motoRepository;
    private final UsuarioRepository usuarioRepository;
    private final GastoRepository gastoRepository;
    private final MantenimientoRepository mantenimientoRepository;
    private final ViajeRepository viajeRepository;
    private final RecordatorioRepository recordatorioRepository;

    public MotoController(
            MotoRepository motoRepository,
            UsuarioRepository usuarioRepository,
            GastoRepository gastoRepository,
            MantenimientoRepository mantenimientoRepository,
            ViajeRepository viajeRepository,
            RecordatorioRepository recordatorioRepository
    ) {
        this.motoRepository = motoRepository;
        this.usuarioRepository = usuarioRepository;
        this.gastoRepository = gastoRepository;
        this.mantenimientoRepository = mantenimientoRepository;
        this.viajeRepository = viajeRepository;
        this.recordatorioRepository = recordatorioRepository;
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
    public Moto crearMoto(
            @PathVariable Long idUsuario,
            @RequestBody Moto moto
    ) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuario no encontrado."));

        validarMoto(moto);

        moto.setUsuario(usuario);

        if (moto.getKilometrajeActual() == null) {
            moto.setKilometrajeActual(0);
        }

        moto.setFechaUltimaActualizacionKm(LocalDateTime.now());

        return motoRepository.save(moto);
    }

    @PutMapping("/{idMoto}")
    public Moto editarMoto(
            @PathVariable Long idMoto,
            @RequestBody Moto motoActualizada
    ) {

        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Moto no encontrada."));

        validarMoto(motoActualizada);

        moto.setMarca(motoActualizada.getMarca());
        moto.setModelo(motoActualizada.getModelo());
        moto.setAnio(motoActualizada.getAnio());
        moto.setPatente(motoActualizada.getPatente());

        if (motoActualizada.getKilometrajeActual() != null) {

            if (motoActualizada.getKilometrajeActual() < 0) {
                throw new BadRequestException(
                        "El kilometraje no puede ser negativo.");
            }

            moto.setKilometrajeActual(
                    motoActualizada.getKilometrajeActual()
            );

            moto.setFechaUltimaActualizacionKm(LocalDateTime.now());
        }

        return motoRepository.save(moto);
    }

    @PatchMapping("/{idMoto}/actualizar-kilometraje")
    public ActualizarKilometrajeResponse actualizarKilometraje(
            @PathVariable Long idMoto,
            @RequestBody ActualizarKilometrajeRequest request
    ) {

        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Moto no encontrada."));

        Integer kilometrajeNuevo = request.getKilometrajeActual();

        if (kilometrajeNuevo == null) {
            throw new BadRequestException(
                    "El kilometraje actual es obligatorio.");
        }

        if (kilometrajeNuevo < 0) {
            throw new BadRequestException(
                    "El kilometraje no puede ser negativo.");
        }

        Integer kilometrajeAnterior = moto.getKilometrajeActual();

        if (kilometrajeAnterior == null) {
            kilometrajeAnterior = 0;
        }

        if (kilometrajeNuevo < kilometrajeAnterior) {
            throw new BadRequestException(
                    "El kilometraje no puede ser menor al actual.");
        }

        Integer kilometrosRecorridos =
                kilometrajeNuevo - kilometrajeAnterior;

        moto.setKilometrajeActual(kilometrajeNuevo);

        moto.setFechaUltimaActualizacionKm(LocalDateTime.now());

        Moto motoActualizada = motoRepository.save(moto);

        return new ActualizarKilometrajeResponse(
                "Kilometraje actualizado correctamente.",
                kilometrosRecorridos,
                motoActualizada
        );
    }

    @DeleteMapping("/{idMoto}")
    public String eliminarMoto(@PathVariable Long idMoto) {

        Moto moto = motoRepository.findById(idMoto)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Moto no encontrada."));

        gastoRepository.deleteAll(
                gastoRepository.findByMotoIdMoto(idMoto));

        mantenimientoRepository.deleteAll(
                mantenimientoRepository.findByMotoIdMoto(idMoto));

        viajeRepository.deleteAll(
                viajeRepository.findByMotoIdMoto(idMoto));

        recordatorioRepository.deleteByMotoIdMoto(idMoto);

        motoRepository.delete(moto);

        return "Moto eliminada correctamente.";
    }

    private void validarMoto(Moto moto) {

        if (moto.getMarca() == null ||
                moto.getMarca().isBlank()) {

            throw new BadRequestException(
                    "La marca de la moto es obligatoria.");
        }

        if (moto.getModelo() == null ||
                moto.getModelo().isBlank()) {

            throw new BadRequestException(
                    "El modelo de la moto es obligatorio.");
        }

        if (
                moto.getKilometrajeActual() != null &&
                        moto.getKilometrajeActual() < 0
        ) {

            throw new BadRequestException(
                    "El kilometraje no puede ser negativo.");
        }
    }
}