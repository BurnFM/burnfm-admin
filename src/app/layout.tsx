import type { Metadata } from "next";
import "@radix-ui/themes/styles.css";
import {Box, Flex, Theme} from "@radix-ui/themes";
import {ThemeProvider} from "next-themes";
import Navbar from "@/app/components/Navbar";
import React from "react";
import { SessionProvider } from "next-auth/react";
import {ToastProvider} from "@/app/components/Toast";
import RootNavbar from "@/app/components/RootNavbar";
export const metadata: Metadata = {
  title: "Burn FM - Admin",
};

export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{margin: 0, height: "100%"}}>
      <SessionProvider>
        <ThemeProvider attribute="class">
          <Theme accentColor="purple" grayColor="auto" panelBackground="solid" scaling="105%">
            <ToastProvider>
              <Flex direction="column" minHeight="100vh" height="100%">
                <Box position="sticky" top="0" style={{ zIndex: 1000, background:"var(--color-background)", opacity:"0.9"}}>
                  <RootNavbar />
                </Box>
                {children}
              </Flex>
            </ToastProvider>
          </Theme>
        </ThemeProvider>
      </SessionProvider>
      </body>
    </html>
  );
}
