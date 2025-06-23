package com.junyan.backend.treemap;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TreeMapController {
  private final TreeMapService treeMapService;

  public TreeMapController(TreeMapService treeMapService) {
    this.treeMapService = treeMapService;
  }

  @PostMapping("/treemap/start")
  public ResponseEntity<String> generateTreeMap(@RequestParam String root, 
                                                   @RequestParam int height,
                                                   @RequestParam int width) {
    treeMapService.startTreeMap(root, height, width);                                              
    return ResponseEntity.accepted().body("Treemap processing started");
  }

  @GetMapping("/treemap/status")
  public ResponseEntity<TreeMapStatusResponse> getStatus() {
    boolean isProcessing = treeMapService.isProcessing();
    boolean hasError = treeMapService.getProcessingError() != null;

    TreeMapStatusResponse response = new TreeMapStatusResponse();
    response.setIsProcessing(isProcessing);
    response.setHasError(hasError);
    response.setErrorMessage(hasError ? treeMapService.getProcessingError().getMessage() : null);

    return ResponseEntity.ok().body(response);
  }

  @GetMapping("/treemap/colours")
  public ResponseEntity<int[]> getPixelColours() {
    return ResponseEntity.ok().body(treeMapService.getRgbGrid());
  }

  @GetMapping("/treemap/colours/extension")
  public ResponseEntity<Map<String, Integer>> getExtensionColour() {
    return ResponseEntity.ok().body(treeMapService.getExtensionColours());
  }

  @GetMapping("/treemap/bounds/file")
  public ResponseEntity<RectDto> getFileBounds(@RequestParam Long fileId) {
    RectDto r = treeMapService.getFileRect(fileId);
    return ResponseEntity.ok().body(r);
  }

  @GetMapping("/treemap/bounds/extension")
  public ResponseEntity<List<RectDto>> getExtensionBounds(@RequestParam String extension) {
    List<RectDto> r = treeMapService.getExtensionRects(extension);
    return ResponseEntity.ok().body(r);
  }

  @GetMapping("/treemap/lookup")
  public ResponseEntity<Long> getRectangleFile(@RequestParam int x, @RequestParam int y) {
    Long fileId = treeMapService.getRectFile(x, y);
    return ResponseEntity.ok().body(fileId);
 }


}
