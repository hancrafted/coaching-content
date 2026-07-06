/// <reference path="../rules.d.ts" />

export default {
  rules: {
    "tailwind-and-daisyui-imported": {
      description: "src/style.css must import tailwindcss and the daisyui plugin (FE-001)",
      severity: "error",
      async check(ctx) {
        const styleFiles = await ctx.glob("src/style.css");
        if (styleFiles.length === 0) return;

        const content = await ctx.readFile("src/style.css");

        // Accept both the bare import and the daisyUI v5 config-block form
        // (e.g. `@plugin "daisyui" { themes: corporate --default, ...; }`).
        const hasTailwind = /@import\s+["']tailwindcss["']\s*;/.test(content);
        const hasDaisyUi = /@plugin\s+["']daisyui["']\s*[;{]/.test(content);

        if (!hasTailwind) {
          ctx.report.violation({
            message:
              'src/style.css is missing Tailwind CSS v4 import (@import "tailwindcss";). (See ADR FE-001)',
            file: "src/style.css",
            fix: "Add '@import \"tailwindcss\";' at the top of src/style.css.",
          });
        }

        if (!hasDaisyUi) {
          ctx.report.violation({
            message:
              'src/style.css is missing the daisyUI plugin import (@plugin "daisyui";). (See ADR FE-001)',
            file: "src/style.css",
            fix: "Add '@plugin \"daisyui\";' below the Tailwind import in src/style.css.",
          });
        }
      },
    },

    "no-style-tags-in-html": {
      description: "HTML files must not contain inline <style> tags (FE-001)",
      severity: "error",
      async check(ctx) {
        const htmlFiles = await ctx.glob("**/index.html");
        // filter out node_modules and dist just in case, though ctx.glob should handle it or we filter manually
        const filteredFiles = htmlFiles.filter(
          (f) => !f.includes("node_modules/") && !f.includes("dist/"),
        );

        for (const file of filteredFiles) {
          const content = await ctx.readFile(file);
          if (content.includes("<style>") || content.includes("<style ")) {
            ctx.report.violation({
              message: `${file} contains a <style> block. All styles should be handled via Tailwind utility classes or daisyUI components to maintain a clean layout and design system. (See ADR FE-001)`,
              file,
              fix: "Remove the <style> block and replace its rules with equivalent Tailwind CSS or daisyUI classes.",
            });
          }
        }
      },
    },

    "no-raw-inline-styles": {
      description: "HTML files should avoid raw style attributes (FE-001)",
      severity: "warning",
      async check(ctx) {
        const htmlFiles = await ctx.glob("**/index.html");
        const filteredFiles = htmlFiles.filter(
          (f) => !f.includes("node_modules/") && !f.includes("dist/"),
        );

        // Match tags with style attributes, excluding SVGs which often use style/transform parameters
        const inlineStyleRegex = /<([a-zA-Z0-9-]+)(?![^>]*\bsvg\b)[^>]*\sstyle=["']/i;

        for (const file of filteredFiles) {
          const content = await ctx.readFile(file);
          const lines = content.split("\n");

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Skip SVG tags or lines that look like comments
            if (
              line.includes("<svg") ||
              line.includes("</svg>") ||
              line.trim().startsWith("<!--")
            ) {
              continue;
            }

            if (inlineStyleRegex.test(line)) {
              ctx.report.warning({
                message: `Avoid inline style attributes in ${file}. Use Tailwind CSS utility classes instead. (See ADR FE-001)`,
                file,
                line: i + 1,
                fix: "Convert the inline style rules into standard Tailwind utility classes.",
              });
            }
          }
        }
      },
    },
  },
} satisfies RuleSet;
