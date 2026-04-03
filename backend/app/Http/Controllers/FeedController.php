<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeedController extends Controller
{
    // GET /api/feed — Feed global de toute l'activité
    public function index()
    {
        $likes = DB::table('likes')
            ->join('users', 'likes.user_id', '=', 'users.id')
            ->select(
                'likes.id',
                'likes.user_id',
                'likes.film_id',
                'likes.created_at',
                DB::raw("likes.type as action"),
                'users.username',
                'users.picture as user_picture',
                DB::raw("NULL as content"),
                DB::raw("NULL as rating"),
                DB::raw("'like' as feed_type")
            );

        $watched = DB::table('watched')
            ->join('users', 'watched.user_id', '=', 'users.id')
            ->select(
                'watched.id',
                'watched.user_id',
                'watched.film_id',
                'watched.created_at',
                DB::raw("'watched' as action"),
                'users.username',
                'users.picture as user_picture',
                DB::raw("NULL as content"),
                'watched.rating',
                DB::raw("'watched' as feed_type")
            );

        $watchlist = DB::table('watchlist')
            ->join('users', 'watchlist.user_id', '=', 'users.id')
            ->select(
                'watchlist.id',
                'watchlist.user_id',
                'watchlist.film_id',
                'watchlist.created_at',
                DB::raw("'watchlist' as action"),
                'users.username',
                'users.picture as user_picture',
                DB::raw("NULL as content"),
                DB::raw("NULL as rating"),
                DB::raw("'watchlist' as feed_type")
            );

        $comments = DB::table('comments')
            ->join('users', 'comments.user_id', '=', 'users.id')
            ->select(
                'comments.id',
                'comments.user_id',
                'comments.film_id',
                'comments.created_at',
                DB::raw("'commented' as action"),
                'users.username',
                'users.picture as user_picture',
                'comments.content',
                DB::raw("NULL as rating"),
                DB::raw("'comment' as feed_type")
            );

        $feed = $likes
            ->unionAll($watched)
            ->unionAll($watchlist)
            ->unionAll($comments)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json($feed);
    }

    // POST /api/feed/:id/report — Signaler un élément du feed
    public function report(Request $request, int $id)
    {
        $request->validate([
            'feed_type' => 'required|string|in:like,watched,watchlist,comment',
            'reason' => 'required|string|max:500',
        ]);

        DB::table('reports')->insert([
            'user_id' => $request->user()->id,
            'reportable_id' => $id,
            'reportable_type' => $request->feed_type,
            'reason' => $request->reason,
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Signalement envoyé.']);
    }
}
