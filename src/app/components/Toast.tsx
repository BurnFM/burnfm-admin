"use client"

import React, { createContext, useContext, useState, ReactNode } from "react";
import * as Toast from "@radix-ui/react-toast";
import "./Toast.css";
import {Button, Flex} from "@radix-ui/themes";

type ToastContextType = {
  showToast: (title: string, message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastDuration, setToastDuration] = useState(3000);

  const showToast = (title: string, message: string, duration: number = 3000) => {
    setToastTitle(title);
    setToastMessage(message);
    setToastDuration(duration);
    setOpen(true);
  };

  return (
      <ToastContext.Provider value={{ showToast }}>
        {children}
        <Toast.Provider swipeDirection="right">
          <Flex justify='between' align="center" p="3" pr="5" asChild>
            <Toast.Root
                open={open}
                onOpenChange={setOpen}
                duration={toastDuration}
                id="ToastRoot"
            >
              <Flex direction="column">
                <Toast.Title id={"ToastTitle"}>{toastTitle}</Toast.Title>
                <Toast.Description id={"ToastDescription"}>{toastMessage}</Toast.Description>
              </Flex>
              <Button variant="ghost" asChild>
                <Toast.Close>
                  Close
                </Toast.Close>
              </Button>

            </Toast.Root>
          </Flex>
          <Toast.Viewport id="ToastViewport" />
        </Toast.Provider>
      </ToastContext.Provider>
  );
};