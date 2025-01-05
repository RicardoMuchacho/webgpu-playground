import { useState } from "react";
import ImageEditor from "@/components/ImageEditor";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG)",
          variant: "destructive",
        });
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG)",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Image Editor</h1>
          <p className="text-gray-600">Upload an image, select areas to remove, and let AI do the magic</p>
        </div>

        {!selectedFile ? (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div 
                className="flex items-center justify-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer w-full"
                >
                  <div className="w-full max-w-md mx-auto h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                    <div className="space-y-2">
                      <div className="text-gray-600">Drop your image here or</div>
                      <Button>Browse Files</Button>
                    </div>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </Card>
        ) : (
          <ImageEditor file={selectedFile} onReset={() => setSelectedFile(null)} />
        )}
      </div>
    </div>
  );
};

export default Index;