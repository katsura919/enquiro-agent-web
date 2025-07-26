import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download, X, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  isLoading: boolean;
  previewUrl: string | null;
  attachmentInfo: {
    messageId: string;
    attachmentId: string;
    filename: string;
  } | null;
  onClose: () => void;
  onDownload: (messageId: string, attachmentId: string, filename: string) => Promise<void>;
}

export function AttachmentPreviewModal({
  isOpen,
  isLoading,
  previewUrl,
  attachmentInfo,
  onClose,
  onDownload,
}: AttachmentPreviewModalProps) {
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [imageNaturalSize, setImageNaturalSize] = React.useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = React.useState({ x: 0, y: 0 });

  const handleClose = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setZoom(1); // Reset zoom when closing
    setImagePosition({ x: 0, y: 0 }); // Reset position
    onClose();
  };

  const handleDownload = async () => {
    if (attachmentInfo && !isDownloading) {
      setIsDownloading(true);
      try {
        await onDownload(
          attachmentInfo.messageId,
          attachmentInfo.attachmentId,
          attachmentInfo.filename
        );
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5)); // Max zoom 5x
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.1)); // Min zoom 0.1x
  };

  const handleResetZoom = () => {
    setZoom(1);
    setImagePosition({ x: 0, y: 0 }); // Reset position when resetting zoom
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y });
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Handle backdrop click to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-[100vw] max-h-[90vh] w-[100vw] h-[100vh] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[95vw] xl:max-w-[98vw] p-0 bg-black/50 border-none shadow-none overflow-hidden"
        showCloseButton={false}
      >
        {/* Gmail-style header bar */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left side - filename */}
            <div className="flex items-center gap-3 min-w-0">
              {attachmentInfo && (
                <h2 className="text-white text-sm font-medium truncate">
                  {attachmentInfo.filename}
                </h2>
              )}
            </div>

            {/* Right side - controls */}
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 bg-white/10 rounded-md p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.1}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-white text-xs px-2 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 5}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetZoom}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  title="Reset zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Download button */}
              {attachmentInfo && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  title="Download"
                >
                  <Download className={cn("h-4 w-4", isDownloading && "animate-spin")} />
                </Button>
              )}

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div 
          className="relative w-full h-full flex items-center justify-center pt-16" 
          onClick={handleBackdropClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <p className="text-white/80 text-sm">Loading preview...</p>
            </div>
          ) : previewUrl ? (
            <div 
              className="overflow-hidden w-full h-full flex items-center justify-center p-2"
              style={{ 
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              <img 
                src={previewUrl} 
                alt="Attachment preview" 
                className="transition-transform duration-200 ease-out select-none"
                style={{ 
                  transform: `scale(${zoom}) translate(${imagePosition.x / zoom}px, ${imagePosition.y / zoom}px)`,
                  maxWidth: zoom <= 1 ? '90%' : 'none',
                  maxHeight: zoom <= 1 ? 'calc(90vh - 128px)' : 'none',
                  objectFit: 'contain'
                }}
                onClick={(e) => e.stopPropagation()}
                onLoad={handleImageLoad}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                draggable={false}
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
