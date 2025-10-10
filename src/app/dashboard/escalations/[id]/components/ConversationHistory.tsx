import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Bot, Clock, MessageSquare, RefreshCw, UserCircle, FileText, Image, Download, Info, ExternalLink, X } from "lucide-react";
import Markdown from "markdown-to-jsx";
import NextImage from "next/image";
import type { ChatMessage } from "@/types/ChatMessage";

interface ConversationHistoryProps {
  chatMessages: ChatMessage[];
  loadingChats: boolean;
  refreshing: boolean;
  handleRefreshChats: () => void;
  formatTime: (dateString: string) => string;
}

export function ConversationHistory({
  chatMessages,
  loadingChats,
  refreshing,
  handleRefreshChats,
  formatTime,
}: ConversationHistoryProps) {
  const [selectedImage, setSelectedImage] = React.useState<{
    url: string;
    fileName: string;
    fileSize: number;
  } | null>(null);
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImageFile = (mimeType: string) => {
    return mimeType?.startsWith('image/');
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(fileUrl, '_blank');
    }
  };

  const renderAttachments = (attachments: ChatMessage['attachments']) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {attachments.map((attachment, index) => {
          const isImage = isImageFile(attachment.mimeType);
          
          if (isImage) {
            return (
              <div key={index} className="space-y-2">
                <div 
                  className="relative rounded-lg overflow-hidden border border-border/40 cursor-pointer hover:opacity-90 transition-opacity group"
                  onClick={() => setSelectedImage({
                    url: attachment.fileUrl,
                    fileName: attachment.fileName,
                    fileSize: attachment.fileSize
                  })}
                >
                  <img 
                    src={attachment.fileUrl} 
                    alt={attachment.fileName}
                    className="max-w-full h-auto max-h-64 object-contain bg-background/50"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  {/* Fallback for failed image loads */}
                  <div 
                    className="flex items-center gap-2 p-2 bg-background/50"
                    style={{ display: 'none' }}
                  >
                    <Image className="h-4 w-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)} • Click to view
                      </p>
                    </div>
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white px-2 py-1 rounded text-xs">
                      Click to enlarge
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {attachment.fileName} • {formatFileSize(attachment.fileSize)}
                </div>
              </div>
            );
          } else {
            // Non-image files
            return (
              <div 
                key={index} 
                className="flex items-center gap-2 p-2 bg-background/50 rounded border border-border/40"
              >
                <FileText className="h-4 w-4 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{attachment.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.fileSize)}
                  </p>
                </div>
                {attachment.fileUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open(attachment.fileUrl, '_blank')}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          }
        })}
      </div>
    );
  };

  const renderSystemMessage = (message: ChatMessage) => {
    const getSystemMessageText = (type: string) => {
      switch (type) {
        case 'agent_joined': return 'Agent joined the chat';
        case 'agent_left': return 'Agent left the chat';
        case 'customer_joined': return 'Customer joined the chat';
        case 'customer_left': return 'Customer left the chat';
        case 'chat_started': return 'Chat session has started';
        case 'chat_ended': return 'Chat session has ended';
        case 'agent_assigned': return 'Agent has been assigned';
        case 'agent_reassigned': return 'Agent has been reassigned';
        case 'queue_joined': return 'Joined the queue';
        case 'queue_left': return 'Left the queue';
        default: return message.message || 'System message';
      }
    };

    return (
      <div key={message._id} className="flex justify-center my-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border/40">
          <Info className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {getSystemMessageText(message.systemMessageType || '')}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Conversation History</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshChats}
          disabled={refreshing}
          className="gap-2 bg-card border-muted-gray shadow-none"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")}/>
          Refresh
        </Button>
      </div>        
      <Card className="bg-card p-0 overflow-hidden shadow-none border-muted-gray">
        {loadingChats ? (
          <ScrollArea className="h-[650px]">
            <div className="p-4 space-y-4">
              {/* Customer message skeleton */}
              <div className="flex flex-col items-start space-y-1">
                <Skeleton className="h-4 w-16" /> {/* Name */}
                <Skeleton className="h-8 w-64" /> {/* Message */}
                <Skeleton className="h-3 w-12" /> {/* Time */}
              </div>
              
              {/* AI message skeleton */}
              <div className="flex flex-col items-start space-y-1">
                <Skeleton className="h-4 w-20" /> {/* Name */}
                <Skeleton className="h-12 w-80" /> {/* Message */}
                <Skeleton className="h-3 w-12" /> {/* Time */}
              </div>
              
              {/* Agent message skeleton */}
              <div className="flex flex-col items-end space-y-1">
                <Skeleton className="h-4 w-16" /> {/* Name */}
                <Skeleton className="h-6 w-48" /> {/* Message */}
                <Skeleton className="h-3 w-12" /> {/* Time */}
              </div>
              
              {/* System message skeleton */}
              <div className="flex justify-center">
                <Skeleton className="h-6 w-40" /> {/* System message */}
              </div>
            </div>
          </ScrollArea>
        ) : chatMessages.length === 0 ? (
          <div className="h-[650px] flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No conversation history available</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[650px]">
            <div className="p-4 space-y-4">
              {chatMessages.map((message) => {
                // System messages (center)
                if (message.senderType === 'system') {
                  return renderSystemMessage(message);
                }

                // Customer messages (left side)
                if (message.senderType === 'customer') {
                  return (
                    <div key={message._id} className="flex flex-col items-start space-y-1">
                      <span className="text-sm font-medium text-primary">Customer</span>
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg rounded-tl-none p-3">
                            {message.messageType === 'text' && message.message && (
                              <p className="text-sm leading-relaxed break-words">{message.message}</p>
                            )}
                            {(message.messageType === 'image' || message.messageType === 'file') && (
                              <div className="space-y-2">
                                {message.message && (
                                  <p className="text-sm leading-relaxed break-words">{message.message}</p>
                                )}
                                {renderAttachments(message.attachments)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // AI messages (left side)
                if (message.senderType === 'ai') {
                  return (
                    <div key={message._id} className="flex flex-col items-start space-y-1">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">AI Assistant</span>
                      <div className="flex gap-3 max-w-[85%]">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg rounded-tl-none p-3">

                            {message.messageType === 'text' && message.message && (
                              <Markdown
                                options={{
                                  overrides: {
                                    a: {
                                      component: ({ children }) => <span className="text-primary underline cursor-pointer">{children}</span>,
                                    },
                                  },
                                }}
                              >
                                {(typeof message.message === 'string' ? message.message : '').replace(/\[([^\]]+)\]\(escalate:\/\/now\)/gi, "click here")}
                              </Markdown>
                            )}
                            {(message.messageType === 'image' || message.messageType === 'file') && (
                              <div className="space-y-2">
                                {message.message && (
                                  <Markdown
                                    options={{
                                      overrides: {
                                        a: {
                                          component: ({ children }) => <span className="text-primary underline cursor-pointer">{children}</span>,
                                        },
                                      },
                                    }}
                                  >
                                    {(typeof message.message === 'string' ? message.message : '').replace(/\[([^\]]+)\]\(escalate:\/\/now\)/gi, "click here")}
                                  </Markdown>
                                )}
                                {renderAttachments(message.attachments)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(message.updatedAt || message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Agent messages (right side)
                if (message.senderType === 'agent') {
                  return (
                    <div key={message._id} className="flex flex-col items-end space-y-1">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Agent</span>
                      <div className="flex gap-3 max-w-[85%] justify-end">
                        <div className="flex-1 flex flex-col items-end">
                          <div className="bg-blue-500 text-white rounded-lg rounded-tr-none p-3 max-w-full">
                            {message.messageType === 'text' && message.message && (
                              <p className="text-sm leading-relaxed break-words">{message.message}</p>
                            )}
                            {(message.messageType === 'image' || message.messageType === 'file') && (
                              <div className="space-y-2">
                                {message.message && (
                                  <p className="text-sm leading-relaxed break-words">{message.message}</p>
                                )}
                                {renderAttachments(message.attachments)}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(message.updatedAt || message.createdAt)}
                          </span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </div>
                  );
                }

                // Fallback for unknown sender types
                return null;
              })}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Custom Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          />
          
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-6xl mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-background">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Image className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate max-w-md">
                    {selectedImage.fileName}
                  </h3>
                  <p className="text-sm text-gray-500 bg-card">
                    {formatFileSize(selectedImage.fileSize)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(selectedImage.url, selectedImage.fileName)}
                  className="gap-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedImage.url, '_blank')}
                  className="gap-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="h-10 w-10 p-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Image Container */}
            <div className="p-6 bg-background">
              <div className="relative w-full h-[75vh] rounded-xl overflow-hidden bg-card shadow-inner">
                <NextImage
                  src={selectedImage.url}
                  alt={selectedImage.fileName}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
