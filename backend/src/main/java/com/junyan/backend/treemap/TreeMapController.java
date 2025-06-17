package com.junyan.backend.treemap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TreeMapController {
  private final TreeMapService treeMapService;

  public TreeMapController(TreeMapService treeMapService) {
    this.treeMapService = treeMapService;
  }

  @GetMapping("/treemap")
  public ResponseEntity<String> generateTreeMap(@RequestParam String root, 
                                                   @RequestParam int height,
                                                   @RequestParam int width) {
    treeMapService.startTreeMap(root, height, width);                                              
    return ResponseEntity.ok().body("hi");
  }

  @GetMapping("/treemap/colours")
  public ResponseEntity<int[]> getPixelColours() {
    return ResponseEntity.ok().body(treeMapService.getRgbGrid());
  }

  @GetMapping("/treemap/{fileId}")
  public ResponseEntity<RectDto> getFileBounds(@PathVariable Long fileId) {
    RectDto r = treeMapService.getFileRect(fileId);
    return ResponseEntity.ok().body(r);
  }

}
