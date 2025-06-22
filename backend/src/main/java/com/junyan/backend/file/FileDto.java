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
  @PositiveOrZero(message = "Size should be positive or zero")
  private Long size;

  @PositiveOrZero(message = "NumItems should be positive or zero")
  private Integer numItems;
  
  @PositiveOrZero(message = "NumFiles should be positive or zero")
  private Integer numFiles;

  private String extension;

  @NotNull(message = "Created cannot be null")
  @PastOrPresent(message = "Created cannot be in the future")
  private LocalDateTime created;

  @NotNull(message = "LastModified cannot be null")
  @PastOrPresent(message = "LastModified cannot be in the future")
  private LocalDateTime lastModified;

  @NotNull(message = "isDirectory cannot be null")
  private boolean isDirectory;

  @NotNull(message = "depth cannot be null")
  private int depth;

  public FileDto() {};

  public FileDto(Long id,
                 String path,
                 Long size,
                 Integer numItems,
                 Integer numFiles,
                 String extension,
                 LocalDateTime created,
                 LocalDateTime lastModified,
                 boolean isDirectory,
                 int depth) {
    this.id = id;
    this.path = path;
    this.size = size;
    this.numItems = numItems;
    this.numFiles = numFiles;
    this.extension = extension;
    this.created = created;
    this.lastModified = lastModified;
    this.isDirectory = isDirectory;
    this.depth = depth;
  }

  public FileDto(String path,
                 Long size,
                 Integer numItems,
                 Integer numFiles,
                 String extension,
                 LocalDateTime created,
                 LocalDateTime lastModified,
                 boolean isDirectory,
                 int depth) {
    this.path = path;
    this.size = size;
    this.numItems = numItems;
    this.numFiles = numFiles;
    this.extension = extension;
    this.created = created;
    this.lastModified = lastModified;
    this.isDirectory = isDirectory;
    this.depth = depth;
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
  public Integer getNumItems() {
    return numItems;
  }
  public void setNumItems(Integer numItems) {
    this.numItems = numItems;
  }
  public Integer getNumFiles() {
    return numFiles;
  }
  public void setNumFiles(Integer numFiles) {
    this.numFiles = numFiles;
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
  public int getDepth() {
    return depth;
  }
  public void setDepth(int depth) {
    this.depth = depth;
  }
}
