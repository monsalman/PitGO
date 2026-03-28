<?php

namespace App\Http\Controllers;

use App\Events\BookingStatusUpdated;
use App\Events\NewBookingEvent;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Display a listing of bookings for the current user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        $query = Booking::with(['workshop', 'user', 'mechanic']);

        if ($user->role === 'workshop') {
            // Workshop owner sees only bookings for their workshop
            $query->where('workshop_id', $user->workshop_id);
        } elseif ($user->role === 'mechanic') {
            // Mechanic sees only bookings assigned to them
            $query->where('mechanic_id', $user->id);
        } elseif ($user->role === 'admin') {
            // Admin sees all
        } else {
            $query->where('user_id', $user->id);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Store a newly created booking.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'workshop_id' => 'required|exists:workshops,id',
            'vehicle_type' => 'required|in:motor,mobil',
            'vehicle_brand' => 'required|string',
            'vehicle_year' => 'nullable|string',
            'problem_category' => 'required|string',
            'problem_description' => 'nullable|string',
            'user_location' => 'required|string',
            'user_address' => 'required|string',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['status'] = 'pending';

        // Automatic cost estimation
        $estimates = $this->getEstimates($validated['problem_category']);
        $validated['estimated_cost_min'] = $estimates['min'];
        $validated['estimated_cost_max'] = $estimates['max'];

        try {
            $booking = Booking::create($validated);
            $booking->load(['user', 'workshop']);

            // Broadcast to workshop with error handling
            try {
                broadcast(new NewBookingEvent($booking))->toOthers();
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::warning('Broadcast failed but booking created: ' . $e->getMessage());
            }

            return response()->json($booking, 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Booking creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Gagal membuat booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified booking.
     */
    public function show($id)
    {
        $booking = Booking::with(['workshop', 'user', 'mechanic'])->findOrFail($id);
        return $booking;
    }

    /**
     * Workshop accepts the booking and assigns a mechanic.
     */
    public function accept(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $validated = $request->validate([
            'mechanic_id' => 'required|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $booking->update([
            'mechanic_id' => $validated['mechanic_id'],
            'status' => 'accepted',
            'notes' => $validated['notes'] ?? $booking->notes,
        ]);

        broadcast(new BookingStatusUpdated($booking))->toOthers();

        return $booking;
    }

    /**
     * Update booking status.
     */
    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:on_the_way,arrived,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
            'final_cost' => 'nullable|integer',
        ]);

        $updateData = ['status' => $validated['status']];
        if (isset($validated['notes'])) $updateData['notes'] = $validated['notes'];
        if (isset($validated['final_cost'])) $updateData['final_cost'] = $validated['final_cost'];

        $booking->update($updateData);

        broadcast(new BookingStatusUpdated($booking))->toOthers();

        return $booking;
    }

    /**
     * Update mechanic's real-time location.
     */
    public function updateMechanicLocation(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $validated = $request->validate([
            'location' => 'required|string', // lat,lng
        ]);

        $booking->update(['mechanic_location' => $validated['location']]);

        // Broadcast location update to user
        broadcast(new BookingStatusUpdated($booking))->toOthers();

        return response()->json(['status' => 'success']);
    }

    /**
     * Update cost estimate manually by workshop.
     */
    public function updateEstimate(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $validated = $request->validate([
            'min' => 'required|integer',
            'max' => 'required|integer',
        ]);

        $booking->update([
            'estimated_cost_min' => $validated['min'],
            'estimated_cost_max' => $validated['max'],
        ]);

        broadcast(new BookingStatusUpdated($booking))->toOthers();

        return $booking;
    }

    /**
     * Helper for automatic cost estimation logic.
     */
    private function getEstimates($category)
    {
        $map = [
            'Ban & Roda' => ['min' => 30000, 'max' => 80000],
            'Kelistrikan' => ['min' => 50000, 'max' => 250000],
            'Mesin' => ['min' => 75000, 'max' => 300000],
            'Transmisi' => ['min' => 40000, 'max' => 150000],
            'Rem' => ['min' => 50000, 'max' => 200000],
            'Bahan Bakar' => ['min' => 30000, 'max' => 200000],
            'Kunci & Body' => ['min' => 25000, 'max' => 150000],
            'Lainnya' => ['min' => 0, 'max' => 0], // Sesuai pengecekan
        ];

        return $map[$category] ?? ['min' => null, 'max' => null];
    }
}
