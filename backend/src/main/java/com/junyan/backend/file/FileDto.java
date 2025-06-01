package com.junyan.backend.file;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;

public class FileDto {

  private Long id;

  @NotNull(message = "Path cannot be null")
  private String path;

  @NotNull(message = "Size cannot be null")
  @PositiveOrZero(message = "Size should not be positive or zero")
  private Long size;

  @NotNull(message = "Extension cannot be null")
  private String extension;

  @NotNull(message = "Created cannot be null")
  @PastOrPresent(message = "Created cannot be in the future")
  private LocalDateTime created;

  @NotNull(message = "LastModified cannot be null")
  @PastOrPresent(message = "LastModified cannot be in the future")
  private LocalDateTime lastModified;

  public FileDto() {};

  public FileDto(Long id, String path, Long size, String extension, LocalDateTime created, LocalDateTime lastModified) {
    this.id = id;
    this.path = path;
    this.size = size;
    this.extension = extension;
    this.created = created;
    this.lastModified = lastModified;
  }

  public FileDto(String path, Long size, String extension, LocalDateTime created, LocalDateTime lastModified) {
    this.path = path;
    this.size = size;
    this.extension = extension;
    this.created = created;
    this.lastModified = lastModified;
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
}
