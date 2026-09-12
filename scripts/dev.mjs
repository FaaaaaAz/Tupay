import { spawn } from "node:child_process";

const procesos = ["dev:server", "dev:client"].map((script) =>
  spawn("npm", ["run", script], { stdio: "inherit", shell: true }),
);

function detenerTodo() {
  for (const proceso of procesos) {
    if (proceso.exitCode === null) proceso.kill();
  }
}

process.on("SIGINT", detenerTodo);
process.on("SIGTERM", detenerTodo);
for (const proceso of procesos) proceso.on("exit", detenerTodo);
