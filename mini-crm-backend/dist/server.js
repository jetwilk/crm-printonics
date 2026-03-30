"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const PORT = Number(process.env.PORT) || 3000;
async function main() {
    const app = await (0, app_1.buildApp)();
    await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
