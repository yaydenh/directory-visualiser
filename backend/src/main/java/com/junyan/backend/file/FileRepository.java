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
    FROM file_entity AS f
    WHERE f.path LIKE :directoryPath
    AND f.depth = :depth
    ORDER BY f.is_directory DESC, f.size DESC
  """, nativeQuery = true)
  List<File> findDirectoryChildren(@Param("directoryPath") String directoryPath,
                                   @Param("depth") int depth);

  @Query(value = """
    SELECT f.id AS id, f.size AS size
    FROM file_entity AS f
    WHERE f.path = :path
  """, nativeQuery = true)
  FileSizeView getSizeByPath(@Param("path") String path);

  @Query(value = """
  SELECT f.id AS id, f.size AS size, f.path AS path, f.is_directory AS isDirectory, f.extension AS extension
  FROM file_entity AS f
  WHERE f.path LIKE :directoryPath
  AND f.depth = :depth
  ORDER BY f.size DESC
  """, nativeQuery = true)
  List<FileSizeView> getDirectoryChildrenSize(@Param("directoryPath") String directoryPath,
                                   @Param("depth") int depth);

  @Query(value = "SELECT path FROM file_entity WHERE id = :id", nativeQuery = true)
  String getPathById(@Param("id") Long id);
                                   
  @Query(value = """
    SELECT f.id
    FROM file_entity as f
    WHERE :directoryPath LIKE f.path || "%"
    AND f.is_directory = true
    ORDER BY LENGTH(f.path)
  """, nativeQuery = true)
  List<Long> getDirectoryParents(@Param("directoryPath") String directoryPath);
}
