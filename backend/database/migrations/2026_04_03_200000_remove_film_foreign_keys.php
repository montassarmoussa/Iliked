<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Supprime les tables qui ont des foreign keys vers films
        // et les recrée sans contrainte FK sur film_id (on utilise les IDs TMDB directement)
        Schema::dropIfExists('list_films');
        Schema::dropIfExists('lists');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('followers');
        Schema::dropIfExists('watched');
        Schema::dropIfExists('watchlist');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('comments');

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('film_id');
            $table->text('content');
            $table->timestamps();

            $table->index('film_id');
        });

        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('film_id');
            $table->string('type')->comment('like ou dislike');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'film_id']);
        });

        Schema::create('watchlist', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('film_id');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'film_id']);
        });

        Schema::create('watched', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('film_id');
            $table->integer('rating')->nullable()->comment('note de 1 à 10');
            $table->date('watched_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'film_id']);
        });

        Schema::create('followers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('following_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['follower_id', 'following_id']);
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('film_id');
            $table->string('title');
            $table->text('content');
            $table->integer('rating')->nullable()->comment('note de 1 à 10');
            $table->timestamps();

            $table->unique(['user_id', 'film_id']);
        });

        Schema::create('lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('list_films', function (Blueprint $table) {
            $table->unsignedBigInteger('list_id');
            $table->unsignedBigInteger('film_id');
            $table->integer('position')->nullable()->comment('ordre dans la liste');

            $table->primary(['list_id', 'film_id']);
            $table->foreign('list_id')->references('id')->on('lists')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('list_films');
        Schema::dropIfExists('lists');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('followers');
        Schema::dropIfExists('watched');
        Schema::dropIfExists('watchlist');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('comments');
    }
};
