package com.mototracker.controller;

import com.mototracker.dto.LoginRequest;
import com.mototracker.dto.LoginResponse;
import com.mototracker.dto.PreguntaSecretaResponse;
import com.mototracker.dto.RecuperarPasswordRequest;
import com.mototracker.dto.RegistroUsuarioRequest;
import com.mototracker.exception.BadRequestException;
import com.mototracker.exception.ResourceNotFoundException;
import com.mototracker.model.Moto;
import com.mototracker.model.Usuario;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.UsuarioRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final MotoRepository motoRepository;

    public UsuarioController(UsuarioRepository usuarioRepository, MotoRepository motoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.motoRepository = motoRepository;
    }

    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{idUsuario}")
    public LoginResponse obtenerUsuario(@PathVariable Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        return new LoginResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getEmail()
        );
    }

    @PostMapping
    @Transactional
    public LoginResponse crearUsuario(@RequestBody RegistroUsuarioRequest request) {
        validarRegistro(request);

        if (usuarioRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("El email ya esta registrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setEmail(request.getEmail().trim());
        usuario.setPassword(request.getPassword());
        usuario.setPreguntaSecreta(request.getPreguntaSecreta().trim());
        usuario.setRespuestaSecreta(normalizarRespuesta(request.getRespuestaSecreta()));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        if (tieneDatosMoto(request)) {
            Moto moto = new Moto();
            moto.setMarca(request.getMarcaMoto().trim());
            moto.setModelo(request.getModeloMoto().trim());
            moto.setAnio(request.getAnioMoto());
            moto.setPatente(request.getPatenteMoto() == null || request.getPatenteMoto().isBlank() ? null : request.getPatenteMoto().trim());
            moto.setKilometrajeActual(request.getKilometrajeActualMoto() == null ? 0 : request.getKilometrajeActualMoto());
            moto.setFechaUltimaActualizacionKm(LocalDateTime.now());
            moto.setUsuario(usuarioGuardado);
            motoRepository.save(moto);
        }

        return new LoginResponse(
                usuarioGuardado.getIdUsuario(),
                usuarioGuardado.getNombre(),
                usuarioGuardado.getEmail()
        );
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getEmail().isBlank()) {
            throw new BadRequestException("El email es obligatorio.");
        }

        if (loginRequest.getPassword() == null || loginRequest.getPassword().isBlank()) {
            throw new BadRequestException("La contrasena es obligatoria.");
        }

        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        if (!usuario.getPassword().equals(loginRequest.getPassword())) {
            throw new BadRequestException("Contrasena incorrecta.");
        }

        return new LoginResponse(
                usuario.getIdUsuario(),
                usuario.getNombre(),
                usuario.getEmail()
        );
    }

    @GetMapping("/recuperacion/pregunta")
    public PreguntaSecretaResponse obtenerPreguntaSecreta(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            throw new BadRequestException("El email es obligatorio.");
        }

        Usuario usuario = usuarioRepository.findByEmail(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        return new PreguntaSecretaResponse(usuario.getEmail(), usuario.getPreguntaSecreta());
    }

    @PostMapping("/recuperacion/reset")
    public String recuperarPassword(@RequestBody RecuperarPasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("El email es obligatorio.");
        }

        if (request.getRespuestaSecreta() == null || request.getRespuestaSecreta().isBlank()) {
            throw new BadRequestException("La respuesta secreta es obligatoria.");
        }

        if (request.getNuevaPassword() == null || request.getNuevaPassword().isBlank()) {
            throw new BadRequestException("La nueva contrasena es obligatoria.");
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));

        if (!normalizarRespuesta(request.getRespuestaSecreta()).equals(usuario.getRespuestaSecreta())) {
            throw new BadRequestException("La respuesta secreta no coincide.");
        }

        usuario.setPassword(request.getNuevaPassword());
        usuarioRepository.save(usuario);

        return "Contrasena actualizada correctamente.";
    }

    private void validarRegistro(RegistroUsuarioRequest usuario) {
        if (usuario.getNombre() == null || usuario.getNombre().isBlank()) {
            throw new BadRequestException("El nombre es obligatorio.");
        }

        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            throw new BadRequestException("El email es obligatorio.");
        }

        if (!usuario.getEmail().contains("@")) {
            throw new BadRequestException("El email debe tener un formato valido.");
        }

        if (usuario.getPassword() == null || usuario.getPassword().isBlank()) {
            throw new BadRequestException("La contrasena es obligatoria.");
        }

        if (usuario.getPreguntaSecreta() == null || usuario.getPreguntaSecreta().isBlank()) {
            throw new BadRequestException("La pregunta secreta es obligatoria.");
        }

        if (usuario.getRespuestaSecreta() == null || usuario.getRespuestaSecreta().isBlank()) {
            throw new BadRequestException("La respuesta secreta es obligatoria.");
        }

        if (tieneDatosMoto(usuario)) {
            if (usuario.getMarcaMoto() == null || usuario.getMarcaMoto().isBlank()) {
                throw new BadRequestException("La marca de la moto es obligatoria.");
            }

            if (usuario.getModeloMoto() == null || usuario.getModeloMoto().isBlank()) {
                throw new BadRequestException("El modelo de la moto es obligatorio.");
            }
        }

        if (usuario.getKilometrajeActualMoto() != null && usuario.getKilometrajeActualMoto() < 0) {
            throw new BadRequestException("El kilometraje no puede ser negativo.");
        }
    }

    private boolean tieneDatosMoto(RegistroUsuarioRequest request) {
        return (request.getMarcaMoto() != null && !request.getMarcaMoto().isBlank())
                || (request.getModeloMoto() != null && !request.getModeloMoto().isBlank());
    }

    private String normalizarRespuesta(String respuesta) {
        return respuesta.trim().toLowerCase(Locale.ROOT);
    }
}
