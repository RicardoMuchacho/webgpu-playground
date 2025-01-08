import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Download, RotateCcw } from "lucide-react";
import {
  env,
  AutoModel,
  AutoProcessor,
  RawImage,
} from "@huggingface/transformers";
import ImageSelector from "./ImageSelector";

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const ImageEditor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const modelRef = useRef(null);
  const processorRef = useRef(null);

  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        if (!navigator.gpu) {
          throw new Error("WebGPU is not supported in this browser.");
        }
        const model_id = "Xenova/modnet";
        env.backends.onnx.wasm.proxy = false;
        modelRef.current ??= await AutoModel.from_pretrained(model_id, {
          device: "webgpu",
        });
        processorRef.current ??= await AutoProcessor.from_pretrained(model_id); env.backends.onnx.wasm.proxy = false;
      } catch (err) {
        toast({
          title: "Error",
          description: "WebGPU is not supported in this browser.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    })();
  }, []);

  const onReset = () => {
    setSelectedImage(null);
    setProcessedImage(null);
  }

  const processImage = async () => {
    setIsProcessing(true);
    const model = modelRef.current;
    const processor = processorRef.current;

    try {
      const img = await RawImage.fromURL(URL.createObjectURL(selectedImage));
      // Pre-process image
      const { pixel_values } = await processor(img);

      // Predict alpha matte
      const { output } = await model({ input: pixel_values });

      const maskData = (
        await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(
          img.width,
          img.height,
        )
      ).data;

      // Create new canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // Draw original image output to canvas
      ctx.drawImage(img.toCanvas(), 0, 0);

      // Update alpha channel
      const pixelData = ctx.getImageData(0, 0, img.width, img.height);
      for (let i = 0; i < maskData.length; ++i) {
        pixelData.data[4 * i + 3] = maskData[i];
      }
      ctx.putImageData(pixelData, 0, 0);
      setProcessedImage(canvas.toDataURL("image/png"));

      toast({
        title: "Success",
        description: "Image processed successfully!",
        duration: 3000,
      });

    } catch (error) {
      console.error("Error processing image:", error);
      let errorMessage = "Failed to process image";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
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
    <div className="space-y-4 mb-16 md:mb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Original Image</h3>
          </div>
          {!selectedImage ? (
            <ImageSelector selectedImage={setSelectedImage} />
          ) : (
            <div className="relative w-full h-64 border rounded-lg overflow-hidden">
              <img
                src={URL.createObjectURL(selectedImage)}
                className="object-contain w-full h-full"
              />
            </div>
          )}
        </Card>

        <Card className="p-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">Processed Image</h3>
          </div>
          <div className="relative w-full h-64 border rounded-lg overflow-hidden">
            {processedImage ? (
              <img
                src={processedImage}
                alt="Processed"
                className="object-contain w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
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