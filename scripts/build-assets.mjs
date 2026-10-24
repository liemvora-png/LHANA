import { cp, mkdir, rm } from "node:fs/promises";

const output = new URL("../.worker-assets/", import.meta.url);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ["index.html", "script.js", "styles.css", "content.js", "admin.html", "admin.js", "admin.css"]) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(file, output));
}
await cp(new URL("../projects/", import.meta.url), new URL("projects/", output), {
  recursive: true
});
await cp(new URL("../admin.html", import.meta.url), new URL("admin.html", output));
