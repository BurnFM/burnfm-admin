"use client"
import {Box, Button, Card, Flex, Heading, Link, Text, TextField} from "@radix-ui/themes";
import NextLink from "next/link";
import {useAuth} from "@/auth/AuthContext";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {useToast} from "@/app/components/Toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const handleLogin = async () => {
    try {
      // const data = {
      //   username: username,
      //   password: password
      // };
      // const response = await fetch(LOGIN_ENDPOINT, {
      //   body: JSON.stringify(data),
      //   method: "POST"
      // });
      //
      // login(response.data.token);

      // TODO: For now, just log on with fake token
      login("token");
      router.push("/");

    } catch (error: any) {
      console.error("Login failed:", error.response?.data || error.message);
      toast.showToast("Login failed", "Please try again later");
    }
  };

  return (
        <Flex align="center" justify="center" flexGrow="1" style={{ background: "var(--accent-3)" }}>
          <Box width="100%" maxWidth="400px" asChild overflow="visible">
            <Card>
              <Flex direction="column" p="4" gap="4" asChild>
                <form action={handleLogin}>
                  <Heading>Log in</Heading>

                  <label>
                    <Text as="div" size="2" mb="1" weight="bold">
                      Username
                    </Text>
                    <TextField.Root
                        name="username"
                        value={username}
                        onChange={(x) => setUsername(x.target.value)}
                        placeholder="Enter username"
                        required
                    />
                  </label>

                  <label>
                    <Flex justify="between">
                      <Text as="div" size="2" mb="1" weight="bold">
                        Password
                      </Text>
                    </Flex>
                    <TextField.Root
                        name="password"
                        type="password"
                        value={password}
                        onChange={(x) => setPassword(x.target.value)}
                        placeholder="Enter password"
                        required
                    />
                  </label>

                  <Flex justify="end" gap="4" mt="2" align="center">
                    <Button type="submit">Log in</Button>
                  </Flex>
                </form>
              </Flex>
            </Card>
          </Box>
        </Flex>
)
  ;
}