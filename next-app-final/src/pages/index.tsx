// src/app/page.tsx (or your Home component file)
"use client"; // Add this if you're in Next.js App Router and using client-side hooks

import { useState, ChangeEvent, FormEvent } from "react";

export default function Home() {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileContent("");
      setFileName("");
      setMessage(null);
      return;
    }

    setFileName(file.name);
    setMessage(null); // Clear previous messages

    try {
      const rawText = await file.text();
      const escapedText = rawText
        .replace(/\\/g, "\\\\") // escape backslashes first
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t");
      setFileContent(escapedText);
    } catch (error) {
      console.error("Error reading file:", error);
      setMessage({ type: "error", text: "Could not read the file content." });
      setFileContent("");
      setFileName("");
    }
    // Reset file input value so onChange triggers for the same file if selected again
    e.target.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission if wrapped in a form
    if (!fileContent) {
      setMessage({ type: "error", text: "Please select a file first." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/zkp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: fileContent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Processing failed.");
      }

      console.log("Success:", result);
      setMessage({ type: "success", text: "File processed successfully!" });
      // Optionally clear content after successful processing
      // setFileContent("");
      // setFileName("");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setMessage({ type: "error", text: `Error: ${errorMessage}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl space-y-6 transform transition-all hover:scale-105 duration-300">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6">
          EML File Processor
        </h1>

        {/* File Input */}
        <div>
          <label
            htmlFor="file-upload"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Upload .eml file
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md hover:border-emerald-500 transition-colors">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-emerald-400 hover:text-emerald-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 focus-within:ring-emerald-500 px-2"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".eml"
                    className="sr-only"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">EML files up to 10MB</p>
              {fileName && (
                <p className="text-sm text-emerald-400 mt-2">
                  Selected: {fileName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Textarea for File Content */}
        <div>
          <label
            htmlFor="file-content-display"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Escaped File Content (Read-only)
          </label>
          <textarea
            id="file-content-display"
            rows={10}
            className="w-full p-3 bg-slate-700 border border-gray-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-500"
            readOnly
            value={fileContent}
            placeholder="File content will appear here after selection..."
          />
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500"
                : "bg-red-500/20 text-red-300 border border-red-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Process Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !fileContent}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            "Process File"
          )}
        </button>
      </div>
      <footer className="text-center text-gray-500 mt-8 text-sm">
        <p>EML Processor & ZKP Demo</p>
      </footer>
    </div>
  );
}
