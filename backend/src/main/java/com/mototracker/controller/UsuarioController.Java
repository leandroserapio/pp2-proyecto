package com.mototracker.controller;

import com.mototracker.dto.LoginRequest;
import com.mototracker.dto.LoginResponse;
import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Usuario;
import com.mototracker.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @PostMapping
    public Usuario crearUsuario(@RequestBody Usuario usuario) {
        validarUsuario(usuario);

        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new BadRequestException("El email ya está registrado.");
        }

        return usuarioRepository.save(usuario);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getEmail().isBlank()) {
            throw new BadRequestException("El email es obligatorio.");
        }

        if (loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            throw new BadRequestException("La contraseña es obligatoria.");
        }

        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        if (!usuario.getPassword().equals(loginRequest.getPassword())) {
            throw new BadRequestException("Contraseña incorrecta.");
        }

        return new LoginResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getEmail()
        );
    }

    private void validarUsuario(Usuario usuario) {
        if (usuario.getNombre() == null || usuario.getNombre().isBlank()) {
            throw new BadRequestException("El nombre es obligatorio.");
        }

        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            throw new BadRequestException("El email es obligatorio.");
        }

        if (!usuario.getEmail().contains("@")) {
            throw new BadRequestException("El email debe tener un formato válido.");
        }

        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            throw new BadRequestException("La contraseña es obligatoria.");
        }
    }
}