package com.junyan.backend.scan;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.ResponseEntity;
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
  public ResponseEntity<ScanStatusResponse> getScanStatus() {
    boolean inProgress = scanService.scanInProgress();
    boolean hasError = scanService.getScanError() != null;

    ScanStatusResponse response = new ScanStatusResponse();
    response.setInProgress(inProgress);
    response.setHasError(hasError);
    response.setErrorMessage(hasError ? scanService.getScanError().getMessage() : null);

    return ResponseEntity.ok().body(response);
  }
}
