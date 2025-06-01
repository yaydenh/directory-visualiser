package com.junyan.backend.file;

import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class FileService {
  
  private FileRepository fileRepository;

  public FileService(FileRepository fileRepository) {
    this.fileRepository = fileRepository;
  }

  public File saveFile(File file) {
    return fileRepository.save(file);
  }

  public Optional<File> getFile(long fileId) {
    return fileRepository.findById(fileId);
  }

  public File updateFile(File file) {
    File oldFile = fileRepository.getReferenceById(file.getId());
    oldFile.setId(file.getId());
    oldFile.setPath(file.getPath());
    oldFile.setSize(file.getSize());
    oldFile.setExtension(file.getExtension());
    oldFile.setCreated(file.getCreated());
    oldFile.setLastModified(file.getLastModified());

    return fileRepository.save(oldFile);
  }

  public void deleteFile(long fileId) {
    fileRepository.deleteById(fileId);
  }
}
