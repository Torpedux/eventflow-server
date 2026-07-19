import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo1234", 10);

  const organisateur = await prisma.user.upsert({
    where: { email: "organisateur@eventflow.com" },
    update: {},
    create: { email: "organisateur@eventflow.com", password, name: "Julie Martin" },
  });

  const membre = await prisma.user.upsert({
    where: { email: "marc@eventflow.com" },
    update: {},
    create: { email: "marc@eventflow.com", password, name: "Marc Dupont" },
  });

  const existingProject = await prisma.project.findFirst({
    where: { title: "Mariage de Julie & Marc", ownerId: organisateur.id },
  });

  if (existingProject) {
    console.log("Le projet de démo existe déjà, rien à faire.");
    return;
  }

  const project = await prisma.project.create({
    data: {
      title: "Mariage de Julie & Marc",
      description: "Cérémonie et réception pour 120 invités",
      ownerId: organisateur.id,
      participants: { create: [{ userId: membre.id }] },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Réserver la salle",
        description: "Salle pour 120 personnes",
        status: "DONE",
        projectId: project.id,
        assignedUserId: organisateur.id,
      },
      {
        title: "Choisir le traiteur",
        description: "Menu 3 services",
        status: "IN_PROGRESS",
        projectId: project.id,
        assignedUserId: membre.id,
      },
      {
        title: "Envoyer les faire-part",
        description: "Envoi 6 mois avant",
        status: "TODO",
        projectId: project.id,
      },
    ],
  });

  console.log("Seed terminé.");
  console.log("Compte organisateur : organisateur@eventflow.com / demo1234");
  console.log("Compte participant  : marc@eventflow.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());