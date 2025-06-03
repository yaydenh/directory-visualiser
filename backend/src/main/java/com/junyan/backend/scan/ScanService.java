package com.junyan.backend.scan;

import org.springframework.stereotype.Service;

import static java.nio.file.FileVisitResult.CONTINUE;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.junyan.backend.file.File;
import com.junyan.backend.file.FileService;

@Service
public class ScanService {

  private ExecutorService executor = Executors.newSingleThreadExecutor();

  private final FileService fileService;

  public ScanService(FileService fileService) {
    this.fileService = fileService;
  }

  public void scanDirectory(String dirPath) {
    Path start = Paths.get(dirPath);
    if (!Files.exists(start) || !Files.isDirectory(start)) {
      throw new IllegalArgumentException("Invalid path: " + dirPath);
    }

    executor.execute(() -> {
      try {
        Files.walkFileTree(start, new DirectoryScanner());
      } catch (IOException e) {
        e.printStackTrace();
      }
    });
  }

  private class DirectoryScanner extends SimpleFileVisitor<Path> {

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attr) {
      String filename = file.getFileName().toString();
      String extension = "";
      int i = filename.lastIndexOf(".");
      if (i > 0) {
        extension = filename.substring(i + 1);
      }

      // add to DB
      File fileToDb = new File(
        file.toAbsolutePath().toString(),
        attr.size(),
        extension,
        LocalDateTime.ofInstant(attr.creationTime().toInstant(), ZoneId.systemDefault()),
        LocalDateTime.ofInstant(attr.lastModifiedTime().toInstant(), ZoneId.systemDefault())
      );

      fileService.saveFile(fileToDb);

      return CONTINUE;
    }
  }
}
