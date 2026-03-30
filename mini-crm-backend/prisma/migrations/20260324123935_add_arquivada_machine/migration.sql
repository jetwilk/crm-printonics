-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Machine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fabricante" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "ano" INTEGER,
    "formato" TEXT,
    "cores" INTEGER,
    "pais" TEXT,
    "precoPedido" DECIMAL,
    "moeda" TEXT NOT NULL DEFAULT 'EUR',
    "fonte" TEXT,
    "urlAnuncio" TEXT,
    "notasTecnicas" TEXT,
    "arquivada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Machine" ("ano", "cores", "createdAt", "fabricante", "fonte", "formato", "id", "modelo", "moeda", "notasTecnicas", "pais", "precoPedido", "updatedAt", "urlAnuncio") SELECT "ano", "cores", "createdAt", "fabricante", "fonte", "formato", "id", "modelo", "moeda", "notasTecnicas", "pais", "precoPedido", "updatedAt", "urlAnuncio" FROM "Machine";
DROP TABLE "Machine";
ALTER TABLE "new_Machine" RENAME TO "Machine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
