package com.mototracker.dto;

public class RegistroUsuarioRequest {

    private String nombre;
    private String email;
    private String password;
    private String preguntaSecreta;
    private String respuestaSecreta;
    private String marcaMoto;
    private String modeloMoto;
    private Integer anioMoto;
    private String patenteMoto;
    private Integer kilometrajeActualMoto;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPreguntaSecreta() {
        return preguntaSecreta;
    }

    public void setPreguntaSecreta(String preguntaSecreta) {
        this.preguntaSecreta = preguntaSecreta;
    }

    public String getRespuestaSecreta() {
        return respuestaSecreta;
    }

    public void setRespuestaSecreta(String respuestaSecreta) {
        this.respuestaSecreta = respuestaSecreta;
    }

    public String getMarcaMoto() {
        return marcaMoto;
    }

    public void setMarcaMoto(String marcaMoto) {
        this.marcaMoto = marcaMoto;
    }

    public String getModeloMoto() {
        return modeloMoto;
    }

    public void setModeloMoto(String modeloMoto) {
        this.modeloMoto = modeloMoto;
    }

    public Integer getAnioMoto() {
        return anioMoto;
    }

    public void setAnioMoto(Integer anioMoto) {
        this.anioMoto = anioMoto;
    }

    public String getPatenteMoto() {
        return patenteMoto;
    }

    public void setPatenteMoto(String patenteMoto) {
        this.patenteMoto = patenteMoto;
    }

    public Integer getKilometrajeActualMoto() {
        return kilometrajeActualMoto;
    }

    public void setKilometrajeActualMoto(Integer kilometrajeActualMoto) {
        this.kilometrajeActualMoto = kilometrajeActualMoto;
    }
}
