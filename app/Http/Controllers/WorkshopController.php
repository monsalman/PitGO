<?php

namespace App\Http\Controllers;

use App\Models\Workshop;
use Illuminate\Http\Request;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class WorkshopController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Workshop::orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'location' => 'nullable|string',
            'photo' => 'nullable', // Can be string or file
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_open' => 'required',
        ]);

        // If it is a file, validate it manually or via a separate validator
        if ($request->hasFile('photo')) {
            $request->validate(['photo' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048']);
        }

        if (empty($validated['location']) && !empty($validated['address'])) {
            $validated['location'] = $this->geocode($validated['address']);
        }

        if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
            try {
                // Correct method for version 2.x/3.x of the SDK
                $result = cloudinary()->uploadApi()->upload($request->file('photo')->getRealPath(), [
                    'folder' => 'workshops'
                ]);
                $validated['photo'] = $result['secure_url'];
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Cloudinary upload failed: ' . $e->getMessage());
                return response()->json(['message' => 'Upload ke Cloudinary gagal: ' . $e->getMessage()], 500);
            }
        }

        return Workshop::create($validated);
    }

    /**
     * Display the specified resource.
     */
    public function show(Workshop $workshop)
    {
        return $workshop;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Workshop $workshop)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string',
            'location' => 'nullable|string',
            'photo' => 'nullable',
            'rating' => 'nullable|numeric|min:0|max:5',
            'is_open' => 'sometimes',
        ]);

        if ($request->hasFile('photo')) {
            $request->validate(['photo' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048']);
        }

        if (empty($validated['location']) && !empty($validated['address'])) {
            $validated['location'] = $this->geocode($validated['address']);
        }

        if ($request->hasFile('photo') && $request->file('photo')->isValid()) {
            try {
                // Delete OLD photo before uploading new one to keep storage clean
                if (!empty($workshop->photo)) {
                    $this->deleteFromCloudinary($workshop->photo);
                }

                $result = cloudinary()->uploadApi()->upload($request->file('photo')->getRealPath(), [
                    'folder' => 'workshops'
                ]);
                $validated['photo'] = $result['secure_url'];
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Cloudinary update failed: ' . $e->getMessage());
                return response()->json(['message' => 'Update foto ke Cloudinary gagal: ' . $e->getMessage()], 500);
            }
        }

        $workshop->update($validated);
        return $workshop;
    }

    /**
     * Public API endpoint for frontend geocoding
     */
    public function geocodeApi(Request $request)
    {
        $address = $request->query('q');
        if (empty($address)) return response()->json(['error' => 'Address is required'], 400);
        
        $location = $this->geocode($address);
        return response()->json(['location' => $location]);
    }

    /**
     * Public API endpoint for reverse geocoding
     */
    public function reverseGeocodeApi(Request $request)
    {
        $lat = $request->query('lat');
        $lon = $request->query('lon');
        if (empty($lat) || empty($lon)) return response()->json(['error' => 'Lat and Lon are required'], 400);

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'User-Agent' => 'PitGO-Workshop-Management/1.2 (salman@pitgo.id)'
            ])->get('https://nominatim.openstreetmap.org/reverse', [
                'lat' => $lat,
                'lon' => $lon,
                'format' => 'json',
                'zoom' => 18,
                'addressdetails' => 1
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Reverse geocoding failed: ' . $e->getMessage());
        }

        return response()->json(['error' => 'Failed to reverse geocode'], 500);
    }

    /**
     * Helper to geocode address via Nominatim (OpenStreetMap)
     * Implements multi-strategy lookup for better accuracy
     */
    private function geocode(string $address): ?string
    {
        if (empty($address)) return null;

        // Clean up Indonesia-specific noise: RT/RW, No., Blok, Kode Pos
        $cleanAddress = preg_replace('/\bRT\.?\s?\d+\s?RW\.?\s?\d+\b/i', '', $address);
        $cleanAddress = preg_replace('/\b(No\.|No|Blok|Kav|Lt\.)\s?[A-Z0-9\-\/]+\b/i', '', $cleanAddress);
        $cleanAddress = preg_replace('/\b\d{5}\b/', '', $cleanAddress); // Postal code
        $cleanAddress = trim(preg_replace('/\s+/', ' ', $cleanAddress));
        
        $parts = array_map('trim', preg_split('/[,]+/', $cleanAddress));
        $parts = array_filter($parts);

        // Strategy 1: The cleaned full address
        $result = $this->queryNominatim($cleanAddress);
        if ($result && $this->isSpecificEnough($result)) return $this->formatCoords($result);

        // Strategy 2: First 3 parts (usually Street, Suburb, District)
        if (count($parts) >= 3) {
            $trial = implode(', ', array_slice($parts, 0, 3));
            $result = $this->queryNominatim($trial);
            if ($result && $this->isSpecificEnough($result)) return $this->formatCoords($result);
        }

        // Strategy 3: First 2 parts (usually Street, Suburb)
        if (count($parts) >= 2) {
            $trial = implode(', ', array_slice($parts, 0, 2));
            $result = $this->queryNominatim($trial);
            if ($result && $this->isSpecificEnough($result)) return $this->formatCoords($result);
        }

        // Fallback Strategy: Recursive stripping (current method)
        $currentParts = $parts;
        while (count($currentParts) > 1) {
            array_shift($currentParts);
            $fallback = implode(', ', $currentParts);
            if (strlen($fallback) < 5) break;
            
            $result = $this->queryNominatim($fallback);
            if ($result) return $this->formatCoords($result);
        }

        // Ultimate fallback: Just return whatever the first search found, even if broad
        $broadResult = $this->queryNominatim($address);
        return $broadResult ? $this->formatCoords($broadResult) : null;
    }

    /**
     * Core Nominatim Query Logic
     */
    private function queryNominatim(string $query): ?array
    {
        $query = trim($query);
        if (empty($query) || strlen($query) < 2) return null;

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'User-Agent' => 'PitGO-Workshop-Management/1.2 (salman@pitgo.id)',
                'Accept-Language' => 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
            ])->get('https://nominatim.openstreetmap.org/search', [
                'q' => $query,
                'format' => 'json',
                'limit' => 3,
                'countrycodes' => 'id',
                'addressdetails' => 1
            ]);

            if ($response->successful()) {
                $results = $response->json();
                
                if (!is_array($results) || count($results) === 0) {
                    return null;
                }
                
                // Prioritize specific location types
                foreach ($results as $res) {
                    if (!is_array($res)) continue;
                    
                    $type = $res['type'] ?? '';
                    $class = $res['class'] ?? '';
                    
                    if ($type === 'house' || $type === 'residential' || $class === 'highway') {
                        return $res;
                    }
                }
                
                // Final safety check on the first result
                $first = $results[0] ?? null;
                return is_array($first) ? $first : null;
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Geocoding query failed: ' . $e->getMessage());
        }
        return null;
    }

    /**
     * Check if the result is a specific point or just a broad area
     */
    private function isSpecificEnough(array $result): bool
    {
        $broadTypes = ['administrative', 'city', 'state', 'country', 'island'];
        $type = $result['type'] ?? '';
        $class = $result['class'] ?? '';
        return !in_array($type, $broadTypes) && !in_array($class, $broadTypes);
    }

    /**
     * Format coordinates from result array
     */
    private function formatCoords(array $result): string
    {
        $lat = $result['lat'] ?? '0';
        $lon = $result['lon'] ?? '0';
        return $lat . ',' . $lon;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workshop $workshop)
    {
        // Delete image from Cloudinary before deleting from database
        if (!empty($workshop->photo)) {
            $this->deleteFromCloudinary($workshop->photo);
        }
        
        $workshop->delete();
        return response()->noContent();
    }

    /**
     * Helper to delete an image from Cloudinary based on its secure URL
     */
    private function deleteFromCloudinary(?string $url): void
    {
        if (empty($url) || !str_contains($url, 'cloudinary')) return;

        try {
            // Standard Cloudinary URL contains /upload/v[version]/[public_id].[ext]
            $parts = explode('/upload/', $url);
            if (count($parts) < 2) return;

            // Parts[1] is something like "v1710712345/workshops/abcde123.jpg"
            $idWithExt = $parts[1];
            $idSegments = explode('/', $idWithExt);
            
            // Skip the version segment (v12345...) if present
            if (str_starts_with($idSegments[0], 'v') && is_numeric(substr($idSegments[0], 1))) {
                array_shift($idSegments);
            }
            
            // Reconstruct the public_id and remove extension
            $fullIdWithExt = implode('/', $idSegments);
            $publicId = pathinfo($fullIdWithExt, PATHINFO_FILENAME);
            
            // If it had folders like "workshops/abc", pathinfo filename only gives "abc"
            // We need to keep the folder path for Cloudinary deletion to work
            $folderPath = count($idSegments) > 1 ? (dirname($fullIdWithExt) . '/') : '';
            $finalPublicId = $folderPath . $publicId;

            cloudinary()->uploadApi()->destroy($finalPublicId);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Gagal menghapus gambar Cloudinary: ' . $e->getMessage());
        }
    }
}
