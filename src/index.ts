import type { ApiResponse } from "./api.ts";
import { isStudent } from "./api.ts";

export interface Student {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
}

function formatStudent(student: Student): string {
  return `${student.id}-${student.name}(${student.status})`;
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

console.log("--- Part 6 Output ---");
console.log(formatStudent(studentResponse.data));

console.log("--- Part 6 OUTPUT LIST---");

for (const student of studentListResponse.data) {
  console.log(formatStudent(student));
}

console.log("--- Part 7 Output ---");
if (isStudent(sample)) {
  const studResponse: ApiResponse<Student> = {
    success: true,
    data: sample,
  };
  console.log(formatStudent(studResponse.data));
} else {
  console.error("Error: The provided data is not a valid Student object.");
}

if (isStudent(sample2)) {
  const studResponse: ApiResponse<Student> = {
    success: true,
    data: sample2,
  };
  console.log(formatStudent(studResponse.data));
} else {
  console.error("Error: The provided data is not a valid Student object.");
}

if (isStudent(sample3)) {
  const studResponse: ApiResponse<Student> = {
    success: true,
    data: sample3,
  };
  console.log(formatStudent(studResponse.data));
} else {
  console.error("Error: The provided data is not a valid Student object.");
}
