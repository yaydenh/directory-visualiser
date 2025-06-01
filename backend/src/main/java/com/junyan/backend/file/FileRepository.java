package com.junyan.backend.file;

import org.springframework.data.jpa.repository.JpaRepository;;

public interface FileRepository extends JpaRepository<File, Long> {

  public boolean existsByPath(String path);
}
