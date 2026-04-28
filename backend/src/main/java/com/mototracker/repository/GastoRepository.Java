package com.mototracker.repository;

import com.mototracker.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GastoRepository extends JpaRepository<Gasto, Long> {

    List<Gasto> findByMotoIdMoto(Long idMoto);
}