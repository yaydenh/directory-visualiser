package com.junyan.backend.treemap;

public class TreeMapStatusResponse {
  private boolean isProcessing;
  private boolean hasError;
  private String errorMessage;
  
  public TreeMapStatusResponse() {
  }

  public boolean isProcessing() {
    return isProcessing;
  }

  public void setIsProcessing(boolean isProcessing) {
    this.isProcessing = isProcessing;
  }

  public boolean isHasError() {
    return hasError;
  }

  public void setHasError(boolean hasError) {
    this.hasError = hasError;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public void setErrorMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }
}
