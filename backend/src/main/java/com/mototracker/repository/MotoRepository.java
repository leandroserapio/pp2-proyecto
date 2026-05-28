package com.mototracker.repository;

import com.mototracker.model.Moto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MotoRepository extends JpaRepository<Moto, Long> {

    List<Moto> findByUsuarioIdUsuario(Long idUsuario);
}