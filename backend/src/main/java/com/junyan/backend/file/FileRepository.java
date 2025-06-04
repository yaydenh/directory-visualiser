package com.junyan.backend.file;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;;

public interface FileRepository extends JpaRepository<File, Long> {

  public boolean existsByPath(String path);

  @Modifying
  @Query(value = "UPDATE file_seq SET next_val = 1", nativeQuery = true)
  void resetFileSequence();
}
