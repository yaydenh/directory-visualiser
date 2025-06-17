package com.junyan.backend.file;

public interface FileSizeView {
  Long getId();
  String getPath();
  Long getSize();
  Boolean getIsDirectory();
}
