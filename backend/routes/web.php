<?php

use Illuminate\Support\Facades\Route;

// Toutes les routes non-API servent le SPA React
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
