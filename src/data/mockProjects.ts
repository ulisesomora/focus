import type { Project } from "../types/project";

export const mockProjects: Project[] = [
  {
    id: "project-work",
    name: "Trabajo",
    icon: "💻",
    description: "Desarrollo, clientes y entregables profesionales.",
    status: "active",
    createdAt: new Date(),
  },
  {
    id: "project-jardin",
    name: "Jardín Allende",
    icon: "🌿",
    description: "Operación, mejoras, compras e inventarios.",
    status: "active",
    createdAt: new Date(),
  },
  {
    id: "project-personal",
    name: "Personal",
    icon: "👤",
    description: "Pendientes y objetivos personales.",
    status: "active",
    createdAt: new Date(),
  },
];
