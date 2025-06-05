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
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.junyan.backend.file.File;
import com.junyan.backend.file.FileService;

@Service
public class ScanService {

  private List<File> buffer = new ArrayList<>();
  private final int BATCH_SIZE = 500;

  private ExecutorService executor = Executors.newSingleThreadExecutor();
  private volatile boolean scanInProgress = false;
  private volatile Throwable scanError = null;

  private final FileService fileService;

  public ScanService(FileService fileService) {
    this.fileService = fileService;
  }

  public void scanDirectory(String dirPath) {
    Path start = Paths.get(dirPath);
    if (!Files.exists(start) || !Files.isDirectory(start)) {
      throw new IllegalArgumentException("Invalid path: " + dirPath);
    }

    scanInProgress = true;
    scanError = null;

    executor.execute(() -> {
      try {
        Files.walkFileTree(start, new DirectoryScanner());
        if (!buffer.isEmpty()) {
          fileService.saveAllFiles(new ArrayList<>(buffer));
          buffer.clear();
        }
      } catch (IOException e) {
        scanError = e;
      } finally {
        scanInProgress = false;
      }
    });
  }


  public Throwable getScanError() {
    return scanError;
  }

  public boolean scanInProgress() {
    return scanInProgress;
  }

  private class DirectoryScanner extends SimpleFileVisitor<Path> {
    private void batchInsert() {
      if (buffer.size() >= BATCH_SIZE) {
        fileService.saveAllFiles(new ArrayList<>(buffer));
        buffer.clear();
      }
    }

    @Override
    public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
      String filename = file.getFileName().toString();
      String extension = "";
      int i = filename.lastIndexOf(".");
      if (i > 0) {
        extension = filename.substring(i + 1);
      }

      File fileToDb = new File(
        file.toAbsolutePath().toString(),
        attrs.size(),
        extension,
        LocalDateTime.ofInstant(attrs.creationTime().toInstant(), ZoneId.systemDefault()),
        LocalDateTime.ofInstant(attrs.lastModifiedTime().toInstant(), ZoneId.systemDefault()),
        false
      );

      buffer.add(fileToDb);
      batchInsert();

      return CONTINUE;
    }

    @Override
    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
      File dirToDb = new File(
        dir.toAbsolutePath().toString(),
        0L,
        "",
        LocalDateTime.ofInstant(attrs.creationTime().toInstant(), ZoneId.systemDefault()),
        LocalDateTime.ofInstant(attrs.lastModifiedTime().toInstant(), ZoneId.systemDefault()),
        true
      );

      buffer.add(dirToDb);
      batchInsert();

      return CONTINUE;
    }
  }
}
