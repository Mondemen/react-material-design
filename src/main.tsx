import Theme from "@components/Theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Theme primaryColor="#8C476B">
			<App />
		</Theme>
	</StrictMode>
);
