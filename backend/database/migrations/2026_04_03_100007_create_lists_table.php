<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('list_films', function (Blueprint $table) {
            $table->foreignId('list_id')->constrained('lists')->cascadeOnDelete();
            $table->foreignId('film_id')->constrained()->cascadeOnDelete();
            $table->integer('position')->nullable()->comment('ordre dans la liste');

            $table->primary(['list_id', 'film_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('list_films');
        Schema::dropIfExists('lists');
    }
};
