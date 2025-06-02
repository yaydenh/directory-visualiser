package com.junyan.backend.scan;

import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class ScanController {

  private final ScanService scanService;

  public ScanController(ScanService scanService) {
    this.scanService = scanService;
  }
  
  @CrossOrigin(origins = "http://127.0.0.1:3000")
  @PostMapping("/scan")
  public ResponseEntity<String> scanDirectory(@RequestBody DirectoryRequest directoryRequest) throws IOException {
    String body = "Scanning directory...";
    scanService.scanDirectory(directoryRequest.getDirectoryPath());
    return ResponseEntity.accepted().body(body);
  }
  
}
