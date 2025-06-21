import { Head } from "@inertiajs/react";
import React, { useRef, useState, useEffect } from "react";

export default function SketchPad() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [prompt, setPrompt] = useState("colourful doodle");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Set canvas size
        canvas.width = 500;
        canvas.height = 500;

        // Set default styles
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, []);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext("2d");

        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const generateImage = async () => {
        const canvas = canvasRef.current;
        const sketchData = canvas.toDataURL("image/png");

        setIsGenerating(true);
        setError("");
        setGeneratedResult(null);

        try {
            const formData = new FormData();
            formData.append("sketch_data", sketchData);
            formData.append("prompt", prompt);

            const response = await axios.post(route("generate"), formData);

            const data = response.data;

            if (data.success) {
                setGeneratedResult(data.result);
                console.log("Generated Image:", data);
            } else {
                setError(data.error || "Failed to generate image");
            }
        } catch (err) {
            console.error("Generation error:", err);
            setError("Network error: " + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadImage = () => {
        if (generatedResult?.candidates?.[0]?.content?.parts?.[1]?.inlineData) {
            const link = document.createElement("a");
            link.href = `data:${generatedResult.candidates[0].content.parts[1].inlineData.mimeType};base64,${generatedResult.candidates[0].content.parts[1].inlineData.data}`;
            link.download = "generated-image.png";
            link.click();
        }
    };

    const styleOptions = [
        { value: "colourful doodle", label: "Doodle" },
        { value: "realistic", label: "Realistic" },
        { value: "sketch", label: "Sketch" },
        { value: "colourful sketch", label: "Colorful" },
        { value: "watercolour painting", label: "Watercolor" },
        { value: "oil painting", label: "Oil Paint" },
        // Classic Art
        { value: "renaissance style", label: "Renaissance" },
        { value: "baroque style", label: "Baroque" },
        { value: "impressionism style", label: "Impressionism" },
        { value: "expressionism style", label: "Expressionism" },
        // Digital Art
        { value: "pixel art style", label: "Pixel Art" },
        { value: "vector art style", label: "Vector Art" },
        { value: "3d rendered", label: "3D Rendering" },
        { value: "digital painting", label: "Digital Painting" },
        // Photography
        { value: "portrait photography", label: "Portrait" },
        { value: "landscape photography", label: "Landscape" },
        { value: "street photography", label: "Street Photography" },
        { value: "abstract photography", label: "Abstract" }
    ];

    return (
        <>
        <Head title="Sketch to Image" />
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light text-slate-800 mb-2">
                        Sketch to Image
                    </h1>
                    <p className="text-slate-500 text-lg">
                        Transform your drawings into stunning visuals
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left Side - Canvas */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                            <div className="mb-6">
                                <h2 className="text-xl font-medium text-slate-700 mb-2">
                                    Your Canvas
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Draw anything you can imagine
                                </p>
                            </div>

                            {/* Canvas Container */}
                            <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 w-full max-w-[500px] mx-auto">
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="cursor-crosshair rounded-lg w-full block"
                                    width={500}
                                    height={500}
                                />
                            </div>

                            {/* Style Selection */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-slate-700 mb-3">
                                    Style
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {styleOptions.map((option) => (
                                        <label
                                            key={option.value}
                                            className={`relative flex items-center justify-center p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                                                prompt === option.value
                                                    ? "bg-slate-900 text-white border-slate-900"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="style"
                                                value={option.value}
                                                checked={prompt === option.value}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                className="sr-only"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={clearCanvas}
                                    className="flex-1 py-3 px-4 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={generateImage}
                                    disabled={isGenerating}
                                    className={`flex-[2] py-3 px-6 rounded-lg font-medium transition-all ${
                                        isGenerating
                                            ? "bg-slate-400 text-white cursor-not-allowed"
                                            : "bg-slate-900 text-white hover:bg-slate-800"
                                    }`}
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Generating...
                                        </div>
                                    ) : (
                                        "Generate Image"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Result */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                        <div className="mb-6">
                            <h2 className="text-xl font-medium text-slate-700 mb-2">
                                Generated Image
                            </h2>
                            <p className="text-sm text-slate-500">
                                Your sketch transformed
                            </p>
                        </div>

                        <div className="aspect-square bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-8">
                            {isGenerating ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-slate-600 font-medium mb-2">
                                        Creating magic...
                                    </p>
                                    <div className="space-y-1 text-xs text-slate-500">
                                        <p>• Analyzing your sketch</p>
                                        <p>• Generating with AI</p>
                                        <p>• Adding final touches</p>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-red-600 font-medium mb-1">Generation failed</p>
                                    <p className="text-sm text-red-500">{error}</p>
                                </div>
                            ) : generatedResult ? (
                                <div className="w-full text-center">
                                    {generatedResult.candidates &&
                                        generatedResult.candidates[0]?.content?.parts?.[1]?.inlineData && (
                                            <>
                                                <img
                                                    src={`data:${generatedResult.candidates[0].content.parts[1].inlineData.mimeType};base64,${generatedResult.candidates[0].content.parts[1].inlineData.data}`}
                                                    alt="Generated image"
                                                    className="w-full rounded-lg shadow-sm mb-4"
                                                />
                                                <button
                                                    onClick={downloadImage}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download
                                                </button>
                                            </>
                                        )}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 mb-1">
                                        Ready to create
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        Draw something and hit generate
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                            <span>Draw with your mouse</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                            <span>Choose your style</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                            <span>Generate & download</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}
