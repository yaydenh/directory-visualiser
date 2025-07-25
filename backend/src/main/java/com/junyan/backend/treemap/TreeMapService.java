package com.junyan.backend.treemap;

import java.nio.file.Paths;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.stereotype.Service;

import com.junyan.backend.file.FileRepository;
import com.junyan.backend.file.FileSizeView;

@Service
public class TreeMapService {
  
  private final FileRepository fileRepository;

  private static class Node {
    long id;
    double area;
    String path;
    String extension;
    boolean isDirectory;

    public Node(long id, double area, String path, String extension, boolean isDirectory) {
      this.id = id;
      this.area = area;
      this.path = path;
      this.extension = extension;
      this.isDirectory = isDirectory;
    }
  }

  private static class Rect {
    double x, y;
    double height, width;

    public Rect(double x, double y, double height, double width) {
      this.x = x;
      this.y = y;
      this.height = height;
      this.width = width;
    }

    public double shortestSide() {
      return Math.min(height, width);
    }

    @Override
    public String toString() {
      return "Rect [x=" + x + ", y=" + y + ", height=" + height + ", width=" + width + "]";
    }
  }

  private static class StackFrame {
    List<Node> children;
    List<Node> row;
    double length;

    public StackFrame(List<Node> children, List<Node> row, double length) {
      this.children = children;
      this.row = row;
      this.length = length;
    }
  }

  private ExecutorService executor = Executors.newSingleThreadExecutor();

  private volatile boolean isProcessing = false;
  private volatile Throwable processingError = null;

  private final Map<String, Integer> extToColour = new HashMap<>();
  private final Map<Long, Rect> fileToRect = new HashMap<>();
  private Rect currRect;

  private int gridHeight;
  private int gridWidth;
  private int[] rgbGrid;
  private long[] fileIdGrid;

  private final Random random = new Random();

  public TreeMapService(FileRepository fileRepository) {
    this.fileRepository = fileRepository;
  }

  // public void reset() {
  //   processingFinished = false;
  //   processingError = null;

  //   extToColour.clear();
  //   fileToRect.clear();

  //   currRect = null;
  //   gridHeight = 0;
  //   gridWidth = 0;
  //   rgbGrid = null;
  //   fileIdGrid = null;
  // }

  public int[] getRgbGrid() {
    return rgbGrid;
  }

  public boolean isProcessing() {
    return isProcessing;
  }

  public Throwable getProcessingError() {
    return processingError;
  }

  public RectDto getFileRect(Long fileId) {
    Rect rect = fileToRect.get(fileId);
    if (rect == null) return null;
    return new RectDto(
      (int)Math.round(rect.x),
      (int)Math.round(rect.y),
      (int)Math.round(rect.height),
      (int)Math.round(rect.width)
    );
  }

  public List<RectDto> getExtensionRects(String extension) {
    List<Long> fileIds = fileRepository.getFileIdsByExtension(extension);
    return fileIds
           .stream()
           .map(this::getFileRect)
           .filter(Objects::nonNull)
           .toList();
  }

  public Long getRectFile(int x, int y) {
    int index = (y * gridWidth) + x;
    return fileIdGrid[index];
  }

  public Map<String, Integer> getExtensionColours() {
    return extToColour;
  }

  public void startTreeMap(Long rootId, int height, int width, boolean resetColours) {
    if (isProcessing) return;
    
    isProcessing = true;
    processingError = null;

    if (resetColours) extToColour.clear();
    fileToRect.clear();

    currRect = new Rect(0, 0, height, width);
    gridHeight = height;
    gridWidth = width;
    rgbGrid = new int[height * width];
    fileIdGrid = new long[height * width];

    executor.execute(() -> {
      try {
        String absolutePath = fileRepository.getPathById(rootId);
        FileSizeView rootSize = fileRepository.getSizeByPath(absolutePath);

        fileToRect.put(rootSize.getId(), currRect);
        generateTreeMap(absolutePath, height, width);
      } catch (Exception e) {
        processingError = e;
      } finally {
        isProcessing = false;;
      }
    });
  }

  private void generateTreeMap(String root, double height, double width) {

    // get total size of children
    // (our db stores this so no need to calculate this again)
    // for each child, calc percentage size and allocate area
    String absolutePath = Paths.get(root).toAbsolutePath().toString();
    int slashCount = (int)absolutePath.chars().filter(c -> c == '/').count();
    FileSizeView rootSize = fileRepository.getSizeByPath(absolutePath);
    List<FileSizeView> children = fileRepository.getDirectoryChildrenSize(root + "/%", slashCount + 1);

    double totalArea = height * width;
    List<Node> childNodes = new ArrayList<>();
    for (FileSizeView child : children) {
      double allocatedArea = (double) child.getSize() / rootSize.getSize() * totalArea;
      if (allocatedArea > 1) childNodes.add(new Node(child.getId(), allocatedArea, child.getPath(), child.getExtension(), child.getIsDirectory()));
    }

    currRect = fileToRect.get(rootSize.getId());
    squarify(childNodes, new ArrayList<>(), currRect.shortestSide(), 0);

    // for each child directory,
    // recurse
    for (Node child : childNodes) {
      if (child.isDirectory) {
        Rect childRect = fileToRect.get(child.id);
        generateTreeMap(child.path, childRect.height, childRect.width);
      }
    }
  }

  // https://vanwijk.win.tue.nl/stm.pdf
  private void squarify(List<Node> children, List<Node> row, double length, int depth) {

    Deque<StackFrame> stack = new ArrayDeque<>();
    stack.push(new StackFrame(children, row, length));

    while (!stack.isEmpty()) {
      StackFrame sf = stack.pop();

      if (sf.children.isEmpty()) {
        if (!sf.row.isEmpty()) layoutRow(sf.row);
        return;
      }

      Node c = sf.children.get(0);
      List<Node> RowPlusC = new ArrayList<>(sf.row);
      RowPlusC.add(c);
      
      // if adding c to current row improves aspect ratio, add it
      if (worst(sf.row, sf.length) > worst(RowPlusC, sf.length)) {
        stack.push(new StackFrame(sf.children.subList(1, sf.children.size()), RowPlusC, sf.length));

      // else start a new row
      } else {
        layoutRow(sf.row);
        stack.push(new StackFrame(sf.children, new ArrayList<>(), currRect.shortestSide()));
      }
    }
  }

  private double worst(List<Node> row, double w) {
    if (row.isEmpty()) return Double.MAX_VALUE;
    
    double w2 = w * w;
    double s = row.stream().mapToDouble(n -> n.area).sum();
    double s2 = s * s;

    double worstAspectRatio = 0;

    for (Node n : row) {
      double aspectRatio = Math.max(w2 * n.area / s2, s2 / (w2 * n.area));
      worstAspectRatio = Math.max(worstAspectRatio, aspectRatio);
    }

    return worstAspectRatio;
  }

  private void layoutRow(List<Node> row) {
    double rowArea = row.stream().mapToDouble(r -> r.area).sum();
    double rectArea = currRect.height * currRect.width;
    double areaRatio = rowArea / rectArea;

    // vertical layout
    if (currRect.shortestSide() == currRect.height) {
      double width = areaRatio * currRect.width;
      double yOffset = 0;

      for (Node n : row) {
        double height = (n.area / rowArea) * currRect.height;
        Rect rect = new Rect(currRect.x, currRect.y + yOffset, height, width);
        fileToRect.put(n.id, rect);
        yOffset += height;

        if (!n.isDirectory) {
          extToColour.putIfAbsent(n.extension, randomColour());
          colourRectangle(rect, n.id, extToColour.get(n.extension));
        }
      }

      currRect = new Rect(currRect.x + width, currRect.y, currRect.height, currRect.width - width);
      
    // horizontal layout
    } else if (currRect.shortestSide() == currRect.width) {
      double height = areaRatio * currRect.height;
      double xOffset = 0;
      
      for (Node n : row) {
        double width = (n.area / rowArea) * currRect.width;
        Rect rect = new Rect(currRect.x + xOffset, currRect.y, height, width);
        fileToRect.put(n.id, rect);
        xOffset += width;

        if (!n.isDirectory) {
          extToColour.putIfAbsent(n.extension, randomColour());
          colourRectangle(rect, n.id, extToColour.get(n.extension));
        }
      }

      currRect = new Rect(currRect.x, currRect.y + height, currRect.height - height, currRect.width);
    }
  }

  private int randomColour() {
    // generate darker colours only
    int r = random.nextInt(128);
    int g = random.nextInt(128);
    int b = random.nextInt(128);
    int colour = (r << 24) | (g << 16) | (b << 8);
    return colour;
  }

  private void colourRectangle(Rect r, long fileId, int colour) {
    int xStart = (int)Math.ceil(r.x);
    int yStart = (int)Math.ceil(r.y);
    int w = (int)Math.ceil(r.width);
    int h = (int)Math.ceil(r.height);

    // for radial gradient
    double cx = (int)Math.ceil(r.width / 2);
    double cy = (int)Math.ceil(r.height / 2);
    double maxDist = Math.sqrt(cx * cx + cy * cy);

    for (int i = 0; i < w; i++) {
      for (int j = 0; j < h; j++) {
        double dx = i - cx;
        double dy = j - cy;
        double dist = Math.sqrt(dx * dx + dy * dy);
        double factor = Math.pow(dist / maxDist, 0.5);
        int alpha = (int) Math.round(factor * 255);

        int index = xStart + i + (yStart + j) * gridWidth;
        if (index < gridWidth * gridHeight) {
          rgbGrid[index] = colour | alpha;
          fileIdGrid[index] = fileId;
        }
      }
    }
  }
}
