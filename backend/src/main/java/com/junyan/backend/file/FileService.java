package com.junyan.backend.file;

import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;

import java.util.Optional;
import java.nio.file.Paths;
import java.util.Collections;
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

  public File getFileByPath(String path) {
    String absolutePath = Paths.get(path).toAbsolutePath().toString();
    return fileRepository.findByPath(absolutePath);
  }

  public List<Optional<File>> getFiles(List<Long> fileIds) {
    return fileIds.stream()
                  .map(fileRepository::findById)
                  .toList();
  }

  public List<File> getDirectoryChildren(String dirPath) {
    String absolutePath = Paths.get(dirPath).toAbsolutePath().toString();
    int slashCount = (int)absolutePath.chars().filter(c -> c == '/').count();
    try {
      return fileRepository.findDirectoryChildren(absolutePath + "/%", slashCount + 1);
    } catch (Exception e) {
      // doing this for now because repository query throws error when zero rows and idk why
      return Collections.emptyList();
    }
  }

  public List<Long> getDirectoryParents(Long dirId) {
    String path = fileRepository.getPathById(dirId);
    return fileRepository.getDirectoryParents(path);
  }

  public List<ExtensionCount> getExtensionCounts(String root) {
    return fileRepository.getExtensionCounts(root);
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
