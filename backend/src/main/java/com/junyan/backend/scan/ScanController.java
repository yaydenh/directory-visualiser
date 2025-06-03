package com.junyan.backend.scan;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class ScanController {

  private final ScanService scanService;

  public ScanController(ScanService scanService) {
    this.scanService = scanService;
  }

  @PostMapping("/scan")
  public ResponseEntity<String> scanDirectory(@RequestBody DirectoryRequest directoryRequest) {
    String body = "Scanning directory...";
    scanService.scanDirectory(directoryRequest.getDirectoryPath());
    return ResponseEntity.accepted().body(body);
  }

  @GetMapping("/scan/status")
  public ResponseEntity<Boolean> getScanStatus() {
    boolean scanInProgress = scanService.scanInProgress();
    return ResponseEntity.ok().body(scanInProgress);
  }
}
