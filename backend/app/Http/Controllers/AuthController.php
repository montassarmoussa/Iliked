<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // GET /api/user/{username} — Profil d'un utilisateur (public + privé si c'est le sien)
    public function show(Request $request, string $username)
    {
        $user = User::where('username', $username)->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $data = [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'username' => $user->username,
            'picture' => $user->picture,
            'age' => $user->age,
            'sexe' => $user->sexe,
            'country' => $user->country,
            'city' => $user->city,
            'created_at' => $user->created_at,
            'is_owner' => false,
        ];

        // Films vus (likés)
        $data['watched'] = DB::table('watched')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->pluck('film_id');

        // Likes
        $data['likes'] = DB::table('likes')
            ->where('user_id', $user->id)
            ->where('type', 'like')
            ->pluck('film_id');

        // Watchlist
        $data['watchlist'] = DB::table('watchlist')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->pluck('film_id');

        // Reviews (commentaires)
        $data['reviews'] = DB::table('comments')
            ->where('comments.user_id', $user->id)
            ->orderBy('comments.created_at', 'desc')
            ->select('comments.id', 'comments.film_id', 'comments.content', 'comments.created_at')
            ->get();

        // Feed d'activité récente (20 dernières actions)
        $likesFeed = DB::table('likes')
            ->where('user_id', $user->id)
            ->select('film_id', 'created_at', DB::raw("type as action"))
            ->get()
            ->map(fn($r) => ['film_id' => $r->film_id, 'action' => $r->action === 'like' ? 'liked' : 'disliked', 'created_at' => $r->created_at]);

        $watchedFeed = DB::table('watched')
            ->where('user_id', $user->id)
            ->select('film_id', 'created_at', 'rating')
            ->get()
            ->map(fn($r) => ['film_id' => $r->film_id, 'action' => 'watched', 'rating' => $r->rating, 'created_at' => $r->created_at]);

        $watchlistFeed = DB::table('watchlist')
            ->where('user_id', $user->id)
            ->select('film_id', 'created_at')
            ->get()
            ->map(fn($r) => ['film_id' => $r->film_id, 'action' => 'watchlist', 'created_at' => $r->created_at]);

        $commentsFeed = DB::table('comments')
            ->where('user_id', $user->id)
            ->select('film_id', 'content', 'created_at')
            ->get()
            ->map(fn($r) => ['film_id' => $r->film_id, 'action' => 'commented', 'content' => $r->content, 'created_at' => $r->created_at]);

        $data['feed'] = $likesFeed
            ->merge($watchedFeed)
            ->merge($watchlistFeed)
            ->merge($commentsFeed)
            ->sortByDesc('created_at')
            ->take(20)
            ->values();

        // Stats
        $data['stats'] = [
            'watched_count' => DB::table('watched')->where('user_id', $user->id)->count(),
            'likes_count' => DB::table('likes')->where('user_id', $user->id)->where('type', 'like')->count(),
            'watchlist_count' => DB::table('watchlist')->where('user_id', $user->id)->count(),
            'reviews_count' => DB::table('comments')->where('user_id', $user->id)->count(),
            'followers_count' => DB::table('followers')->where('following_id', $user->id)->count(),
            'following_count' => DB::table('followers')->where('follower_id', $user->id)->count(),
        ];

        // Si le user connecté regarde son propre profil → ajouter email + is_owner
        $authUser = Auth::guard('sanctum')->user();
        if ($authUser && $authUser->id === $user->id) {
            $data['email'] = $user->email;
            $data['is_owner'] = true;
        }

        return response()->json($data);
    }

    // POST /api/register — Créer un nouveau compte utilisateur
    public function register(Request $request)
    {
        // Validation des données envoyées par le client
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',   // unique en BDD
            'email' => 'required|email|max:255|unique:users',       // unique en BDD
            'password' => 'required|string|min:8|confirmed',        // nécessite password_confirmation
        ]);

        // Création du user en BDD (le password est hashé automatiquement via le cast du modèle)
        $user = User::create($validated);

        // Génération d'un token Sanctum pour authentifier les prochaines requêtes
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    // POST /api/login — Connecter un utilisateur existant
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Recherche du user par email
        $user = User::where('email', $request->email)->first();

        // Vérification du mot de passe avec Hash::check (compare le plain text au hash en BDD)
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        // Génération d'un nouveau token pour cette session
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    // POST /api/user/setup — Configurer le profil (username, photo, ville, pays)
    public function setup(Request $request)
    {
        $validated = $request->validate([
            'email' => 'sometimes|email|max:255|unique:users,email,' . $request->user()->id,
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $request->user()->id,
            'picture' => 'sometimes|image|max:2048',
            'city' => 'sometimes|nullable|string|max:255',
            'country' => 'sometimes|nullable|string|max:255',
            'age' => 'sometimes|nullable|integer|min:1|max:150',
            'sexe' => 'sometimes|nullable|string|in:homme,femme,autre',
        ]);

        $user = $request->user();

        if ($request->hasFile('picture')) {
            $path = $request->file('picture')->store('avatars', 'public');
            $validated['picture'] = '/storage/' . $path;
        }

        $user->update($validated);

        return response()->json(['user' => $user]);
    }

    // POST /api/logout — Supprimer le token actuel (déconnexion)
    public function logout(Request $request)
    {
        // Supprime uniquement le token utilisé pour cette requête
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    // DELETE /api/user — Supprimer le compte
    public function destroy(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Compte supprimé.']);
    }
}
