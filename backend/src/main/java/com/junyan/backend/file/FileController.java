package com.junyan.backend.file;

import java.net.URI;
import java.util.Optional;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/files")
public class FileController {
  
  private final FileService fileService;
  private final FileRepository fileRepository;
  private final FileMapper fileMapper;

  public FileController(FileService fileService, FileRepository fileRepository, FileMapper fileMapper) {
    this.fileService = fileService;
    this.fileRepository = fileRepository;
    this.fileMapper = fileMapper;
  }

  @CrossOrigin(origins = "http://127.0.0.1:3000")
  @GetMapping("/{id}")
  public ResponseEntity<FileDto> getFile(@PathVariable long fileId) {
    Optional<File> file = fileService.getFile(fileId);

    if (!file.isPresent()) return ResponseEntity.notFound().build();

    FileDto fileDto = fileMapper.toDto(file.get());
    return ResponseEntity.ok().body(fileDto);
  }

  @CrossOrigin(origins = "http://127.0.0.1:3000")
  @PostMapping
  public ResponseEntity<FileDto> addFile(@RequestBody FileDto fileDto) {
    System.out.println("HELLO");
    if (fileRepository.existsByPath(fileDto.getPath())) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(fileDto);
    }

    File file = fileMapper.toFile(fileDto);
    File created = fileService.saveFile(file);
    URI location = URI.create("/files/" + created.getId());
    return ResponseEntity.created(location).body(fileDto);
  }

  @CrossOrigin(origins = "http://127.0.0.1:3000")
  @PutMapping("/{id}")
  public ResponseEntity<FileDto> updateFile(@PathVariable Long id, @RequestBody FileDto fileDto) {
    File file = fileMapper.toFile(fileDto);
    fileService.updateFile(file);
    return ResponseEntity.ok().body(fileDto);
  }


  @CrossOrigin(origins = "http://127.0.0.1:3000")
  @DeleteMapping("/{id}")
  public ResponseEntity<String> deleteFile(@PathVariable long id) {
    fileService.deleteFile(id);
    return ResponseEntity.noContent().build();
  }
}
