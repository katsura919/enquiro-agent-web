"use client"

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Bot, CheckCircle2, UserPlus, UserMinus, MessageCircle, PhoneOff, Download, FileText, Image as ImageIcon, ExternalLink, ZoomIn } from "lucide-react";
import Image from "next/image";
import type { ChatMessage } from "@/types/ChatMessage";

interface ChatMessageProps {
  sender: 'customer' | 'agent' | 'ai' | 'system';
  text?: string;
  attachments?: Array<{
    fileUrl: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }>;
  time: string;
  systemMessageType?: string;
}

export default function ChatMessage({ sender, text, attachments, time, systemMessageType }: ChatMessageProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    fileName: string
    fileSize: number
  } | null>(null)
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({})

  const isAgent = sender === "agent";
  const isSystem = sender === "system";
  const isAI = sender === "ai";

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      // For PDFs and documents, we might need to fetch with proper headers
      if (fileName.toLowerCase().endsWith('.pdf') || !fileUrl.includes('/image/')) {
        // Use fetch to get the file with proper headers
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        
        // Create blob URL and download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        window.URL.revokeObjectURL(blobUrl);
      } else {
        // For images, use direct download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link
      window.open(fileUrl, '_blank');
    }
  }

  const handleImageClick = (attachment: any) => {
    setSelectedImage({
      url: attachment.fileUrl,
      fileName: attachment.fileName,
      fileSize: attachment.fileSize || 0
    })
    setImageDialogOpen(true)
  }

  const handleImageLoad = (imageUrl: string) => {
    setImageLoading(prev => ({ ...prev, [imageUrl]: false }))
  }

  const handleImageLoadStart = (imageUrl: string) => {
    setImageLoading(prev => ({ ...prev, [imageUrl]: true }))
  }
  
  // Get system message icon based on type
  const getSystemMessageIcon = () => {
    switch (systemMessageType) {
      case 'agent_joined':
      case 'agent_assigned':
        return <UserPlus className="w-4 h-4" />;
      case 'agent_left':
        return <UserMinus className="w-4 h-4" />;
      case 'customer_joined':
        return <User className="w-4 h-4" />;
      case 'customer_left':
        return <UserMinus className="w-4 h-4" />;
      case 'chat_started':
        return <MessageCircle className="w-4 h-4" />;
      case 'chat_ended':
        return <PhoneOff className="w-4 h-4" />;
      default:
        return "!";
    }
  };

  // System messages should be centered
  if (isSystem) {
    return (
      <div className="flex justify-center items-center my-2">
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs text-center">
          {text}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isAgent ? "justify-end" : "justify-start"} items-start gap-2`}>
      {!isAgent && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
          isSystem 
            ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            : isAI
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "bg-muted text-muted-foreground"
        }`}>
          {isSystem ? getSystemMessageIcon() : isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
        isAgent 
          ? "bg-primary text-primary-foreground rounded-br-sm" 
          : isSystem
          ? "bg-gray-50 border border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 rounded-bl-sm"
          : isAI
          ? "bg-blue-50 border border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100 rounded-bl-sm"
          : "bg-muted text-foreground rounded-bl-sm"
      }`}>
        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="space-y-2 mb-2">
            {attachments.map((attachment, idx) => (
              <div key={idx}>
                {attachment.mimeType.startsWith('image/') ? (
                  /* Image attachments */
                  <div className="relative max-w-xs">
                    {(!attachment.fileUrl || imageLoading[attachment.fileUrl]) ? (
                      <Skeleton className="w-full h-32 rounded-lg" />
                    ) : (
                      <>
                        <div 
                          className="relative w-full h-32 rounded-lg overflow-hidden bg-muted group cursor-pointer"
                          onClick={() => handleImageClick(attachment)}
                        >
                          <Image
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            fill
                            className="object-cover transition-all duration-200 group-hover:scale-105"
                            onLoadStart={() => handleImageLoadStart(attachment.fileUrl)}
                            onLoad={() => handleImageLoad(attachment.fileUrl)}
                            onError={() => handleImageLoad(attachment.fileUrl)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                            <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                          <span className="truncate flex-1">{attachment.fileName}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
                            title="Download image"
                          >
                            <Download className="h-2 w-2" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Non-image attachments (PDFs, documents) */
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border/50 max-w-xs">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(attachment.fileUrl, '_blank')}
                        title="Open file"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
                        title="Download file"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text content */}
        {text && (
          <div className="text-sm whitespace-pre-wrap break-words">{text}</div>
        )}
        
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          isAgent ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
        }`}>
          <span>{time}</span>
          {isAgent && <CheckCircle2 className="w-3 h-3" />}
        </div>
      </div>

      {isAgent && (
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
          <User className="w-4 h-4" />
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <div>
                  <p className="font-semibold text-sm">{selectedImage?.fileName}</p>
                  <p className="text-xs text-muted-foreground font-normal">
                    {selectedImage && formatFileSize(selectedImage.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedImage && handleDownload(selectedImage.url, selectedImage.fileName)}
                  className="gap-1 text-xs h-7"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedImage && window.open(selectedImage.url, '_blank')}
                  className="gap-1 text-xs h-7"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative flex-1 min-h-0 p-4 pt-0">
            {selectedImage && (
              <div className="relative w-full h-[60vh] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.fileName}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
