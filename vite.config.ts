import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "fs";
import { relative, resolve } from "path";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";
import { libInjectCss } from "vite-plugin-lib-inject-css";

export default defineConfig((config) =>
{
	const buildMode = config.mode.trim().toLowerCase();
	const entryFiles =
	{
		// Components
		Theme: resolve(import.meta.dirname, "lib/components/Theme/index"),
		Button: resolve(import.meta.dirname, "lib/components/Button/default/index"),
		ButtonIcon: resolve(import.meta.dirname, "lib/components/Button/icon/index"),
		ButtonGroup: resolve(import.meta.dirname, "lib/components/Button/group/index"),
		SplitButton: resolve(import.meta.dirname, "lib/components/Button/split/index"),
		Chip: resolve(import.meta.dirname, "lib/components/Chip/index"),
		ContextMenu: resolve(import.meta.dirname, "lib/components/ContextMenu/index"),
		Dialog: resolve(import.meta.dirname, "lib/components/Dialog/index"),
		Divider: resolve(import.meta.dirname, "lib/components/Divider/index"),
		Icon: resolve(import.meta.dirname, "lib/components/Icon/index"),
		Menu: resolve(import.meta.dirname, "lib/components/Menu/index"),
		Menubar: resolve(import.meta.dirname, "lib/components/Menubar/index"),
		NumberField: resolve(import.meta.dirname, "lib/components/NumberField/index"),
		// ProgressIndicator: resolve(import.meta.dirname, "lib/components/ProgressIndicator/index"),
		Select: resolve(import.meta.dirname, "lib/components/Select/index"),
		Slider: resolve(import.meta.dirname, "lib/components/Slider/index"),
		TextField: resolve(import.meta.dirname, "lib/components/TextField/index"),
		Toolbar: resolve(import.meta.dirname, "lib/components/Toolbar/index"),
		Tooltip: resolve(import.meta.dirname, "lib/components/Tooltip/index"),

		// Layout
		Page: resolve(import.meta.dirname, "lib/layouts/Page/index"),
		Panes: resolve(import.meta.dirname, "lib/layouts/Panes/index"),
		Tabs: resolve(import.meta.dirname, "lib/layouts/Tabs/index"),
		Toolbox: resolve(import.meta.dirname, "lib/layouts/Toolbox/index"),
		Content: resolve(import.meta.dirname, "lib/layouts/Content"),
	}
	const packageExports: Record<string, {types: string, import: string, require: string}> = {};
	const autoEntries = Object.entries(entryFiles).reduce<Record<string, string>>((acc, [name, filePath]) =>
	{
		const relativePath = relative(resolve(import.meta.dirname, "lib"), filePath);
		const entryKey = relativePath.replace(/\.[^/.]+$/, "");

		acc[entryKey] = filePath;
		packageExports[`./${name}`] =
		{
			types: `./dist/${entryKey}.d.ts`,
			import: `./dist/${entryKey}.js`,
			require: `./dist/${entryKey}.cjs`,
		}
		return (acc);
	}, {});
	const packageJsonPath = resolve(import.meta.dirname, "package.json");
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

	if (buildMode === "lib")
	{
		packageJson.exports ??= {};
		packageJson.exports = {...packageJson.exports, ...packageExports};
		writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "\t"), "utf-8");
		console.log(`[preserveModules] "exports" block updated (${Object.keys(packageExports).length} entries found).`);
	}

	return ({
		server:
		{
			host: true,
			port: 5000
		},
		resolve:
		{
			tsconfigPaths: true
		},
		publicDir: "public",
		plugins:
		[
			react({}),
			babel({ presets: [reactCompilerPreset({})] }),
			dts({exclude: ["./src/**"], entryRoot: "./lib"}),
			libInjectCss(),
		],
		build:
		{
			lib: buildMode !== "lib" ? false :
			{
				entry: autoEntries,
				name: "react-material-design"
			},
			target: "chrome114",
			chunkSizeWarningLimit: 1500,
			rolldownOptions:
			{
				external:
				[
					/^material-symbols(\/.*)?$/,
					/^@fontsource\/roboto(\/.*)?$/,
					/^@fontsource\/roboto-flex(\/.*)?$/,
					/^@fontsource\/roboto-mono(\/.*)?$/,
					"react",
					"react-dom",
					"react/jsx-runtime",
					"react/compiler-runtime",
					"@material/material-color-utilities",
					"bezier-easing",
					"classnames",
					"react-dom-event-hooks"
				],
				output:
				{
					preserveModules: true,
					preserveModulesRoot: "lib",
					exports: "named",
					globals:
					{
						"@fontsource/roboto/index.css": "@fontsource/roboto/index.css",
						"@fontsource/roboto-flex/index.css": "@fontsource/roboto-flex/index.css",
						"@fontsource/roboto-mono/index.css": "@fontsource/roboto-mono/index.css",
						react: "react",
						"react/jsx-runtime": "react/jsx-runtime",
						"bezier-easing": "bezier-easing",
						classnames: "classnames",
						"@material/material-color-utilities": "@material/material-color-utilities"
					}
				}
			}
		}
	});
});
