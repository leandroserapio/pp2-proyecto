package com.mototracker.controller;

import com.mototracker.dto.EstimarRutaRequest;
import com.mototracker.dto.EstimarRutaResponse;
import com.mototracker.exception.BadRequestException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/api/rutas")
@CrossOrigin(origins = "*")
public class RutaController {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    private static final String OSRM_URL = "https://router.project-osrm.org/route/v1/driving";
    private static final String ARGLY_FUEL_URL = "https://api.argly.com.ar/v1/combustibles/promedio";
    private static final String DEFAULT_FUEL = "nafta-super";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(12))
            .build();
    private final ObjectMapper objectMapper;

    public RutaController(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostMapping("/estimar")
    public EstimarRutaResponse estimarRuta(@RequestBody EstimarRutaRequest request) throws IOException, InterruptedException {
        if (request.getSalida() == null || request.getSalida().isBlank()) {
            throw new BadRequestException("La salida es obligatoria.");
        }
        if (request.getDestino() == null || request.getDestino().isBlank()) {
            throw new BadRequestException("El destino es obligatorio.");
        }
        if (request.getKilometrosPorLitro() == null || request.getKilometrosPorLitro() <= 0) {
            throw new BadRequestException("Ingresá un rendimiento válido en KM/L.");
        }

        Lugar salida = geocodificar(request.getSalida(), "salida");
        Thread.sleep(1100);
        Lugar destino = geocodificar(request.getDestino(), "destino");
        Ruta ruta = calcularRuta(salida, destino);
        PrecioCombustible precio = buscarPrecioCombustible(destino.provinciaSlug());

        BigDecimal costo = null;
        if (precio != null) {
            costo = BigDecimal.valueOf(ruta.kilometros())
                    .divide(BigDecimal.valueOf(request.getKilometrosPorLitro()), 6, RoundingMode.HALF_UP)
                    .multiply(precio.precioPorLitro())
                    .setScale(0, RoundingMode.HALF_UP);
        }

        return new EstimarRutaResponse(
                ruta.kilometros(),
                formatearDuracion(ruta.duracionSegundos()),
                salida.displayName(),
                destino.displayName(),
                precio != null ? precio.provincia() : destino.provinciaSlug(),
                precio != null ? precio.combustible() : "Nafta Super",
                precio != null ? precio.precioPorLitro() : null,
                costo
        );
    }

    private Lugar geocodificar(String query, String campo) throws IOException, InterruptedException {
        String url = NOMINATIM_URL
                + "?q=" + encode(query)
                + "&format=jsonv2&limit=1&addressdetails=1&accept-language=es";
        JsonNode results = getJson(url, true);
        if (!results.isArray() || results.isEmpty()) {
            throw new BadRequestException("No se encontró la " + campo + ". Probá con ciudad y provincia.");
        }

        JsonNode place = results.get(0);
        double latitude = place.path("lat").asDouble(Double.NaN);
        double longitude = place.path("lon").asDouble(Double.NaN);
        if (Double.isNaN(latitude) || Double.isNaN(longitude)) {
            throw new BadRequestException("La " + campo + " no devolvió coordenadas válidas.");
        }

        String displayName = place.path("display_name").asText(query);
        String province = inferirProvincia(place, displayName);
        return new Lugar(latitude, longitude, displayName, province);
    }

    private Ruta calcularRuta(Lugar salida, Lugar destino) throws IOException, InterruptedException {
        String coordinates = salida.longitude() + "," + salida.latitude() + ";" + destino.longitude() + "," + destino.latitude();
        String url = OSRM_URL + "/" + coordinates + "?overview=false&alternatives=false&steps=false";
        JsonNode body = getJson(url, false);
        JsonNode route = body.path("routes").isArray() && !body.path("routes").isEmpty()
                ? body.path("routes").get(0)
                : null;
        if (!"Ok".equals(body.path("code").asText()) || route == null) {
            throw new BadRequestException(body.path("message").asText("No se encontró una ruta entre esos puntos."));
        }

        int kilometers = Math.max(1, (int) Math.round(route.path("distance").asDouble() / 1000));
        long durationSeconds = Math.max(60, Math.round(route.path("duration").asDouble()));
        return new Ruta(kilometers, durationSeconds);
    }

    private PrecioCombustible buscarPrecioCombustible(String provinciaSlug) throws IOException, InterruptedException {
        if (provinciaSlug == null || provinciaSlug.isBlank()) return null;

        String url = ARGLY_FUEL_URL
                + "?provincia=" + encode(provinciaSlug)
                + "&combustible=" + DEFAULT_FUEL;
        JsonNode body;
        try {
            body = getJson(url, false);
        } catch (BadRequestException ex) {
            return null;
        }
        JsonNode data = body.path("data");
        BigDecimal precio = data.path("precio_promedio").decimalValue();
        if (precio == null || precio.compareTo(BigDecimal.ZERO) <= 0) return null;

        return new PrecioCombustible(
                data.path("provincia").asText(provinciaSlug),
                data.path("combustible").asText("Nafta Super"),
                precio
        );
    }

    private JsonNode getJson(String url, boolean nominatim) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(20))
                .header("Accept", "application/json");
        if (nominatim) {
            builder.header("User-Agent", "MotoTracker/1.0");
        }

        HttpResponse<String> response = httpClient.send(builder.GET().build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new BadRequestException("No se pudo consultar el servicio de rutas.");
        }
        return objectMapper.readTree(response.body());
    }

    private String inferirProvincia(JsonNode place, String displayName) {
        JsonNode address = place.path("address");
        List<String> candidates = List.of(
                address.path("state").asText(""),
                address.path("province").asText(""),
                address.path("region").asText(""),
                displayName
        );

        for (String candidate : candidates) {
            String slug = provinciaSlug(candidate);
            if (slug != null) return slug;
        }
        return null;
    }

    private String provinciaSlug(String text) {
        String normalized = text == null ? "" : normalizar(text);
        List<Provincia> provincias = List.of(
                new Provincia("buenos-aires", List.of("buenos aires", "provincia de buenos aires")),
                new Provincia("catamarca", List.of("catamarca")),
                new Provincia("chaco", List.of("chaco")),
                new Provincia("chubut", List.of("chubut")),
                new Provincia("cordoba", List.of("cordoba")),
                new Provincia("corrientes", List.of("corrientes")),
                new Provincia("entre-rios", List.of("entre rios")),
                new Provincia("formosa", List.of("formosa")),
                new Provincia("jujuy", List.of("jujuy")),
                new Provincia("la-pampa", List.of("la pampa")),
                new Provincia("la-rioja", List.of("la rioja")),
                new Provincia("mendoza", List.of("mendoza")),
                new Provincia("misiones", List.of("misiones")),
                new Provincia("neuquen", List.of("neuquen")),
                new Provincia("rio-negro", List.of("rio negro")),
                new Provincia("salta", List.of("salta")),
                new Provincia("san-juan", List.of("san juan")),
                new Provincia("san-luis", List.of("san luis")),
                new Provincia("santa-cruz", List.of("santa cruz")),
                new Provincia("santa-fe", List.of("santa fe")),
                new Provincia("santiago-del-estero", List.of("santiago del estero")),
                new Provincia("tierra-del-fuego", List.of("tierra del fuego")),
                new Provincia("tucuman", List.of("tucuman"))
        );

        return provincias.stream()
                .filter(provincia -> provincia.labels().stream().anyMatch(normalized::contains))
                .map(Provincia::slug)
                .findFirst()
                .orElse(null);
    }

    private String normalizar(String value) {
        return java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
    }

    private String formatearDuracion(long seconds) {
        long totalMinutes = Math.max(1, Math.round(seconds / 60.0));
        long hours = totalMinutes / 60;
        long minutes = totalMinutes % 60;
        if (hours <= 0) return minutes + " min";
        if (minutes <= 0) return hours + " h";
        return hours + " h " + minutes + " min";
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private record Lugar(double latitude, double longitude, String displayName, String provinciaSlug) {}
    private record Ruta(int kilometros, long duracionSegundos) {}
    private record PrecioCombustible(String provincia, String combustible, BigDecimal precioPorLitro) {}
    private record Provincia(String slug, List<String> labels) {}
}
