package com.junyan.backend.file;

public interface FileSizeView {
  Long getId();
  String getPath();
  String getExtension();
  Long getSize();
  Boolean getIsDirectory();
}
