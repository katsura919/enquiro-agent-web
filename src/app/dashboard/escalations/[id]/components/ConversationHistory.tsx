import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Bot, Clock, MessageSquare, RefreshCw, UserCircle } from "lucide-react";
import Markdown from "markdown-to-jsx";
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
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")}/>
          Refresh
        </Button>
      </div>        
      <Card className="bg-card p-0 overflow-hidden shadow-sm border-border/40">
        {chatMessages.length === 0 ? (
          <ScrollArea className="h-[650px]">
            <div className="p-4 space-y-4">
              {/* Customer message skeleton */}
              <div className="flex flex-col items-end space-y-1">
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
              
              {/* Customer message skeleton */}
              <div className="flex flex-col items-end space-y-1">
                <Skeleton className="h-4 w-16" /> {/* Name */}
                <Skeleton className="h-6 w-48" /> {/* Message */}
                <Skeleton className="h-3 w-12" /> {/* Time */}
              </div>
              
              {/* AI message skeleton */}
              <div className="flex flex-col items-start space-y-1">
                <Skeleton className="h-4 w-20" /> {/* Name */}
                <Skeleton className="h-10 w-72" /> {/* Message */}
                <Skeleton className="h-3 w-12" /> {/* Time */}
              </div>            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[650px]">
            <div className="p-4 space-y-6">
              {chatMessages.map((message) => {
                // Customer message (left)
                if (message.senderType === 'customer') {
                  return (
                    <div key={message._id} className="flex flex-col items-start space-y-1 mb-8">
                      <span className="text-sm font-medium">Customer</span>
                      <div className="grid grid-cols-[auto_1fr] gap-3 max-w-[80%]">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-sm leading-relaxed break-words">{message.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 ml-12">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  );
                }
                // AI message (left)
                if (message.senderType === 'ai') {
                  return (
                    <div key={message._id} className="flex flex-col items-start space-y-1 mb-8">
                      <span className="text-sm font-medium">AI Assistant</span>
                      <div className="grid grid-cols-[auto_1fr] gap-3 max-w-[80%]">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          {message.isGoodResponse !== null && (
                            <Badge variant={message.isGoodResponse ? "default" : "destructive"} className="mb-2 text-xs">
                              {message.isGoodResponse ? "Helpful" : "Not Helpful"}
                            </Badge>
                          )}
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
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 ml-12">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.updatedAt || message.createdAt)}
                      </span>
                    </div>
                  );
                }
                // Agent message (right)
                if (message.senderType === 'agent') {
                  return (
                    <div key={message._id} className="flex flex-col items-end space-y-1 mb-8">
                      <span className="text-sm font-medium">Agent</span>
                      <div className="flex justify-end w-full">
                        <div className="grid grid-cols-[1fr_auto] gap-3 max-w-[80%]">
                          <div className="bg-blue-500 text-white rounded-lg p-3 justify-self-end">
                            <p className="text-sm leading-relaxed break-words">{message.message}</p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mr-12">
                        <Clock className="h-3 w-3" />
                        {formatTime(message.updatedAt || message.createdAt)}
                      </span>
                    </div>
                  );
                }
                // fallback (should not happen)
                return null;
              })}
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
