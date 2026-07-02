import {
  blank,
  error,
  line,
  multiline,
  type CommandDefinition,
} from "../hooks/useTerminal";
import { openPanel } from "./events";

// ─── Add / edit your commands here ───────────────────────────────────────────
export const commands: Record<string, CommandDefinition> = {
  about: {
    description: "| WHO IS THIS DEV??",
    handler: () => [
      line("about"),
      blank(),
      line("─".repeat(32)),

      ...multiline(`
        Hello! I am Kyrelle Loyola
        You can call me Ky(Kai) or Xse
        A Computer Science graduate who runs on energy drinks and big dreams
      `),
      blank(),

      ...multiline(`
        What have I done?
        My developer experience has been mostly around two fields
        Flutter Development And Computer Vision Based Projects
        Check out 'projects' for further info
      `),
      blank(),

      ...multiline(`
        What do I like?
        White Monster Energy Drink
        Black Cats
        The color purple
        Deadlock
      `),
      blank(),

      ...multiline(`
        What is this "BIG DREAM"?
        To work as a Robotics Software Engineer!
        I would love to make a smart vacuum cleaner
        that utilizes computer vision and AI
        to fetch me a can of my favorite beverage
        Yep, thats me. Contact me via 'contact' command if you wanna get to know me better!
      `),
      blank(),
    ],
  },
  "?": {
    description: "show help",
    handler: () => {
      const all = { ...commands };
      return [
        line("available commands"),
        line("─".repeat(32)),
        ...Object.entries(all).map(([name, def]) =>
          line(`  ${name.padEnd(14)} ${def.description}`),
        ),
        blank(),
      ];
    },
  },
  skills: {
    description: "tech stack & tools",
    handler: () => [
      line("skills"),
      line("─".repeat(32)),
      line("  frontend   →  React, Next.js, TypeScript"),
      line("  backend    →  Node.js, Python, Go"),
      line("  database   →  PostgreSQL, Redis, Supabase"),
      line("  devops     →  Docker, Vercel, CI/CD"),
      blank(),
    ],
  },
  projects: {
    description: "things I've built",
    handler: () => [
      line("projects"),
      line("─".repeat(32)),
      line("  01  ProjectAlpha    → saas dashboard"),
      line("  02  OpenLib         → open source lib"),
      line("  03  NightOwl        → productivity app"),
      blank(),
      line('  type "open <name>" to visit'),
      blank(),
    ],
  },
  contact: {
    description: "get in touch",
    handler: () => [
      line("contact"),
      line("─".repeat(32)),
      line("  email   →  hey@xsedev.xyz"),
      line("  github  →  github.com/xsedev"),
      line("  twitter →  @xsedev"),
      blank(),
    ],
  },
  open: {
    description: "open a project  (usage: open <name>)",
    handler: (args) => {
      const targets: Record<string, string> = {
        projectalpha: "https://xsedev.xyz/projectalpha",
        openlib: "https://github.com/xsedev/openlib",
        nightowl: "https://xsedev.xyz/nightowl",
      };
      const name = args[0]?.toLowerCase();
      if (!name) return [error("usage: open <project-name>"), blank()];
      const url = targets[name];
      if (!url) return [error(`open: unknown project: ${name}`), blank()];
      window.open(url, "_blank", "noopener,noreferrer");
      return [line(`opening ${name}...`), blank()];
    },
  },
  resume: {
    description: "view my resume",
    handler: () => {
      openPanel("resume");
      return [line("opening resume..."), blank()];
    },
  },
};
