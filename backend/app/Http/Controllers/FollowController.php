<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FollowController extends Controller
{
    // POST /api/users/:id/follow — Suivre un utilisateur
    public function follow(Request $request, int $id)
    {
        $userId = $request->user()->id;
        if ($userId === $id) return response()->json(['message' => 'Impossible de se suivre soi-même.'], 422);

        DB::table('followers')->updateOrInsert(
            ['follower_id' => $userId, 'following_id' => $id],
            ['created_at' => now()]
        );

        return response()->json(['message' => 'Suivi.']);
    }

    // DELETE /api/users/:id/follow — Ne plus suivre
    public function unfollow(Request $request, int $id)
    {
        DB::table('followers')
            ->where('follower_id', $request->user()->id)
            ->where('following_id', $id)
            ->delete();

        return response()->json(['message' => 'Désabonné.']);
    }

    // GET /api/users/:id/followers — Liste des abonnés
    public function followers(int $id)
    {
        $followers = DB::table('followers')
            ->join('users', 'followers.follower_id', '=', 'users.id')
            ->where('followers.following_id', $id)
            ->select('users.id', 'users.username', 'users.picture', 'users.first_name', 'users.last_name')
            ->get();

        return response()->json($followers);
    }

    // GET /api/users/:id/following — Liste des abonnements
    public function following(int $id)
    {
        $following = DB::table('followers')
            ->join('users', 'followers.following_id', '=', 'users.id')
            ->where('followers.follower_id', $id)
            ->select('users.id', 'users.username', 'users.picture', 'users.first_name', 'users.last_name')
            ->get();

        return response()->json($following);
    }

    // GET /api/users/:id/follow-status — Est-ce que je suis cet utilisateur
    public function status(Request $request, int $id)
    {
        $following = DB::table('followers')
            ->where('follower_id', $request->user()->id)
            ->where('following_id', $id)
            ->exists();

        $followersCount = DB::table('followers')->where('following_id', $id)->count();
        $followingCount = DB::table('followers')->where('follower_id', $id)->count();

        return response()->json([
            'is_following' => $following,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
        ]);
    }
}
