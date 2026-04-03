<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FilmController extends Controller
{
    // POST /api/films/:tmdb_id/like — Liker ou disliker un film
    public function like(Request $request, int $tmdbId)
    {
        $request->validate([
            'type' => 'required|string|in:like,dislike',
        ]);

        $user = $request->user();

        // Upsert : met à jour si existe, crée sinon
        DB::table('likes')->updateOrInsert(
            ['user_id' => $user->id, 'film_id' => $tmdbId],
            ['type' => $request->type, 'created_at' => now()]
        );

        return response()->json(['message' => 'OK', 'type' => $request->type]);
    }

    // DELETE /api/films/:tmdb_id/like — Retirer son like/dislike
    public function unlike(Request $request, int $tmdbId)
    {
        DB::table('likes')
            ->where('user_id', $request->user()->id)
            ->where('film_id', $tmdbId)
            ->delete();

        return response()->json(['message' => 'OK']);
    }

    // POST /api/films/:tmdb_id/watchlist — Ajouter à la watchlist
    public function addWatchlist(Request $request, int $tmdbId)
    {
        $user = $request->user();

        DB::table('watchlist')->updateOrInsert(
            ['user_id' => $user->id, 'film_id' => $tmdbId],
            ['created_at' => now()]
        );

        return response()->json(['message' => 'Ajouté à la watchlist.']);
    }

    // DELETE /api/films/:tmdb_id/watchlist — Retirer de la watchlist
    public function removeWatchlist(Request $request, int $tmdbId)
    {
        DB::table('watchlist')
            ->where('user_id', $request->user()->id)
            ->where('film_id', $tmdbId)
            ->delete();

        return response()->json(['message' => 'Retiré de la watchlist.']);
    }

    // POST /api/films/:tmdb_id/watched — Marquer comme vu + note
    public function markWatched(Request $request, int $tmdbId)
    {
        $request->validate([
            'rating' => 'nullable|integer|min:1|max:10',
        ]);

        $user = $request->user();

        DB::table('watched')->updateOrInsert(
            ['user_id' => $user->id, 'film_id' => $tmdbId],
            ['rating' => $request->rating, 'watched_at' => now(), 'created_at' => now()]
        );

        return response()->json(['message' => 'Marqué comme vu.']);
    }

    // DELETE /api/films/:tmdb_id/watched — Retirer des films vus
    public function unmarkWatched(Request $request, int $tmdbId)
    {
        DB::table('watched')
            ->where('user_id', $request->user()->id)
            ->where('film_id', $tmdbId)
            ->delete();

        return response()->json(['message' => 'OK']);
    }

    // GET /api/films/:tmdb_id/comments — Récupérer les commentaires d'un film
    public function getComments(int $tmdbId)
    {
        $comments = DB::table('comments')
            ->join('users', 'comments.user_id', '=', 'users.id')
            ->where('comments.film_id', $tmdbId)
            ->select('comments.*', 'users.username', 'users.picture')
            ->orderBy('comments.created_at', 'desc')
            ->get();

        return response()->json($comments);
    }

    // POST /api/films/:tmdb_id/comments — Ajouter un commentaire
    public function addComment(Request $request, int $tmdbId)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $id = DB::table('comments')->insertGetId([
            'user_id' => $request->user()->id,
            'film_id' => $tmdbId,
            'content' => $request->content,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $comment = DB::table('comments')
            ->join('users', 'comments.user_id', '=', 'users.id')
            ->where('comments.id', $id)
            ->select('comments.*', 'users.username', 'users.picture')
            ->first();

        return response()->json($comment, 201);
    }

    // DELETE /api/comments/:id — Supprimer son commentaire
    public function deleteComment(Request $request, int $id)
    {
        $deleted = DB::table('comments')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        return response()->json(['message' => 'Supprimé.']);
    }

    // GET /api/films/:tmdb_id/status — Statut du user pour ce film (like, watchlist, watched)
    public function status(Request $request, int $tmdbId)
    {
        $userId = $request->user()->id;

        $like = DB::table('likes')->where('user_id', $userId)->where('film_id', $tmdbId)->first();
        $watchlist = DB::table('watchlist')->where('user_id', $userId)->where('film_id', $tmdbId)->exists();
        $watched = DB::table('watched')->where('user_id', $userId)->where('film_id', $tmdbId)->first();

        return response()->json([
            'like' => $like?->type ?? null,
            'in_watchlist' => $watchlist,
            'watched' => $watched ? true : false,
            'rating' => $watched?->rating ?? null,
        ]);
    }
}
