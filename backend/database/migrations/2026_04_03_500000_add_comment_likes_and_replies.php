<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ajout parent_id pour les réponses imbriquées
        Schema::table('post_comments', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_id')->nullable()->after('post_id');
            $table->foreign('parent_id')->references('id')->on('post_comments')->cascadeOnDelete();
        });

        // Likes sur les commentaires
        Schema::create('post_comment_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('post_comment_id')->constrained('post_comments')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'post_comment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_comment_likes');
        Schema::table('post_comments', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn('parent_id');
        });
    }
};
