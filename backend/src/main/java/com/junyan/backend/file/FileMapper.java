package com.junyan.backend.file;

import org.springframework.stereotype.Component;

@Component
public class FileMapper {
  public FileDto toDto(File file) {
    return new FileDto(
      file.getId(),
      file.getPath(),
      file.getSize(),
      file.getNumItems(),
      file.getNumFiles(),
      file.getExtension(),
      file.getCreated(),
      file.getLastModified(),
      file.isDirectory(),
      file.getDepth()
    );
  }

  public File toFile(FileDto fileDto) {
    return new File(
      fileDto.getPath(),
      fileDto.getSize(),
      fileDto.getNumItems(),
      fileDto.getNumFiles(),
      fileDto.getExtension(),
      fileDto.getCreated(),
      fileDto.getLastModified(),
      fileDto.isDirectory(),
      fileDto.getDepth()
    );
  }
}
