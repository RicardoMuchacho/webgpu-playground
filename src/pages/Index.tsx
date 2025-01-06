import { useState } from "react";
import ImageEditor from "@/components/ImageEditor";
import ImageSelector from "@/components/ImageSelector";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Image Editor</h1>
          <p className="text-gray-600">Upload an image, select areas to remove, and let AI do the magic</p>
          <p className="text-gray-600">(This application uses WebGPU API and hugging face models)</p>
        </div>

        {!selectedFile ? (
          <ImageSelector setSelectedFile={setSelectedFile} />
        ) : (
          <ImageEditor file={selectedFile} onReset={() => setSelectedFile(null)} />
        )}
      </div>
    </div>
  );
};

export default Index;