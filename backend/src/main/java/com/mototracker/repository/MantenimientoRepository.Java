package com.mototracker.repository;

import com.mototracker.model.Mantenimiento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MantenimientoRepository extends JpaRepository<Mantenimiento, Long> {
}