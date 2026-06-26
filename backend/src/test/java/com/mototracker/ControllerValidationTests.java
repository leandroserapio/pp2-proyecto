package com.mototracker;

import com.mototracker.model.Moto;
import com.mototracker.model.Usuario;
import com.mototracker.repository.GastoRepository;
import com.mototracker.repository.MantenimientoRepository;
import com.mototracker.repository.MotoRepository;
import com.mototracker.repository.RecordatorioRepository;
import com.mototracker.repository.UsuarioRepository;
import com.mototracker.repository.ViajeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ControllerValidationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MotoRepository motoRepository;

    @Autowired
    private GastoRepository gastoRepository;

    @Autowired
    private MantenimientoRepository mantenimientoRepository;

    @Autowired
    private ViajeRepository viajeRepository;

    @Autowired
    private RecordatorioRepository recordatorioRepository;

    @BeforeEach
    void cleanDatabase() {
        recordatorioRepository.deleteAll();
        gastoRepository.deleteAll();
        mantenimientoRepository.deleteAll();
        viajeRepository.deleteAll();
        motoRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void crearUsuarioValidoCreaCuenta() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nombre": "Luciano",
                                  "email": "luciano@test.com",
                                  "password": "1234",
                                  "preguntaSecreta": "Color favorito",
                                  "respuestaSecreta": "azul",
                                  "marcaMoto": "Honda",
                                  "modeloMoto": "Wave",
                                  "anioMoto": 2023,
                                  "patenteMoto": "ABC123",
                                  "kilometrajeActualMoto": 1200
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("luciano@test.com"));
    }

    @Test
    void crearGastoRechazaMontoNegativo() throws Exception {
        Moto moto = seedMoto(1500);

        mockMvc.perform(post("/api/gastos/moto/{idMoto}", moto.getIdMoto())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "tipo": "Nafta",
                                  "descripcion": "Carga",
                                  "monto": -10,
                                  "fecha": "2026-06-10"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("mayor a 0")));
    }

    @Test
    void actualizarKilometrajeRechazaValorMenorAlActual() throws Exception {
        Moto moto = seedMoto(1500);

        mockMvc.perform(patch("/api/motos/{idMoto}/actualizar-kilometraje", moto.getIdMoto())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "kilometrajeActual": 1000
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("menor al actual")));
    }

    @Test
    void inicializarRecordatoriosCreaSeisPresets() throws Exception {
        Moto moto = seedMoto(1500);

        mockMvc.perform(post("/api/recordatorios/moto/{idMoto}/inicializar", moto.getIdMoto()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(6));
    }

    @Test
    void actualizarRecordatorioRechazaModoInvalido() throws Exception {
        Moto moto = seedMoto(1500);

        mockMvc.perform(post("/api/recordatorios/moto/{idMoto}/inicializar", moto.getIdMoto()))
                .andExpect(status().isOk());

        Long idRecordatorio = recordatorioRepository.findByMotoIdMoto(moto.getIdMoto()).get(0).getIdRecordatorio();

        mockMvc.perform(put("/api/recordatorios/{idRecordatorio}", idRecordatorio)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "modoAlerta": "INVALIDO"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("modo")));
    }

    private Moto seedMoto(Integer kilometrajeActual) {
        Usuario usuario = new Usuario();
        usuario.setNombre("Test");
        usuario.setEmail("test" + System.nanoTime() + "@mail.com");
        usuario.setPassword("1234");
        usuario.setPreguntaSecreta("Color");
        usuario.setRespuestaSecreta("azul");
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        Moto moto = new Moto();
        moto.setMarca("Honda");
        moto.setModelo("Wave");
        moto.setAnio(2023);
        moto.setPatente("ABC123");
        moto.setKilometrajeActual(kilometrajeActual);
        moto.setFechaUltimaActualizacionKm(LocalDateTime.now());
        moto.setUsuario(usuarioGuardado);
        return motoRepository.save(moto);
    }
}
