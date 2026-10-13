<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $itFirstNames = [
            'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
            'Cameron', 'Drew', 'Peyton', 'Reese', 'Rowan', 'Sage', 'Skyler', 'Dakota',
            'James', 'John', 'Michael', 'David', 'Christopher', 'Matthew', 'Andrew',
            'Joshua', 'Daniel', 'Ryan', 'Brandon', 'Tyler', 'Austin', 'Kevin', 'Brian',
            'Sarah', 'Emily', 'Jessica', 'Ashley', 'Amanda', 'Jennifer', 'Elizabeth',
            'Lauren', 'Stephanie', 'Nicole', 'Megan', 'Kayla', 'Hannah', 'Samantha',
            'Brittany', 'Amber', 'Danielle', 'Christina', 'Michelle', 'Tiffany', 'Courtney'
        ];

        $itLastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
            'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
            'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
            'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
            'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
            'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
            'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz',
            'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales',
            'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson',
            'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward',
            'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray',
            'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel',
            'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry',
            'Russell', 'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales',
            'Fisher', 'Vasquez', 'Simmons', 'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton',
            'Graham', 'Reynolds', 'Griffin', 'Wallace', 'Moreno', 'West', 'Cole', 'Hayes',
            'Bryant', 'Herrera', 'Gibson', 'Ellis', 'Stevens', 'Murray', 'Ford', 'Marshall',
            'Owens', 'Mcdonald', 'Harrison', 'Ruiz', 'Kennedy', 'Wells', 'Alvarez', 'Woods',
            'Mendoza', 'Castillo', 'Olson', 'Webb', 'Washington', 'Tucker', 'Freeman', 'Burns',
            'Henry', 'Vasquez', 'Snyder', 'Simpson', 'Crawford', 'Jimenez', 'Porter', 'Mason',
            'Shaw', 'Gordon', 'Wagner', 'Hunter', 'Romero', 'Hicks', 'Dixon', 'Hunt',
            'Palmer', 'Robertson', 'Black', 'Holmes', 'Stone', 'Meyer', 'Boyd', 'Mills',
            'Warren', 'Fox', 'Rose', 'Rice', 'Moreno', 'Schmidt', 'Patel', 'Ferguson',
            'Nichols', 'Herrera', 'Medina', 'Ryan', 'Fernandez', 'Weaver', 'Daniels', 'Stephens',
            'Gardner', 'Payne', 'Kelley', 'Dunn', 'Pierce', 'Arnold', 'Tran', 'Spencer',
            'Peters', 'Hawkins', 'Grant', 'Hansen', 'Castro', 'Hoffman', 'Hart', 'Elliott',
            'Cunningham', 'Knight', 'Bradley', 'Carroll', 'Hudson', 'Duncan', 'Armstrong', 'Berry',
            'Andrews', 'Johnston', 'Ray', 'Lane', 'Riley', 'Carpenter', 'Perkins', 'Aguilar',
            'Silva', 'Richards', 'Willis', 'Matthews', 'Chapman', 'Lawrence', 'Garza', 'Vargas',
            'Watkins', 'Wheeler', 'Larson', 'Carlson', 'Harper', 'George', 'Greene', 'Burke',
            'Guzman', 'Morrison', 'Munoz', 'Jacobs', 'Obrien', 'Lawson', 'Franklin', 'Lynch',
            'Bishop', 'Carr', 'Salazar', 'Austin', 'Mendez', 'Gilbert', 'Jensen', 'Williamson',
            'Montgomery', 'Harvey', 'Oliver', 'Howell', 'Dean', 'Hanson', 'Weber', 'Garrett',
            'Sims', 'Burton', 'Fuller', 'Soto', 'Mccoy', 'Welch', 'Chen', 'Schultz',
            'Walters', 'Reid', 'Fields', 'Walsh', 'Little', 'Fowler', 'Bowman', 'Davidson',
            'May', 'Day', 'Schneider', 'Newman', 'Brewer', 'Lucas', 'Holland', 'Wong',
            'Banks', 'Santos', 'Curtis', 'Pearson', 'Delgado', 'Valdez', 'Pena', 'Rios',
            'Douglas', 'Sandoval', 'Barrett', 'Hopkins', 'Keller', 'Guerrero', 'Stanley', 'Bates',
            'Alvarado', 'Beck', 'Ortega', 'Wade', 'Estrada', 'Contreras', 'Barnett', 'Caldwell',
            'Santiago', 'Lambert', 'Powers', 'Chambers', 'Nunez', 'Craig', 'Leonard', 'Lowe',
            'Rhodes', 'Byrd', 'Gregory', 'Shelton', 'Frazier', 'Becker', 'Maldonado', 'Fleming',
            'Vega', 'Sutton', 'Cohen', 'Jennings', 'Parks', 'Mccormick', 'Morton', 'Abbott',
            'Sparks', 'Patrick', 'Norton', 'Huff', 'Clayton', 'Massey', 'Lloyd', 'Figueroa',
            'Carson', 'Bowers', 'Roberson', 'Barton', 'Tran', 'Lamb', 'Harrington', 'Casey',
            'Boone', 'Cortez', 'Clarke', 'Mathis', 'Singleton', 'Wilkins', 'Cain', 'Bryan',
            'Underwood', 'Hogan', 'Mckenzie', 'Collins', 'Larsen', 'Lawrence', 'Walsh', 'Sanchez',
            'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey',
            'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson',
            'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price',
            'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry',
            'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons',
            'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes',
            'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Powell', 'Jenkins', 'Perry',
            'Russell', 'Sullivan', 'Bell', 'Coleman', 'Butler', 'Henderson', 'Barnes', 'Gonzales',
            'Fisher', 'Vasquez', 'Simmons', 'Romero', 'Jordan', 'Patterson', 'Alexander', 'Hamilton',
            'Graham', 'Reynolds', 'Griffin', 'Wallace', 'Moreno', 'West', 'Cole', 'Hayes',
            'Bryant', 'Herrera', 'Gibson', 'Ellis', 'Stevens', 'Murray', 'Ford', 'Marshall',
            'Owens', 'Mcdonald', 'Harrison', 'Ruiz', 'Kennedy', 'Wells', 'Alvarez', 'Woods',
            'Mendoza', 'Castillo', 'Olson', 'Webb', 'Washington', 'Tucker', 'Freeman', 'Burns',
            'Henry', 'Vasquez', 'Snyder', 'Simpson', 'Crawford', 'Jimenez', 'Porter', 'Mason',
            'Shaw', 'Gordon', 'Wagner', 'Hunter', 'Romero', 'Hicks', 'Dixon', 'Hunt',
            'Palmer', 'Robertson', 'Black', 'Holmes', 'Stone', 'Meyer', 'Boyd', 'Mills',
            'Warren', 'Fox', 'Rose', 'Rice', 'Moreno', 'Schmidt', 'Patel', 'Ferguson',
            'Nichols', 'Herrera', 'Medina', 'Ryan', 'Fernandez', 'Weaver', 'Daniels', 'Stephens',
            'Gardner', 'Payne', 'Kelley', 'Dunn', 'Pierce', 'Arnold', 'Tran', 'Spencer',
            'Peters', 'Hawkins', 'Grant', 'Hansen', 'Castro', 'Hoffman', 'Hart', 'Elliott',
            'Cunningham', 'Knight', 'Bradley', 'Carroll', 'Hudson', 'Duncan', 'Armstrong', 'Berry',
            'Andrews', 'Johnston', 'Ray', 'Lane', 'Riley', 'Carpenter', 'Perkins', 'Aguilar',
            'Silva', 'Richards', 'Willis', 'Matthews', 'Chapman', 'Lawrence', 'Garza', 'Vargas',
            'Watkins', 'Wheeler', 'Larson', 'Carlson', 'Harper', 'George', 'Greene', 'Burke',
            'Guzman', 'Morrison', 'Munoz', 'Jacobs', 'Obrien', 'Lawson', 'Franklin', 'Lynch',
            'Bishop', 'Carr', 'Salazar', 'Austin', 'Mendez', 'Gilbert', 'Jensen', 'Williamson',
            'Montgomery', 'Harvey', 'Oliver', 'Howell', 'Dean', 'Hanson', 'Weber', 'Garrett',
            'Sims', 'Burton', 'Fuller', 'Soto', 'Mccoy', 'Welch', 'Chen', 'Schultz',
            'Walters', 'Reid', 'Fields', 'Walsh', 'Little', 'Fowler', 'Bowman', 'Davidson',
            'May', 'Day', 'Schneider', 'Newman', 'Brewer', 'Lucas', 'Holland', 'Wong',
            'Banks', 'Santos', 'Curtis', 'Pearson', 'Delgado', 'Valdez', 'Pena', 'Rios',
            'Douglas', 'Sandoval', 'Barrett', 'Hopkins', 'Keller', 'Guerrero', 'Stanley', 'Bates',
            'Alvarado', 'Beck', 'Ortega', 'Wade', 'Estrada', 'Contreras', 'Barnett', 'Caldwell',
            'Santiago', 'Lambert', 'Powers', 'Chambers', 'Nunez', 'Craig', 'Leonard', 'Lowe',
            'Rhodes', 'Byrd', 'Gregory', 'Shelton', 'Frazier', 'Becker', 'Maldonado', 'Fleming',
            'Vega', 'Sutton', 'Cohen', 'Jennings', 'Parks', 'Mccormick', 'Morton', 'Abbott',
            'Sparks', 'Patrick', 'Norton', 'Huff', 'Clayton', 'Massey', 'Lloyd', 'Figueroa',
            'Carson', 'Bowers', 'Roberson', 'Barton', 'Tran', 'Lamb', 'Harrington', 'Casey',
            'Boone', 'Cortez', 'Clarke', 'Mathis', 'Singleton', 'Wilkins', 'Cain', 'Bryan',
            'Underwood', 'Hogan', 'Mckenzie', 'Collins', 'Larsen', 'Lawrence', 'Walsh', 'Sanchez',
            'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey',
            'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson',
            'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price',
            'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry',
            'Powell', 'Long', 'Patterson', 'Hughes', 'Flores', 'Washington', 'Butler', 'Simmons',
            'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz', 'Hayes'
        ];

        $firstName = fake()->randomElement($itFirstNames);
        $lastName = fake()->randomElement($itLastNames);

        return [
            'name' => $firstName . ' ' . $lastName,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'STUDENT',
            'status' => 'ACTIVE',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'ADMIN',
            'status' => 'ACTIVE',
        ]);
    }

    /**
     * Create a registrar user.
     */
    public function registrar(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'REGISTRAR',
            'status' => 'ACTIVE',
        ]);
    }

    /**
     * Create an instructor user.
     */
    public function instructor(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'INSTRUCTOR',
            'status' => 'ACTIVE',
        ]);
    }

    /**
     * Create a student user.
     */
    public function student(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'STUDENT',
            'status' => 'ACTIVE',
        ]);
    }

    /**
     * Create an inactive user.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'INACTIVE',
        ]);
    }
}
