// components/ui/index.ts
// Barrel export for shared UI primitives. New code (Dashboard, Profiles,
// Doctor, Blackbox) should import from "@/components/ui" rather than
// reaching into individual files, so this file is the single place that
// defines what counts as a public primitive.
//
// The original flat-file paths (e.g. "@/components/Badge") still work too —
// see the shim files left at the old locations — so none of the existing
// pages (wizard, problems, calculator, presets) needed to change.

export { default as Badge } from "./Badge";
export { default as CodeBlock } from "./CodeBlock";
export { default as CopyButton } from "./CopyButton";
export { default as ToolCard } from "./ToolCard";
export { default as ValueDisplay } from "./ValueDisplay";
