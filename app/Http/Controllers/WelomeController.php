<?php

namespace App\Http\Controllers;

use Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Log;

class WelomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome');
    }

    public function generateImage(Request $request)
    {
        $request->validate([
            'sketch_data' => 'required|string',
            'prompt' => 'string|nullable'
        ]);

        Log::info('Received request to generate image with sketch data: ' . substr($request->sketch_data, 0, 100) . '...'); // Log a truncated version for brevity

        try {
            $sketchData = $request->sketch_data;
            $prompt = $request->prompt ? "Create a complete " . $request->prompt . " based on this rough sketch " :  "Create a colourful doodle based on this rough sketch ";
            $prompt = $prompt . ". Try to understand the rough sketch as much as possible and generate a complete image, if text is given in image style the text according to the sketch type mentioned.";
            // Remove data:image/png;base64, prefix if present
            $imageData = preg_replace('/^data:image\/[a-z]+;base64,/', '', $sketchData);
            $decodedImageData = base64_decode($imageData);

            if ($decodedImageData === false) {
                throw new \Exception("Failed to decode base64 image data.");
            }

            $geminiApiKey = env('GEMINI_API_KEY');
            if (empty($geminiApiKey)) {
                throw new \Exception("GEMINI_API_KEY environment variable is not set.");
            }

            // Correct API call for Gemini 2.0 Flash Preview Image Generation
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key={$geminiApiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $prompt,
                            ],
                            [
                                'inline_data' => [
                                    'mime_type' => 'image/png',
                                    'data' => $imageData // Use the original base64 string without re-encoding
                                ]
                            ]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'topK' => 40,
                    'topP' => 0.95,
                    'maxOutputTokens' => 1024,
                    'response_modalities' => ['TEXT', 'IMAGE'] // This is crucial for image generation
                ]
            ]);

            if ($response->successful()) {
                $result = $response->json();

                // The response should contain both text and image data
                $candidates = $result['candidates'] ?? [];
                $generatedContent = [];

                foreach ($candidates as $candidate) {
                    $parts = $candidate['content']['parts'] ?? [];
                    foreach ($parts as $part) {
                        if (isset($part['text'])) {
                            $generatedContent['text'] = $part['text'];
                        }
                        if (isset($part['inline_data'])) {
                            $generatedContent['image'] = [
                                'mime_type' => $part['inline_data']['mime_type'],
                                'data' => $part['inline_data']['data']
                            ];
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'result' => $result,
                    'generated_content' => $generatedContent,
                ]);
            }

            // Log the full response body for debugging failed API calls
            Log::error('Gemini API call failed: ' . $response->body());

            return response()->json([
                'success' => false,
                'error' => 'Failed to process with Gemini API. Status: ' . $response->status(),
                'details' => $response->json()
            ], 500);

        } catch (\Exception $e) {
            Log::error('Image generation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
