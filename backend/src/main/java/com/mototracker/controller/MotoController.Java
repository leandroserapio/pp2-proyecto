package com.mototracker.controller;

import com.mototracker.model.Moto;
import com.mototracker.model.Usuario;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/motos")
@CrossOrigin(origins = "*")
public class MotoController {

    private final MotoRepository motoRepository;
    private final UsuarioRepository usuarioRepository;

    public MotoController(MotoRepository motoRepository, UsuarioRepository usuarioRepository) {
        this.motoRepository = motoRepository;
        this.usuarioRepository = usuarioRepository;
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
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        moto.setUsuario(usuario);

        if (moto.getKilometrajeActual() == null) {
            moto.setKilometrajeActual(0);
        }

        return motoRepository.save(moto);
    }

    @PatchMapping("/{idMoto}/sumar-kilometros")
public Moto sumarKilometros(@PathVariable Long idMoto, @RequestBody Map<String, Integer> body) {
    Moto moto = motoRepository.findById(idMoto)
            .orElseThrow(() -> new RuntimeException("Moto no encontrada"));

    Integer kilometros = body.get("kilometros");

    if (kilometros == null || kilometros <= 0) {
        throw new RuntimeException("Los kilómetros deben ser mayores a 0");
    }

    Integer kilometrajeActual = moto.getKilometrajeActual();

    if (kilometrajeActual == null) {
        kilometrajeActual = 0;
    }

    moto.setKilometrajeActual(kilometrajeActual + kilometros);

    return motoRepository.save(moto);
}

    
}