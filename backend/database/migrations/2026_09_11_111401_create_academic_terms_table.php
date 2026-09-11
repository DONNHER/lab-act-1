<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('academic_terms', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year'); // e.g., "2024-2025"
            $table->enum('semester', ['1st', '2nd', 'Summer']);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['PLANNED', 'OPEN', 'CLOSED'])->default('PLANNED');
            $table->timestamps();
            
            $table->unique(['academic_year', 'semester']);
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('academic_terms');
    }
};
