package com.junyan.backend.scan;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class ScanController {

  public final ScanService scanService;

  public ScanController(ScanService scanService) {
    this.scanService = scanService;
  }
  
  @CrossOrigin(origins = "http://127.0.0.1:3000")
  @PostMapping("/scan")
  public ResponseEntity<String> scanDirectory(@RequestBody String dirPath) {
      String body = "Scanning directory...";
      return ResponseEntity.accepted().body(body);
  }
  
}
