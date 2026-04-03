<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    // GET /api/messages — Liste des conversations (dernier message de chaque ami)
    public function conversations(Request $request)
    {
        $userId = $request->user()->id;

        // Récupérer tous les amis avec qui on a échangé + amis sans messages
        $friendIds = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
            })
            ->get()
            ->map(fn($f) => (int) $f->sender_id === $userId ? $f->receiver_id : $f->sender_id);

        if ($friendIds->isEmpty()) {
            return response()->json([]);
        }

        $conversations = [];

        foreach ($friendIds as $friendId) {
            $lastMessage = DB::table('messages')
                ->where(function ($q) use ($userId, $friendId) {
                    $q->where('sender_id', $userId)->where('receiver_id', $friendId);
                })
                ->orWhere(function ($q) use ($userId, $friendId) {
                    $q->where('sender_id', $friendId)->where('receiver_id', $userId);
                })
                ->orderByDesc('created_at')
                ->first();

            $unreadCount = DB::table('messages')
                ->where('sender_id', $friendId)
                ->where('receiver_id', $userId)
                ->where('is_read', false)
                ->count();

            $friend = DB::table('users')
                ->where('id', $friendId)
                ->select('id', 'username', 'first_name', 'last_name', 'picture')
                ->first();

            if ($friend) {
                $conversations[] = [
                    'friend' => $friend,
                    'last_message' => $lastMessage ? [
                        'content' => $lastMessage->content,
                        'sender_id' => $lastMessage->sender_id,
                        'created_at' => $lastMessage->created_at,
                    ] : null,
                    'unread_count' => $unreadCount,
                ];
            }
        }

        // Trier : conversations avec messages récents en premier, puis sans messages
        usort($conversations, function ($a, $b) {
            if (!$a['last_message'] && !$b['last_message']) return 0;
            if (!$a['last_message']) return 1;
            if (!$b['last_message']) return -1;
            return strcmp($b['last_message']['created_at'], $a['last_message']['created_at']);
        });

        return response()->json($conversations);
    }

    // GET /api/messages/{id} — Messages avec un ami
    public function show(Request $request, int $id)
    {
        $userId = $request->user()->id;

        // Vérifier qu'ils sont amis
        $isFriend = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($userId, $id) {
                $q->where(function ($q2) use ($userId, $id) {
                    $q2->where('sender_id', $userId)->where('receiver_id', $id);
                })->orWhere(function ($q2) use ($userId, $id) {
                    $q2->where('sender_id', $id)->where('receiver_id', $userId);
                });
            })
            ->exists();

        if (!$isFriend) {
            return response()->json(['message' => 'Vous devez être amis pour échanger des messages.'], 403);
        }

        // Marquer les messages reçus comme lus
        DB::table('messages')
            ->where('sender_id', $id)
            ->where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        // Récupérer les messages (les 100 derniers)
        $messages = DB::table('messages')
            ->where(function ($q) use ($userId, $id) {
                $q->where('sender_id', $userId)->where('receiver_id', $id);
            })
            ->orWhere(function ($q) use ($userId, $id) {
                $q->where('sender_id', $id)->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->limit(100)
            ->get();

        return response()->json($messages);
    }

    // POST /api/messages/{id} — Envoyer un message
    public function send(Request $request, int $id)
    {
        $userId = $request->user()->id;

        $request->validate(['content' => 'required|string|max:2000']);

        if ($userId === $id) {
            return response()->json(['message' => 'Impossible de s\'envoyer un message.'], 422);
        }

        // Vérifier qu'ils sont amis
        $isFriend = DB::table('friendships')
            ->where('status', 'accepted')
            ->where(function ($q) use ($userId, $id) {
                $q->where(function ($q2) use ($userId, $id) {
                    $q2->where('sender_id', $userId)->where('receiver_id', $id);
                })->orWhere(function ($q2) use ($userId, $id) {
                    $q2->where('sender_id', $id)->where('receiver_id', $userId);
                });
            })
            ->exists();

        if (!$isFriend) {
            return response()->json(['message' => 'Vous devez être amis pour échanger des messages.'], 403);
        }

        $messageId = DB::table('messages')->insertGetId([
            'sender_id' => $userId,
            'receiver_id' => $id,
            'content' => $request->content,
            'is_read' => false,
            'created_at' => now(),
        ]);

        $message = DB::table('messages')->where('id', $messageId)->first();

        return response()->json($message, 201);
    }

    // DELETE /api/messages/{id} — Supprimer un message (seulement les siens)
    public function destroy(Request $request, int $id)
    {
        $userId = $request->user()->id;

        $deleted = DB::table('messages')
            ->where('id', $id)
            ->where('sender_id', $userId)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Message introuvable.'], 404);
        }

        return response()->json(['message' => 'Message supprimé.']);
    }

    // GET /api/messages/unread-count — Nombre total de messages non lus
    public function unreadCount(Request $request)
    {
        $count = DB::table('messages')
            ->where('receiver_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}
