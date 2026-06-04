"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Card, Container, Flex, Heading, Text } from "@radix-ui/themes";
import Link from "next/link";
import {
  ActivityLogIcon,
  DashboardIcon,
} from "@radix-ui/react-icons";
import "./home.css";
import { useAuth } from "@/auth/AuthContext";

export default function Home() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.user === null || auth.user === undefined) {
      router.replace("/login");
    } else {
      router.replace("/shows");
    }
  }, [auth.user, router]);

  // Prevent flicker while redirecting
  if (!auth.user) return null;
}