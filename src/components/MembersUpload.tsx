import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Upload, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Alert, AlertDescription } from "./ui/alert";

interface MembersUploadProps {
  accessToken: string;
}

export function MembersUpload({ accessToken }: MembersUploadProps) {
  const [csvContent, setCsvContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvContent(content);
        setUploadStatus(null);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    if (!csvContent.trim()) {
      setUploadStatus({ type: 'error', message: 'Please paste CSV content or upload a file' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81befd82/upload-members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ csvContent }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUploadStatus({ 
          type: 'success', 
          message: `Successfully uploaded ${data.count} church members!` 
        });
        setMemberCount(data.count);
        setCsvContent("");
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: data.error || 'Failed to upload members' 
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: 'An error occurred while uploading. Please try again.' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Church Members
        </CardTitle>
        <CardDescription>
          Upload a CSV file with church member names. Members will appear as type-ahead suggestions 
          in the "Purchased By" and "Contributed By" fields with searchable autocomplete.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadStatus && (
          <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{uploadStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm">Upload CSV File</label>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Or Paste CSV Content</label>
          <Textarea
            placeholder="First Name,Last Name&#10;John,Doe&#10;Jane,Smith&#10;&#10;Or just:&#10;John Doe&#10;Jane Smith"
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={uploading || !csvContent.trim()}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Members'}
        </Button>

        {memberCount !== null && (
          <p className="text-sm text-muted-foreground text-center">
            {memberCount} members currently loaded
          </p>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">Accepted CSV Formats:</p>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs opacity-75">Two columns (recommended):</p>
              <code className="block bg-muted p-2 rounded text-xs">
                First Name,Last Name<br/>
                John,Doe<br/>
                Jane,Smith
              </code>
            </div>

            <div>
              <p className="text-xs opacity-75">Single column:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                Name<br/>
                John Doe<br/>
                Jane Smith
              </code>
            </div>

            <div>
              <p className="text-xs opacity-75">No headers (optional):</p>
              <code className="block bg-muted p-2 rounded text-xs">
                John,Doe<br/>
                Jane,Smith
              </code>
            </div>
          </div>

          <p className="text-xs opacity-75 pt-1">
            ✓ Headers are automatically detected and skipped<br/>
            ✓ Duplicate names are removed<br/>
            ✓ Names are sorted alphabetically<br/>
            ✓ Appears as searchable type-ahead in forms<br/>
            ✓ You can still type custom names if needed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
