"use client";
import { Tab, useTabs } from "@/context/TabsContext";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Clock, FileText, PenLine, Send, Trash2, User, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/utils/api";

export interface CaseNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface NotesTabProps {
  tab: Tab;
}

export function NotesTab({ tab }: NotesTabProps) {
  const { user } = useAuth();
  const { updateTab } = useTabs();
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const escalationId = tab.data?.escalationId;
  const caseNumber = tab.data?.caseNumber;
  const customerName = tab.data?.customerName;

  // Fetch notes
  const fetchNotes = async () => {
    if (!escalationId) {
      setError("No escalation ID provided");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/notes/escalation/${escalationId}?limit=1000`);
      if (response.data.success && response.data.data?.notes) {
        const fetchedNotes = response.data.data.notes.map((note: any) => ({
          id: note._id,
          content: note.content,
          author: note.createdBy || "Unknown User",
          createdAt: note.createdAt
        }));
        setNotes(fetchedNotes);
      } else {
        setNotes([]);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refresh on tab data changes
  useEffect(() => {
    if (escalationId) {
      fetchNotes();
    }
  }, [escalationId, tab.data?.refreshKey]);

  // Add note
  const handleAddNote = async () => {
    if (!noteText.trim() || !escalationId) return;
    
    setIsAdding(true);
    try {
      const createdBy = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
      const response = await api.post(`/notes/escalation/${escalationId}`, { 
        content: noteText,
        createdBy 
      });
      
      if (response.data.success && response.data.data) {
        setNoteText("");
        fetchNotes(); // Refresh notes
      } else {
        alert('Failed to create note.');
      }
    } catch (err) {
      alert('Error adding note.');
      console.error('Error adding note:', err);
    } finally {
      setIsAdding(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await api.delete(`/notes/${noteId}`);
      if (response.data.success) {
        fetchNotes(); // Refresh notes
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      alert('Failed to delete note');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleString();
  };

  // Render note content with basic markdown formatting
  const renderNoteContent = (content: string) => {
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Handle bold text **text**
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle italic text *text*
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Handle bullet points - lines starting with - or *
      const isBulletPoint = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      
      if (isBulletPoint) {
        const bulletContent = line.trim().substring(2);
        return (
          <div key={index} className="flex items-start gap-2 ml-2">
            <span className="text-xs mt-1">•</span>
            <span dangerouslySetInnerHTML={{ __html: bulletContent }} />
          </div>
        );
      }
      
      // Regular line
      return (
        <div key={index}>
          {formattedLine ? (
            <span dangerouslySetInnerHTML={{ __html: formattedLine }} />
          ) : (
            <br />
          )}
        </div>
      );
    });
  };

  if (!escalationId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Case Selected</h3>
          <p className="text-sm text-muted-foreground">
            Please select an escalation case to view and add notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Case Notes</h1>
              {caseNumber && customerName && (
                <p className="text-sm text-muted-foreground">
                  {caseNumber} • {customerName}
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotes}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Summary Bar */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
          <div className="flex-1">
            <p className="font-medium text-sm">{tab.data?.concern || 'Case Details'}</p>
            {tab.data?.customerEmail && (
              <p className="text-xs text-muted-foreground mt-0.5">{tab.data.customerEmail}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {tab.data?.status && (
              <Badge 
                variant={
                  tab.data.status === 'resolved' ? 'default' : 
                  tab.data.status === 'pending' ? 'secondary' : 
                  'destructive'
                }
                className="capitalize"
              >
                {tab.data.status}
              </Badge>
            )}
            <Badge variant="outline" className="bg-background">
              {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* Error Message */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <div className="p-4 flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </Card>
          )}

          {/* Add Note Form */}
          <Card className="border-2 border-dashed hover:border-solid hover:border-primary/50 transition-colors bg-gradient-to-br from-card to-muted/20">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <PenLine className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-semibold text-base">Add New Note</h3>
              </div>
              <Textarea
                placeholder="Write your note here... You can use basic formatting:&#10;**bold text**&#10;*italic text*&#10;- bullet points"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="min-h-[140px] resize-none bg-background border-border/50 focus:border-primary"
                disabled={isAdding}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {noteText.length} characters
                </p>
                <Button 
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || isAdding}
                  size="sm"
                  className="gap-2"
                >
                  {isAdding ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Add Note
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Notes List Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">All Notes</h2>
              <Badge variant="secondary" className="ml-1">{notes.length}</Badge>
            </div>
          </div>
          
          {/* Notes List */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 animate-pulse bg-card border-muted">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-32" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="h-4 bg-muted rounded w-5/6" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : notes.length === 0 ? (
              <Card className="border-dashed">
                <div className="p-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold mb-2">No notes yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Start documenting this case by adding your first note above.
                  </p>
                </div>
              </Card>
            ) : (
              notes.map((note, index) => (
                <Card key={note.id} className="overflow-hidden hover:shadow-md transition-shadow bg-card border-muted shadow-sm">
                  <div className="p-6 space-y-4">
                    {/* Note Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{note.author}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            {formatDate(note.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          #{notes.length - index}
                        </Badge>
                        {/* Uncomment if delete functionality is needed
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        */}
                      </div>
                    </div>
                    
                    {/* Note Content */}
                    <div className="pl-[52px]">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div className="text-sm leading-relaxed space-y-1 text-foreground/90">
                          {renderNoteContent(note.content)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
