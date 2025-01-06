import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  setSelectedFile: (file: File) => void;
}

const ImageSelector = ({ setSelectedFile }: Props) => {
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
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  Browse Files
                </Button>
              </div>
            </div>
          </label>
        </div>
      </div>
    </Card>
  )
}

export default ImageSelector;