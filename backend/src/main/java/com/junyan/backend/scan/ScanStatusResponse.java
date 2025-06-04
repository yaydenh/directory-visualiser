package com.junyan.backend.scan;

public class ScanStatusResponse {
  private boolean inProgress;
  private boolean hasError;
  private String errorMessage;

  public ScanStatusResponse() {
  }

  public ScanStatusResponse(boolean inProgress, boolean hasError) {
    this.inProgress = inProgress;
    this.hasError = hasError;
  }

  public boolean isInProgress() {
    return inProgress;
  }

  public void setInProgress(boolean inProgress) {
    this.inProgress = inProgress;
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
