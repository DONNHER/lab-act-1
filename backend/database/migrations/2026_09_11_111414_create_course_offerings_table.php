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
        Schema::create('course_offerings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->restrictOnDelete();
            $table->foreignId('academic_term_id')->constrained('academic_terms')->restrictOnDelete();
            $table->foreignId('instructor_id')->constrained('users')->restrictOnDelete();
            $table->string('section');
            $table->string('schedule')->nullable();
            $table->string('room')->nullable();
            $table->unsignedInteger('capacity');
            $table->enum('status', ['OPEN', 'CLOSED', 'CANCELLED'])->default('OPEN');
            $table->timestamps();

            $table->unique(['course_id', 'academic_term_id', 'section']);
            $table->index('academic_term_id');
            $table->index('instructor_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_offerings');
    }
};
