import {
  blank,
  error,
  line,
  multiline,
  type CommandDefinition,
} from "../hooks/useTerminal";
import { openPanel } from "./events";

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
        My experience spans Flutter mobile development and Computer Vision projects
        I also did a 300-hr internship as a Full-Stack Developer at PopCulture Community
        Check out 'projects' or 'experience' for more info
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

  experience: {
    description: "| Where I've worked",
    handler: () => [
      line("experience"),
      blank(),
      line("─".repeat(32)),
      ...multiline(`
        PopCulture Community — Full-Stack Developer Intern
        February 2026 – May 2026  |  300-Hr OJT  |  Eastwood, Quezon City
      `),
      blank(),
      ...multiline(`
        - Built backend systems for a multi-platform renter management and e-commerce app
        - Designed Supabase RPCs, Edge Functions, and transactional workflows
        - Built ledger-based finance and inventory tracking with delta-driven updates
        - Integrated Google Cloud, Firebase, Cloud Run, and automated email reporting
        - Coordinated with clients to translate business requirements into technical solutions
      `),
      blank(),
      ...multiline(`
        CREOTECH — IT Team Leader  (80-Hr Work Immersion, 2022)
        - Led a 38-member IT department for app development projects
        - Built an employee attendance tracker and payroll calculator via MIT App Inventor
        - Managed team compliance, memorandums, and task reporting
      `),
      blank(),
    ],
  },

  skills: {
    description: "| My Tech Stack",
    handler: () => [
      line("skills"),
      blank(),
      line("─".repeat(32)),
      ...multiline(`
        Languages
        - Python, Java, C#, Dart
      `),
      blank(),
      ...multiline(`
        Mobile Development
        - Flutter, Android Studio
      `),
      blank(),
      ...multiline(`
        Web Development
        - React, Next.js, TypeScript
      `),
      blank(),
      ...multiline(`
        Database & Backend
        - PostgreSQL, Supabase, Firebase, FastAPI
      `),
      blank(),
      ...multiline(`
        Computer Vision & AI
        - OpenCV, YOLOv8, Roboflow, CVAT
        - AI Model Training & Deployment
      `),
      blank(),
      ...multiline(`
        Tools & Platforms
        - Git & GitHub, Linux/Terminal
        - Raspberry Pi & IoT Systems
        - Android Studio
      `),
      blank(),
    ],
  },

  projects: {
    description: "| Things I've built",
    handler: () => [
      line("projects"),
      blank(),
      line("─".repeat(32)),
      ...multiline(`
        01  A.EYE — AI-Powered Assistive IoT System  (Thesis)
            Raspberry Pi-based assistive device using YOLOv8s to detect
            and teach braille letters in real time via a chest-mounted camera
            95% detection accuracy | 5,000-image labeled dataset
      `),
      blank(),
      line("  more projects coming soon — check back later!"),
      blank(),
    ],
  },

  contact: {
    description: "| Get in touch",
    handler: () => [
      line("contact"),
      blank(),
      line("─".repeat(32)),
      ...multiline(`
        email   →  kyrellemikah@gmail.com
        phone   →  09292330930
        github  →  github.com/exee04
        linkedin → linkedin.com/in/kyloyola/
      `),
      blank(),
    ],
  },

  help: {
    description: "| Show available commands",
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

  open: {
    description: "| Open a project  (usage: open <name>)",
    handler: (args) => {
      const targets: Record<string, string> = {
        aeye: "https://github.com/exee04",
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
    description: "| View my resume",
    handler: () => {
      openPanel("resume");
      return [line("opening resume..."), blank()];
    },
  },
};
