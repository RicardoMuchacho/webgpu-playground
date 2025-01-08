import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  selectedImage: (file: File) => void;
}

const ImageSelector = ({ selectedImage }: Props) => {
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        selectedImage(file);
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
        selectedImage(file);
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
    <Card className="flex items-center justify-center h-64 text-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full h-full flex items-center justify-center"
      >
        <label
          htmlFor="file-upload"
          className="cursor-pointer w-full h-64"
        >
          <div className="w-full h-full space-y-2 flex flex-col items-center justify-center">
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
        </label>
      </div>
    </Card>
  )
}

export default ImageSelector;