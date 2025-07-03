import { Head } from "@inertiajs/react";
import React, { useRef, useState, useEffect } from "react";
import { FcNightLandscape } from "react-icons/fc";
import { WiDaySunny } from "react-icons/wi";

export default function SketchPad() {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [prompt, setPrompt] = useState("80's to 90's Ghibli styled anime sketch colourful");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResult, setGeneratedResult] = useState(null);
    const [error, setError] = useState("");

    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("darkMode") === "true"
    );

    useEffect(() => {
        document.documentElement.classList.toggle("dark", darkMode);
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode((prevMode) => !prevMode);
        window.location.reload();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = 500;
        canvas.height = 500;

        ctx.fillStyle = darkMode ? "#1a202c" : "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = darkMode ? "#ffffff" : "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, [darkMode]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const ctx = canvasRef.current.getContext("2d");
        const { x, y } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current.getContext("2d");
        const { x, y } = getCoordinates(e);
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = darkMode ? "#1a202c" : "#ffffff";
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
        { value: "80's to 90's Ghibli styled anime sketch colourful", label: "Anime" },
        { value: "realistic", label: "Realistic" },
        { value: "sketch", label: "Sketch" },
        { value: "colourful sketch", label: "Colorful" },
        { value: "watercolour painting", label: "Watercolor" },
        { value: "oil painting", label: "Oil Paint" },
        { value: "renaissance style", label: "Renaissance" },
        { value: "baroque style", label: "Baroque" },
        { value: "impressionism style", label: "Impressionism" },
        { value: "expressionism style", label: "Expressionism" },
        { value: "pixel art style", label: "Pixel Art" },
        { value: "vector art style", label: "Vector Art" },
        { value: "3d rendered", label: "3D Rendering" },
        { value: "digital painting", label: "Digital Painting" },
        { value: "portrait photography", label: "Portrait" },
        { value: "landscape photography", label: "Landscape" },
        { value: "street photography", label: "Street Photography" },
        { value: "abstract photography", label: "Abstract" },
    ];

    return (
        <>
            <Head title="Sketch to Image" />
            <title>Sketch to Image</title>
            <button
                onClick={toggleDarkMode}
                className="text-sm font-medium px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-500 focus:outline-none absolute top-4 right-4"
            >
                <span className="sr-only">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </span>
                {darkMode ? (
                    <WiDaySunny className="h-5 w-5 text-yellow-500" />
                ) : (
                    <FcNightLandscape className="h-5 w-5" />
                )}
            </button>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-light text-slate-800 dark:text-slate-100 mb-2">
                            Sketch to Image
                        </h1>
                        <p className="text-slate-500 dark:text-slate-300 text-lg">
                            Transform your drawings into stunning visuals
                        </p>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="mb-6">
                                    <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-2">
                                        Your Canvas
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Draw anything you can imagine
                                    </p>
                                </div>

                                <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 w-full max-w-[500px] mx-auto">
                                    <canvas
                                        ref={canvasRef}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        onTouchCancel={stopDrawing}
                                        style={{ touchAction: "none" }}
                                        className="cursor-crosshair rounded-lg w-full block"
                                        width={500}
                                        height={500}
                                    />
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">
                                        Style
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {styleOptions.map((option) => (
                                            <label
                                                key={option.value}
                                                className={`relative flex items-center justify-center p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                                                    prompt === option.value
                                                        ? "bg-slate-900 text-white border-slate-900"
                                                        : "bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:border-slate-600"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="style"
                                                    value={option.value}
                                                    checked={
                                                        prompt === option.value
                                                    }
                                                    onChange={(e) =>
                                                        setPrompt(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="sr-only"
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={clearCanvas}
                                        className="flex-1 py-3 px-4 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
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

                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="mb-6">
                                <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    Generated Image
                                </h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Your sketch transformed
                                </p>
                            </div>

                            <div className="aspect-square bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-8">
                                {isGenerating ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 rounded-full animate-spin mx-auto mb-4"></div>
                                        <p className="text-slate-600 dark:text-slate-200 font-medium mb-2">
                                            Creating magic...
                                        </p>
                                        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                                            <p>• Analyzing your sketch</p>
                                            <p>• Generating with AI</p>
                                            <p>• Adding final touches</p>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <svg
                                                className="w-6 h-6 text-red-500 dark:text-red-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-red-600 dark:text-red-300 font-medium mb-1">
                                            Generation failed
                                        </p>
                                        <p className="text-sm text-red-500 dark:text-red-400">
                                            {error}
                                        </p>
                                    </div>
                                ) : generatedResult ? (
                                    <div className="w-full text-center">
                                        {generatedResult.candidates &&
                                            generatedResult.candidates[0]
                                                ?.content?.parts?.[1]
                                                ?.inlineData && (
                                                <>
                                                    <img
                                                        src={`data:${generatedResult.candidates[0].content.parts[1].inlineData.mimeType};base64,${generatedResult.candidates[0].content.parts[1].inlineData.data}`}
                                                        alt="Generated image"
                                                        className="w-full rounded-lg shadow-sm mb-4"
                                                    />
                                                    <button
                                                        onClick={downloadImage}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                        Download
                                                    </button>
                                                </>
                                            )}
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg
                                                className="w-8 h-8 text-slate-400 dark:text-slate-500"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 mb-1">
                                            Ready to create
                                        </p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500">
                                            Draw something and hit generate
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                                <span>Draw with your mouse/touch</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                                <span>Choose your style</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                                <span>Generate & download</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
