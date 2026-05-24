package com.mototracker.dto;

public class PreguntaSecretaResponse {

    private String email;
    private String preguntaSecreta;

    public PreguntaSecretaResponse(String email, String preguntaSecreta) {
        this.email = email;
        this.preguntaSecreta = preguntaSecreta;
    }

    public String getEmail() {
        return email;
    }

    public String getPreguntaSecreta() {
        return preguntaSecreta;
    }
}
