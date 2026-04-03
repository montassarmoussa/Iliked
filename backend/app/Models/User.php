<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Ajouté pour l'authentification par token API (Sanctum)

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable; // HasApiTokens ajouté pour générer des tokens de connexion

    // Champs autorisés à être remplis en masse (correspondant au schéma mysql.sql)
    protected $fillable = [
        'first_name',  // Remplace 'name' du modèle par défaut
        'last_name',
        'username',
        'email',
        'password',
        'picture',
        'age',
        'country',
        'city',
        'sexe',
    ];

    // Champs cachés dans les réponses JSON
    protected $hidden = [
        'password',
    ];

    // Cast automatique : le password est hashé avant d'être sauvegardé en BDD
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
