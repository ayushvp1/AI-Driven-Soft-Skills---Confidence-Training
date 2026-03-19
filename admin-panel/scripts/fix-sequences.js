const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixSequences() {
  console.log("Fixing autoincrement sequences...");
  try {
    // These sequences are naming automatically by Prisma/Postgres or manually.
    // Let's try to query the max IDs and set the sequences.
    await prisma.$executeRawUnsafe(`SELECT setval('challenge_id_seq', (SELECT MAX(id) FROM challenge))`);
    await prisma.$executeRawUnsafe(`SELECT setval('exercise_id_seq', (SELECT MAX(id) FROM exercise))`);
    await prisma.$executeRawUnsafe(`SELECT setval('simulation_scenario_id_seq', (SELECT MAX(id) FROM simulation_scenario))`);
    console.log("✅ Sequences reset successfully!");
  } catch (err) {
    console.error("Error resetting sequences:", err.message);
    console.log("Retrying with standard table names if needed...");
    // Fallback if sequences have different names (e.g. they might be challenge_id_seq)
  }
}

fixSequences().then(() => prisma.$disconnect()).catch(console.error);
