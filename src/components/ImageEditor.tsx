import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { pipeline, env } from "@huggingface/transformers";
import { Loader2, Download, RotateCcw } from "lucide-react";

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

interface ImageEditorProps {
  file: File;
  onReset: () => void;
}

const ImageEditor = ({ file, onReset }: ImageEditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadImage = async () => {
      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0);
            }
          }
        };
      } catch (error) {
        console.error("Error loading image:", error);
        toast({
          title: "Error",
          description: "Failed to load image",
          variant: "destructive",
        });
      }
    };

    loadImage();
  }, [file, toast]);

  const processImage = async () => {
    if (!canvasRef.current) return;

    setIsProcessing(true);
    try {
      const segmenter = await pipeline("image-segmentation", "Xenova/segformer-b0-finetuned-ade-512-512", {
        device: "webgpu",
      });

      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      
      console.log("Processing with segmentation model...");
      const result = await segmenter(imageData);
      
      if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
        throw new Error("Invalid segmentation result");
      }

      // Create output canvas
      const outputCanvas = document.createElement("canvas");
      outputCanvas.width = canvas.width;
      outputCanvas.height = canvas.height;
      const outputCtx = outputCanvas.getContext("2d");
      
      if (!outputCtx) throw new Error("Could not get output canvas context");
      
      // Draw original image
      outputCtx.drawImage(canvas, 0, 0);
      
      // Apply the mask
      const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
      const data = outputImageData.data;
      
      for (let i = 0; i < result[0].mask.data.length; i++) {
        const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
        data[i * 4 + 3] = alpha;
      }
      
      outputCtx.putImageData(outputImageData, 0, 0);
      
      // Convert to base64 and set as processed image
      const processedImageData = outputCanvas.toDataURL("image/png");
      setProcessedImage(processedImageData);

      toast({
        title: "Success",
        description: "Image processed successfully!",
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement("a");
      link.href = processedImage;
      link.download = "processed-image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Original Image</h3>
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto border rounded-lg"
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Processed Image</h3>
          </div>
          <div className="relative">
            {processedImage ? (
              <img
                src={processedImage}
                alt="Processed"
                className="max-w-full h-auto border rounded-lg"
              />
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Processed image will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={processImage}
          disabled={isProcessing}
          className="w-40"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Image"
          )}
        </Button>
        {processedImage && (
          <Button onClick={handleDownload} variant="outline" className="w-40">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
        <Button onClick={onReset} variant="outline" className="w-40">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;