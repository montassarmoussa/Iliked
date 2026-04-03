<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    // GET /api/posts — Feed de tous les posts (pour vous)
    public function index()
    {
        return $this->getFeed();
    }

    // GET /api/posts/following — Feed des abonnements uniquement
    public function following(Request $request)
    {
        $followingIds = DB::table('followers')
            ->where('follower_id', $request->user()->id)
            ->pluck('following_id')
            ->toArray();

        // Ajoute son propre ID pour voir aussi ses propres posts
        $followingIds[] = $request->user()->id;

        return $this->getFeed($followingIds);
    }

    private function getFeed(array $userIds = null)
    {
        $query = DB::table('posts')
            ->join('users', 'posts.user_id', '=', 'users.id')
            ->select(
                'posts.*',
                'users.username',
                'users.picture as user_picture'
            )
            ->orderBy('posts.created_at', 'desc')
            ->limit(50);

        if ($userIds) {
            $query->whereIn('posts.user_id', $userIds);
        }

        $posts = $query->get()->map(function ($post) {
            $post->likes_count = DB::table('post_likes')->where('post_id', $post->id)->count();
            $post->comments_count = DB::table('post_comments')->where('post_id', $post->id)->count();
            return $post;
        });

        return response()->json($posts);
    }

    // POST /api/posts — Créer un post
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
            'film_id' => 'nullable|integer',
        ]);

        $id = DB::table('posts')->insertGetId([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
            'film_id' => $validated['film_id'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $post = DB::table('posts')
            ->join('users', 'posts.user_id', '=', 'users.id')
            ->where('posts.id', $id)
            ->select('posts.*', 'users.username', 'users.picture as user_picture')
            ->first();

        $post->likes_count = 0;
        $post->comments_count = 0;

        return response()->json($post, 201);
    }

    // DELETE /api/posts/:id — Supprimer son post
    public function destroy(Request $request, int $id)
    {
        $deleted = DB::table('posts')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if (!$deleted) return response()->json(['message' => 'Non autorisé.'], 403);

        return response()->json(['message' => 'Supprimé.']);
    }

    // POST /api/posts/:id/like — Liker un post
    public function like(Request $request, int $id)
    {
        DB::table('post_likes')->updateOrInsert(
            ['user_id' => $request->user()->id, 'post_id' => $id],
            ['created_at' => now()]
        );

        $count = DB::table('post_likes')->where('post_id', $id)->count();
        return response()->json(['likes_count' => $count]);
    }

    // DELETE /api/posts/:id/like — Unliker un post
    public function unlike(Request $request, int $id)
    {
        DB::table('post_likes')
            ->where('user_id', $request->user()->id)
            ->where('post_id', $id)
            ->delete();

        $count = DB::table('post_likes')->where('post_id', $id)->count();
        return response()->json(['likes_count' => $count]);
    }

    // GET /api/posts/:id/comments — Commentaires d'un post (avec replies et likes)
    public function getComments(Request $request, int $id)
    {
        $userId = $request->user()?->id;

        $comments = DB::table('post_comments')
            ->join('users', 'post_comments.user_id', '=', 'users.id')
            ->where('post_comments.post_id', $id)
            ->select('post_comments.*', 'users.username', 'users.picture as user_picture')
            ->orderBy('post_comments.created_at', 'asc')
            ->get()
            ->map(function ($comment) use ($userId) {
                $comment->likes_count = DB::table('post_comment_likes')
                    ->where('post_comment_id', $comment->id)->count();
                $comment->liked = $userId ? DB::table('post_comment_likes')
                    ->where('post_comment_id', $comment->id)
                    ->where('user_id', $userId)->exists() : false;
                $comment->replies_count = DB::table('post_comments')
                    ->where('parent_id', $comment->id)->count();
                return $comment;
            });

        return response()->json($comments);
    }

    // POST /api/posts/:id/comments — Commenter un post (ou répondre à un commentaire)
    public function addComment(Request $request, int $id)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|integer|exists:post_comments,id',
        ]);

        $commentId = DB::table('post_comments')->insertGetId([
            'user_id' => $request->user()->id,
            'post_id' => $id,
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $comment = DB::table('post_comments')
            ->join('users', 'post_comments.user_id', '=', 'users.id')
            ->where('post_comments.id', $commentId)
            ->select('post_comments.*', 'users.username', 'users.picture as user_picture')
            ->first();

        $comment->likes_count = 0;
        $comment->liked = false;
        $comment->replies_count = 0;

        return response()->json($comment, 201);
    }

    // DELETE /api/post-comments/:id — Supprimer son commentaire
    public function deleteComment(Request $request, int $id)
    {
        $deleted = DB::table('post_comments')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->delete();

        if (!$deleted) return response()->json(['message' => 'Non autorisé.'], 403);

        return response()->json(['message' => 'Supprimé.']);
    }

    // POST /api/comments/:id/like — Liker un commentaire
    public function likeComment(Request $request, int $id)
    {
        DB::table('post_comment_likes')->updateOrInsert(
            ['user_id' => $request->user()->id, 'post_comment_id' => $id],
            ['created_at' => now()]
        );

        $count = DB::table('post_comment_likes')->where('post_comment_id', $id)->count();
        return response()->json(['likes_count' => $count, 'liked' => true]);
    }

    // DELETE /api/comments/:id/like — Unliker un commentaire
    public function unlikeComment(Request $request, int $id)
    {
        DB::table('post_comment_likes')
            ->where('user_id', $request->user()->id)
            ->where('post_comment_id', $id)
            ->delete();

        $count = DB::table('post_comment_likes')->where('post_comment_id', $id)->count();
        return response()->json(['likes_count' => $count, 'liked' => false]);
    }

    // GET /api/posts/:id/status — Est-ce que le user a liké ce post
    public function status(Request $request, int $id)
    {
        $liked = DB::table('post_likes')
            ->where('user_id', $request->user()->id)
            ->where('post_id', $id)
            ->exists();

        return response()->json(['liked' => $liked]);
    }
}
