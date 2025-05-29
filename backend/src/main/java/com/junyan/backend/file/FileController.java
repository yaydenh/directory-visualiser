package com.junyan.backend.file;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/files")
public class FileController {
  
  private final FileService fileService;

  public FileController(FileService fileService) {
    this.fileService = fileService;
  }

  @CrossOrigin(origins = { "http://localhost:3000", "http://127.0.0.1:3000"})
  @PostMapping("/directory")
  public String scanDirectory(@RequestBody String directoryPath) {
      System.out.println(directoryPath);
      return fileService.scanDirectory(directoryPath);
  }
  
}
