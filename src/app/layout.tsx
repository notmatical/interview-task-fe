import "@/styles/globals.css";

import type { Metadata } from "next";
import { Toaster } from "react-hot-toast"
import { geistMono, geistSans } from "@/fonts";
import SuiProvider from "@/providers/sui-provider";
import Header from "@/components/layout/header";

export const metadata: Metadata = {
	title: "Aftermath FE Technical Test",
	description: "by matical",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<SuiProvider>
					<Header />
					{children}

					<Toaster
						position="bottom-right"
						reverseOrder={true}
						toastOptions={{
							style: {
								backgroundColor: "var(--background)",
								color: "var(--foreground)",
								padding: "12px 12px",
								border: "1px solid var(--border)"
							},
						}}
					/>
				</SuiProvider>
			</body>
		</html>
	);
}