import { access } from "node:fs/promises";

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!specifier.startsWith(".") || specifier.endsWith(".ts")) throw error;
    const candidate = new URL(`${specifier}.ts`, context.parentURL);
    await access(candidate);
    return { shortCircuit: true, url: candidate.href };
  }
}
