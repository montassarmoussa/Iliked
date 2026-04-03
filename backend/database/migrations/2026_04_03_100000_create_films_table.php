<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('films', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('poster')->nullable()->comment('URL de l\'affiche');
            $table->string('genre')->nullable();
            $table->string('director')->nullable();
            $table->date('release_date')->nullable();
            $table->integer('duration')->nullable()->comment('durée en minutes');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('films');
    }
};
