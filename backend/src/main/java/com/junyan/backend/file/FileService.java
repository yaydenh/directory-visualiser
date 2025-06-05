package com.junyan.backend.file;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.util.Optional;
import java.util.ArrayList;
import java.util.List;

@Service
public class FileService {
  
  private FileRepository fileRepository;

  public FileService(FileRepository fileRepository) {
    this.fileRepository = fileRepository;
  }

  public File saveFile(File file) {
    return fileRepository.save(file);
  }

  @Transactional
  public void saveAllFiles(List<File> files) {
    fileRepository.saveAll(files);
    fileRepository.flush();
  }

  public Optional<File> getFile(Long fileId) {
    return fileRepository.findById(fileId);
  }

  public List<Optional<File>> getFiles(List<Long> fileIds) {
    return fileIds.stream()
                  .map(fileRepository::findById)
                  .toList();
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

  public void deleteFile(Long fileId) {
    fileRepository.deleteById(fileId);
    fileRepository.resetFileSequence();
  }

  @Transactional
  public void deleteAll() {
    fileRepository.deleteAll();
  }
}
