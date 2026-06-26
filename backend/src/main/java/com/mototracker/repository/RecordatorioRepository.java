package com.mototracker.repository;

import com.mototracker.model.Recordatorio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecordatorioRepository extends JpaRepository<Recordatorio, Long> {

    List<Recordatorio> findByMotoIdMoto(Long idMoto);

    Optional<Recordatorio> findByMotoIdMotoAndTipoRecordatorio(Long idMoto, String tipoRecordatorio);

    void deleteByMotoIdMoto(Long idMoto);
}
