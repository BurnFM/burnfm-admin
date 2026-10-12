"use client";

import { Flex } from "@radix-ui/themes";
import  OverviewCalander from "./components/overviewCalander";
import { ToastProvider } from "@/app/components/Toast";
import { Container } from "@radix-ui/themes";

export default function OverviewPage() {
  return (
    <ToastProvider>
      <Container p="3"></Container> {/* used for padding as the main schedule page I removed the padding*/}

      <Flex height="100%" direction="column" flexGrow="1">
        <OverviewCalander />
      </Flex>
      
    </ToastProvider>
  );
}