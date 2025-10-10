import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Clock, FileText, PenLine, Send, Trash2, User } from "lucide-react";

export interface CaseNote {
  id: string
  content: string
  author: string
  createdAt: string
}

interface CaseNotesProps {
  notes: CaseNote[];
  onAddNote: (content: string) => void;
  onDeleteNote: (id: string) => void;
  formatDate: (dateString: string) => string;
}

export function CaseNotes({
  notes,
  onAddNote,
  onDeleteNote,
  formatDate
}: CaseNotesProps) {
  const [noteText, setNoteText] = React.useState("");

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    onAddNote(noteText);
    setNoteText("");
  };

  // Simple function to render basic markdown formatting
  const renderNoteContent = (content: string) => {
    // Split by line breaks and render each line
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

  return (
    <div className="space-y-4 ">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-semibold">Case Notes</h2>
        </div>
        <Badge variant="outline" className="bg-card text-xs">{notes.length}</Badge>
      </div>
      
      {/* Add Note Form */}
      <Card className="p-4 overflow-hidden bg-card shadow-sm border-border/40 relative">
        <div className="space-y-3">
          <Textarea
            placeholder="Type your note here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[120px] resize-none"
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleAddNote}
              disabled={!noteText.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Notes List */}
      <div className=" space-y-3 mt-2">
        {notes.length === 0 ? (
          <div className="bg-card p-8 text-center  rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No case notes yet</p>
          </div>
        ) : (
          notes.map((note) => (
            <Card key={note.id} className="bg-card p-4 overflow-hidden shadow-sm border-border/40">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                      <User className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className="text-sm font-medium">{note.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteNote(note.id)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="py-1">
                  <div className="text-sm leading-relaxed space-y-1">
                    {renderNoteContent(note.content)}
                  </div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(note.createdAt)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
