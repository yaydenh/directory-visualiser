package com.junyan.backend.file;

import org.springframework.stereotype.Component;

@Component
public class FileMapper {
  public FileDto toDto(File file) {
    return new FileDto(
      file.getId(),
      file.getPath(),
      file.getSize(),
      file.getExtension(),
      file.getCreated(),
      file.getLastModified()
    );
  }

  public File toFile(FileDto fileDto) {
    return new File(
      fileDto.getPath(),
      fileDto.getSize(),
      fileDto.getExtension(),
      fileDto.getCreated(),
      fileDto.getLastModified()
    );
  }
}
