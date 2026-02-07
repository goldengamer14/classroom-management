import { Subject } from "@/types";

export const mockSubjects: Subject[] = [
  {
    id: 1,
    name: "Introduction to Computer Science",
    code: "CS101",
    description: "Fundamental concepts of computer science, programming basics and problem solving.",
    department: "cs",
    createdAt: "2024-08-15T09:00:00.000Z"
  },
  {
    id: 2,
    name: "Calculus I",
    code: "MATH101",
    description: "Limits, derivatives, and introductory integral calculus with applications.",
    department: "math",
    createdAt: "2024-08-16T09:00:00.000Z"
  },
  {
    id: 3,
    name: "Classical Mechanics",
    code: "PHYS201",
    description: "Newtonian mechanics, kinematics, dynamics, and conservation laws.",
    department: "physics",
    createdAt: "2024-08-17T09:00:00.000Z"
  },
  {
    id: 4,
    name: "Organic Chemistry",
    code: "CHEM202",
    description: "Structure, nomenclature, reactions, and mechanisms of organic molecules.",
    department: "chemistry",
    createdAt: "2024-08-18T09:00:00.000Z"
  }
];