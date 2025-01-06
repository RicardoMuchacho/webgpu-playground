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
  const [isPainting, setIsPainting] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

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

          if (maskCanvasRef.current) {
            const maskCanvas = maskCanvasRef.current;
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            const maskCtx = maskCanvas.getContext("2d");
            if (maskCtx) {
              maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height); // Clear mask on load
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
  }, [file]);


  const startPainting = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPainting(true);
    draw(e);
  };

  const stopPainting = () => {
    setIsPainting(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPainting || !maskCanvasRef.current) return;

    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x, y;

    if ("touches" in e) {
      // Touch event
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      // Mouse event
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearMask = () => {
    if (maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
      }
    }
  };

  const processImage = async () => {
    if (!canvasRef.current || !maskCanvasRef.current) return;
    setIsProcessing(true);

    try {
      // Capture the current mask image (with black and white areas)
      const maskCanvas = maskCanvasRef.current;
      const ctx = maskCanvas.getContext("2d");
      if (ctx) {
        const maskImageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const maskData = maskImageData.data;

        // Convert the mask canvas to a DataURL (Image URL for mask)
        const maskDataUrl = maskCanvas.toDataURL("image/png");
        setProcessedImage(maskDataUrl); // Store mask image as DataURL
      }

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
              id="canvas"
              className="max-w-full h-auto border rounded-lg"
            />
            <canvas
              ref={maskCanvasRef}
              id="maskCanvas"
              className="absolute top-0 left-0 max-w-full h-auto border rounded-lg pointer-events-none"
              style={{ pointerEvents: "auto" }}
              onMouseDown={startPainting}
              onMouseMove={draw}
              onMouseUp={stopPainting}
              onMouseLeave={stopPainting}
              onTouchStart={startPainting}
              onTouchMove={draw}
              onTouchEnd={stopPainting}
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
        <Button onClick={clearMask} variant="outline" className="w-40">
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear Mask
        </Button>
        <Button onClick={onReset} variant="outline" className="w-40">
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ImageEditor;