import {
  blank,
  error,
  line,
  multiline,
  type CommandDefinition,
} from "../hooks/useTerminal";
import { openPanel } from "./events";

const ABOUT_ART = `\
         .----:.            
      -+*%%#%%%%#+.         
   .+####%%%%%%%%%%*.       
  -%%%%#%%%@%%%######=      
 =%%%%%%###%%%%%%%%%%%-     
 %%%%%%%#***#%%%%%%%%%%.    
 %%%@%%#****#**%%%@@@%%-    
 %%%%%##****#*+*%%@@@@@-    
 =#%%#*##*****+*#%%@@@%:    
  -#**+*%###**+*#%%%%%#     
   +++=+***+==++*###*++.    
   .:---=====++++==-- .     
    .---:--=+-=+=-:-::      
     -=---==-::-===-:       
     .:-----===+===-        
      :----========:        
      .---===++++=::*+.     
    -====-====++=:..---.    
:=====++:===++=:..:---=####*
======+*-.:=-:...-----+%%%%%
======+**-+%%#-:------*%%%%%
=======*#+*@%+--------*@@%%%
=======+**#%#---------*@@%%@
==+=====+%%@%*-------=*@@%@@`;

// ─── Add / edit your commands here ───────────────────────────────────────────
export const commands: Record<string, CommandDefinition> = {
  about: {
    description: "who I am",
    handler: () => [
      line("about"),
      blank(),
      ...multiline(ABOUT_ART, "output", ""),
      blank(),
      line("─".repeat(32)),
      ...multiline(`
        hey, I'm XSE — full-stack developer
        based somewhere on the internet.

        I build fast, minimal web experiences.
        open to freelance & collab work.
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
