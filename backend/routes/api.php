<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\FilmController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\MessageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/user/{username}', [AuthController::class, 'show']);

// Commentaires lisibles sans auth
Route::get('/films/{tmdbId}/comments', [FilmController::class, 'getComments']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/setup', [AuthController::class, 'setup']);
    Route::delete('/user', [AuthController::class, 'destroy']);

    // Films — interactions
    Route::get('/films/{tmdbId}/status', [FilmController::class, 'status']);
    Route::post('/films/{tmdbId}/like', [FilmController::class, 'like']);
    Route::delete('/films/{tmdbId}/like', [FilmController::class, 'unlike']);
    Route::post('/films/{tmdbId}/watchlist', [FilmController::class, 'addWatchlist']);
    Route::delete('/films/{tmdbId}/watchlist', [FilmController::class, 'removeWatchlist']);
    Route::post('/films/{tmdbId}/watched', [FilmController::class, 'markWatched']);
    Route::delete('/films/{tmdbId}/watched', [FilmController::class, 'unmarkWatched']);
    Route::post('/films/{tmdbId}/comments', [FilmController::class, 'addComment']);
    Route::delete('/comments/{id}', [FilmController::class, 'deleteComment']);

    // Feed
    Route::get('/feed', [FeedController::class, 'index']);
    Route::post('/feed/{id}/report', [FeedController::class, 'report']);

    // Follow
    Route::post('/users/{id}/follow', [FollowController::class, 'follow']);
    Route::delete('/users/{id}/follow', [FollowController::class, 'unfollow']);
    Route::get('/users/{id}/followers', [FollowController::class, 'followers']);
    Route::get('/users/{id}/following', [FollowController::class, 'following']);
    Route::get('/users/{id}/follow-status', [FollowController::class, 'status']);

    // Posts
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/following', [PostController::class, 'following']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/like', [PostController::class, 'like']);
    Route::delete('/posts/{id}/like', [PostController::class, 'unlike']);
    Route::get('/posts/{id}/comments', [PostController::class, 'getComments']);
    Route::post('/posts/{id}/comments', [PostController::class, 'addComment']);
    Route::get('/posts/{id}/status', [PostController::class, 'status']);
    Route::post('/post-comments/{id}/like', [PostController::class, 'likeComment']);
    Route::delete('/post-comments/{id}/like', [PostController::class, 'unlikeComment']);
    Route::delete('/post-comments/{id}', [PostController::class, 'deleteComment']);

    // Friends
    Route::get('/friends', [FriendController::class, 'index']);
    Route::get('/friends/search', [FriendController::class, 'search']);
    Route::get('/friends/pending', [FriendController::class, 'pending']);
    Route::get('/friends/status/{id}', [FriendController::class, 'status']);
    Route::post('/friends/request/{id}', [FriendController::class, 'sendRequest']);
    Route::post('/friends/accept/{id}', [FriendController::class, 'accept']);
    Route::post('/friends/reject/{id}', [FriendController::class, 'reject']);
    Route::delete('/friends/{id}', [FriendController::class, 'remove']);

    // Messages
    Route::get('/messages', [MessageController::class, 'conversations']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/{id}', [MessageController::class, 'show']);
    Route::post('/messages/{id}', [MessageController::class, 'send']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
});
