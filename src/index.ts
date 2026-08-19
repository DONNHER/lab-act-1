import type { ApiResponse } from "./api";
import { isStudent } from "./api";

export interface Student {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
}

type StudentStatus = "active" | "inactive";

function getStudentStatusLabel(status: StudentStatus): string {
  return status === "active"
    ? "Active Student"
    : "Inactive Student";
}

function formatStudent(student: Student): string {
  return `${student.id}-${student.name} (${getStudentStatusLabel(
    student.status,
  )})`;
}

const sampleStudent: Student = {
  id: 1,
  name: "Alice Johnson",
  email: "alice@example.com",
  status: "active",
};

const sampleStudentList: Student[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "active",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    status: "inactive",
  },
];

const sample: unknown = {
  id: 1,
  name: "Alice Johnson",
  email: "alice@example.com",
  status: "active",
};

const sample2: unknown = {
  id: "1",
  name: "Alice Johnson",
  email: "alice@example.com",
  status: "active",
};

const sample3: unknown = {
  id: 1,
  email: "alice@example.com",
  status: "active",
};

const studentResponse: ApiResponse<Student> = {
  success: true,
  data: sampleStudent,
};

const studentListResponse: ApiResponse<Student[]> = {
  success: true,
  data: sampleStudentList,
};

console.log("--- Part 5 Output ---");
console.log(formatStudent(sampleStudent));

console.log("\n--- Part 6 Output ---");
console.log(formatStudent(studentResponse.data));

console.log("\n--- Part 6 OUTPUT LIST ---");

for (const student of studentListResponse.data) {
  console.log(formatStudent(student));
}

console.log("\n--- Part 7 Output ---");

if (isStudent(sample)) {
  console.log(formatStudent(sample));
} else {
  console.error(
    "Error: The provided data is not a valid Student object.",
  );
}

if (isStudent(sample2)) {
  console.log(formatStudent(sample2));
} else {
  console.error(
    "Error: The provided data is not a valid Student object.",
  );
}

if (isStudent(sample3)) {
  console.log(formatStudent(sample3));
} else {
  console.error(
    "Error: The provided data is not a valid Student object.",
  );
}

function selectStudentById(
  id: number,
  students: Student[],
): void {
  const foundStudent = students.find(
    (student) => student.id === id,
  );

  if (!foundStudent) {
    console.error(
      `Student with ID ${id} was not found.`,
    );

    return;
  }

  console.log("\nSelected Student Details:");
  console.log(`ID     : ${foundStudent.id}`);
  console.log(`Name   : ${foundStudent.name}`);
  console.log(`Email  : ${foundStudent.email}`);
  console.log(
    `Status : ${getStudentStatusLabel(
      foundStudent.status,
    )}`,
  );
}

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

console.log(
  "\n--- Interactive Student Selection ---",
);

studentListResponse.data.forEach((student) => {
  console.log(formatStudent(student));
});

const rl = readline.createInterface({ input, output });

while (true) {
  const answer = await rl.question(
    "\nEnter a student ID (or 'exit' to quit): ",
  );

  // Check for exit commands
  if (!answer || answer.toLowerCase().trim() === "exit" || answer.toLowerCase().trim() === "quit") {
    console.log("Exiting...");
    break;
  }

  const id = Number(answer);

  if (Number.isNaN(id)) {
    console.error("Please enter a valid number.");
  } else {
    selectStudentById(id, studentListResponse.data);
  }
}

rl.close();