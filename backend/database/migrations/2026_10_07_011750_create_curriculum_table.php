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
        Schema::create('curriculum', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained('programs')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->unsignedInteger('year_level');
            $table->unsignedInteger('semester'); // 1 = First Semester, 2 = Second Semester, 3 = Summer
            $table->enum('category', ['core', 'major', 'elective', 'ge', 'pe', 'nstp']);
            $table->json('prerequisites')->nullable(); // Array of course IDs
            $table->unsignedInteger('units')->default(3);
            $table->timestamps();

            // Unique constraint to prevent duplicate curriculum entries
            $table->unique(['program_id', 'course_id', 'year_level', 'semester']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curriculum');
    }
};
