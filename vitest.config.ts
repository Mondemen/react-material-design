import babel from "@rolldown/plugin-babel";
import react, {reactCompilerPreset} from "@vitejs/plugin-react";
import {defineConfig} from "vitest/config";

export default defineConfig({
	plugins: [
		react(),
		babel({presets: [reactCompilerPreset({})]})
	],
	resolve: {
		tsconfigPaths: true
	},
	test: {
		environment: "jsdom",
		server: {
			deps: {
				inline: ["@material/material-color-utilities"]
			}
		}
	}
});
