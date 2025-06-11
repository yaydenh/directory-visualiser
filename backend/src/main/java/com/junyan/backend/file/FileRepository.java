package com.junyan.backend.file;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;;

public interface FileRepository extends JpaRepository<File, Long> {

  public boolean existsByPath(String path);
  public File findByPath(String path);

  @Modifying
  @Query(value = "UPDATE file_seq SET next_val = 1", nativeQuery = true)
  void resetFileSequence();
  
  @Query(value = """
    SELECT *
    FROM file_entity as f
    WHERE f.path LIKE :directoryPath
    AND f.depth = :depth
    ORDER BY f.is_directory DESC, f.path
  """, nativeQuery = true)
  List<File> findDirectoryChildren(@Param("directoryPath") String directoryPath,
                                   @Param("depth") int depth);
}
