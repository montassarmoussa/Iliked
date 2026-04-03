<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FriendController extends Controller
{
    // GET /api/friends/search?q=... — Rechercher des utilisateurs
    public function search(Request $request)
    {
        $q = $request->query('q', '');
        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $userId = $request->user()->id;

        $users = DB::table('users')
            ->where('id', '!=', $userId)
            ->where(function ($query) use ($q) {
                $query->where('username', 'like', "%{$q}%")
                      ->orWhere('first_name', 'like', "%{$q}%")
                      ->orWhere('last_name', 'like', "%{$q}%");
            })
            ->select('id', 'username', 'first_name', 'last_name', 'picture')
            ->limit(20)
            ->get();

        // Ajouter le statut d'amitié pour chaque utilisateur
        $users = $users->map(function ($user) use ($userId) {
            $friendship = DB::table('friendships')
                ->where(function ($q) use ($userId, $user) {
                    $q->where('sender_id', $userId)->where('receiver_id', $user->id);
                })
                ->orWhere(function ($q) use ($userId, $user) {
                    $q->where('sender_id', $user->id)->where('receiver_id', $userId);
                })
                ->first();

            $user->friendship_status = null;
            $user->is_sender = false;

            if ($friendship) {
                $user->friendship_status = $friendship->status;
                $user->is_sender = $friendship->sender_id === $userId;
            }

            return $user;
        });

        return response()->json($users);
    }

    // POST /api/friends/request/{id} — Envoyer une demande d'ami
    public function sendRequest(Request $request, int $id)
    {
        $userId = $request->user()->id;

        if ($userId === $id) {
            return response()->json(['message' => 'Impossible de s\'ajouter soi-même.'], 422);
        }

        // Vérifier si une relation existe déjà
        $existing = DB::table('friendships')
            ->where(function ($q) use ($userId, $id) {
                $q->where('sender_id', $userId)->where('receiver_id', $id);
            })
            ->orWhere(function ($q) use ($userId, $id) {
                $q->where('sender_id', $id)->where('receiver_id', $userId);
            })
            ->first();

        if ($existing) {
            if ($existing->status === 'accepted') {
                return response()->json(['message' => 'Vous êtes déjà amis.'], 422);
            }
            if ($existing->status === 'pending') {
                // Si l'autre personne nous a déjà envoyé une demande, on l'accepte
                if ((int) $existing->sender_id === $id) {
                    DB::table('friendships')
                        ->where('id', $existing->id)
                        ->update(['status' => 'accepted', 'updated_at' => now()]);

                    return response()->json(['message' => 'Demande acceptée !', 'status' => 'accepted']);
                }
                return response()->json(['message' => 'Demande déjà envoyée.'], 422);
            }
            // Si rejetée, on supprime et on renvoie
            DB::table('friendships')->where('id', $existing->id)->delete();
        }

        DB::table('friendships')->insert([
            'sender_id' => $userId,
            'receiver_id' => $id,
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Demande envoyée.', 'status' => 'pending']);
    }

    // POST /api/friends/accept/{id} — Accepter une demande
    public function accept(Request $request, int $id)
    {
        $userId = $request->user()->id;

        $updated = DB::table('friendships')
            ->where('sender_id', $id)
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->update(['status' => 'accepted', 'updated_at' => now()]);

        if (!$updated) {
            return response()->json(['message' => 'Aucune demande trouvée.'], 404);
        }

        return response()->json(['message' => 'Demande acceptée !']);
    }

    // POST /api/friends/reject/{id} — Refuser une demande
    public function reject(Request $request, int $id)
    {
        $userId = $request->user()->id;

        DB::table('friendships')
            ->where('sender_id', $id)
            ->where('receiver_id', $userId)
            ->where('status', 'pending')
            ->delete();

        return response()->json(['message' => 'Demande refusée.']);
    }

    // DELETE /api/friends/{id} — Supprimer un ami
    public function remove(Request $request, int $id)
    {
        $userId = $request->user()->id;

        DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($userId, $id) {
                $q->where(function ($q2) use ($userId, $id) {
                    $q2->where('sender_id', $userId)->where('receiver_id', $id);
                })->orWhere(function ($q2) use ($userId, $id) {
                    $q2->where('sender_id', $id)->where('receiver_id', $userId);
                });
            })
            ->delete();

        return response()->json(['message' => 'Ami supprimé.']);
    }

    // GET /api/friends — Liste de mes amis
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $friends = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
            })
            ->get()
            ->map(function ($f) use ($userId) {
                return (int) $f->sender_id === $userId ? $f->receiver_id : $f->sender_id;
            });

        $users = DB::table('users')
            ->whereIn('id', $friends)
            ->select('id', 'username', 'first_name', 'last_name', 'picture')
            ->get();

        return response()->json($users);
    }

    // GET /api/friends/pending — Demandes reçues en attente
    public function pending(Request $request)
    {
        $userId = $request->user()->id;

        $requests = DB::table('friendships')
            ->join('users', 'friendships.sender_id', '=', 'users.id')
            ->where('friendships.receiver_id', $userId)
            ->where('friendships.status', 'pending')
            ->select('users.id', 'users.username', 'users.first_name', 'users.last_name', 'users.picture', 'friendships.created_at')
            ->orderByDesc('friendships.created_at')
            ->get();

        return response()->json($requests);
    }

    // GET /api/friends/status/{id} — Statut d'amitié avec un utilisateur
    public function status(Request $request, int $id)
    {
        $userId = $request->user()->id;

        $friendship = DB::table('friendships')
            ->where(function ($q) use ($userId, $id) {
                $q->where('sender_id', $userId)->where('receiver_id', $id);
            })
            ->orWhere(function ($q) use ($userId, $id) {
                $q->where('sender_id', $id)->where('receiver_id', $userId);
            })
            ->first();

        if (!$friendship) {
            return response()->json(['status' => null, 'is_sender' => false]);
        }

        return response()->json([
            'status' => $friendship->status,
            'is_sender' => (int) $friendship->sender_id === $userId,
        ]);
    }
}
