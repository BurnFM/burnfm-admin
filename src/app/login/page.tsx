"use client";

import { Box, Button, Card, Flex, Heading } from "@radix-ui/themes";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useToast } from "@/app/components/Toast";
import { useSearchParams } from "next/navigation";

function LoginPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session) {
      router.push("/shows");
    }
  }, [session, router]);

  const handleGoogleLogin = () => {
    toast.showToast("Signing in", "Redirecting to Google...");
    signIn("google", { callbackUrl: "/shows?login=success" });
  };

  useEffect(() => {
    if (session) {
      router.push("/shows");
    }

    if (searchParams.get("logout") === "success") {
      toast.showToast(
        "Logged out",
        "You have been signed out successfully"
      );
      router.replace("/login")
    }

    if (searchParams.get("error") === "AccessDenied") {
      toast.showToast(
        "Access denied",
        "Your Google account is not authorized"
      );
      router.replace("/login")
    }
  }, [session, router, searchParams, toast]);

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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}