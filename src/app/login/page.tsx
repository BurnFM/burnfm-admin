"use client";

import { Box, Button, Card, Flex, Heading } from "@radix-ui/themes";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useToast } from "@/app/components/Toast";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (session) {
      router.push("/shows");
    }
  }, [session, router]);

  const handleGoogleLogin = () => {
    toast.showToast("Signing in", "Redirecting to Google...");
    signIn("google", { callbackUrl: "/shows" });
  };

  return (
    <Flex
      align="center"
      justify="center"
      flexGrow="1"
      style={{ background: "var(--accent-3)" }}
    >
      <Box width="100%" maxWidth="400px">
        <Card>
          <Flex direction="column" p="4" gap="4">
            <Heading>Log in</Heading>

            <Button onClick={handleGoogleLogin}>
              Sign in with Google
            </Button>
          </Flex>
        </Card>
      </Box>
    </Flex>
  );
}