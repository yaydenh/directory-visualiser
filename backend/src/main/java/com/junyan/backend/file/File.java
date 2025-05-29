package com.junyan.backend.file;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;

@Entity
public class File {
  
  @Id
  @GeneratedValue
  private long id;

  private String path;
  private long size;
  private String extension;
  private LocalDateTime created;
  private LocalDateTime lastModified;

  public File() {

  }

  public File(String path) {

  }
}
