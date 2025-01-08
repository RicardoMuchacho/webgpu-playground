import { useState } from "react";
import ImageEditor from "@/components/ImageEditor";
import { Github } from "lucide-react";

const Index = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Background Remover</h1>
            <p className="text-gray-600">Browser based background remover with WebGPU and huggingface bg remover model</p>
            <p className="text-gray-600">(This application uses WebGPU and hugging face models for educational purposes)</p>
          </div>
          <ImageEditor />
        </div>
      </div>
      <div className="p-4 fixed bottom-0 w-full bg-gray-200 flex justify-center">
        <a className="text-center" target="_blank" href="https://github.com/RicardoMuchacho/webgpu-playground">
          <Github />
        </a>
      </div>
    </>
  );
};

export default Index;