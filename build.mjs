import esbuild from "esbuild";
import path from "path";
import { performance } from "perf_hooks";

const start = performance.now();

const log = (...args) =>
  console.log(`[${Math.round(performance.now() - start)}ms]`, ...args);

log("Building...");

function logResult(result) {
  log(
    `Done. ${result.errors?.length || 0} error(s), ${
      result.warnings?.length || 0
    } warning(s)`
  );

  if (result.errors) {
    for (const error of result.errors) {
      const { location, text } = error;

      console.log(
        `ERROR: ${text}`,
        ...(location
          ? [
              `(line ${location.line} col ${location.column})`,
              location.lineText,
            ]
          : [])
      );
    }
  }
}

try {
  logResult(
    await esbuild.build({
      outdir: "dist",
      logLevel: "silent",
      entryPoints: [path.join(process.cwd(), "/src/main.tsx")],
      write: true,
      format: "esm",
      bundle: true,
      splitting: true,
      metafile: true,
      define: {
        global: "window",
        "process.env.NODE_ENV": `"development"`,
        DEPRECATED_UNIT_TEST: true,
      },
      sourcemap: true,
      minify: false,
      loader: {
        ".jpg": "file",
        ".gif": "file",
        ".mp4": "file",
        ".graphql": "text",
        ".png": "file",
        ".svg": "file",
      },
      plugins: [
        //  await esbuildResolverPlugin(resolveMap),
        {
          name: "sass",
          setup: function (build) {
            build.onLoad(
              { filter: /.\.(sass|scss|css)$/, namespace: "file" },
              () => ({
                contents: "const classes = {}; export default classes;",
              })
            );
          },
        },
      ],
    })
  );
} catch (e) {
  logResult(e);
}
