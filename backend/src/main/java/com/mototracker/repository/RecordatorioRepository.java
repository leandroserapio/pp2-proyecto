package com.mototracker.repository;

import com.mototracker.model.Recordatorio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecordatorioRepository extends JpaRepository<Recordatorio, Long> {

    List<Recordatorio> findByMotoIdMoto(Long idMoto);

}