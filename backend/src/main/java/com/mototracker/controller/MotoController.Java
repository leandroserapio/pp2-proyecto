package com.mototracker.controller;

import com.mototracker.model.Moto;
import com.mototracker.model.Usuario;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/{idUsuario}")
    public Moto crearMoto(@PathVariable Long idUsuario, @RequestBody Moto moto) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        moto.setUsuario(usuario);
        return motoRepository.save(moto);
    }
}