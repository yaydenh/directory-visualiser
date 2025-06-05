package com.junyan.backend.file;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
@Table(indexes = @Index(name = "path_index", columnList = "path", unique = true))
public class File {
  
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE)
  private Long id;

  private String path;
  private Long size;
  private String extension;
  private LocalDateTime created;
  private LocalDateTime lastModified;
  private boolean isDirectory;

  public File() {
  }

  public File(String path, Long size, String extension, LocalDateTime created, LocalDateTime lastModified, boolean isDirectory) {
    this.path = path;
    this.size = size;
    this.extension = extension;
    this.created = created;
    this.lastModified = lastModified;
    this.isDirectory = isDirectory;
  }

    public File(Long id, String path, Long size, String extension, LocalDateTime created, LocalDateTime lastModified, boolean isDirectory) {
    this.id = id;
    this.path = path;
    this.size = size;
    this.extension = extension;
    this.created = created;
    this.lastModified = lastModified;
    this.isDirectory = isDirectory;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public Long getSize() {
    return size;
  }

  public void setSize(Long size) {
    this.size = size;
  }

  public String getExtension() {
    return extension;
  }

  public void setExtension(String extension) {
    this.extension = extension;
  }

  public LocalDateTime getCreated() {
    return created;
  }

  public void setCreated(LocalDateTime created) {
    this.created = created;
  }

  public LocalDateTime getLastModified() {
    return lastModified;
  }

  public void setLastModified(LocalDateTime lastModified) {
    this.lastModified = lastModified;
  }

  public boolean isDirectory() {
    return isDirectory;
  }

  public void setDirectory(boolean isDirectory) {
    this.isDirectory = isDirectory;
  }
}
