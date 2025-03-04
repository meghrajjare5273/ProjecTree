import { headers } from "next/headers";
import { Box, Flex } from "@chakra-ui/react";
import { auth } from "@/lib/auth";
import NavLoggedIn from "@/components/nav-logged-in";
import Nav from "@/components/nav";
import { Provider } from "@/components/ui/provider";

export default async function UsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Provider>
      <Box
        minH="100vh"
        backgroundImage="url(/pexels-thephotosaccount-30324061.jpg)"
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "blackAlpha.700",
          zIndex: 1,
        }}
      >
        <Flex direction="column" minH="100vh" position="relative" zIndex={2}>
          {/* Navigation with explicit spacing */}
          <Box as="header" bg="gray.900" py={4} px={6} margin={0}>
            {session ? <NavLoggedIn /> : <Nav />}
          </Box>

          {/* Main Content with controlled spacing */}
          <Box as="main" flex={1} py={10} px={0}>
            {children}
          </Box>

          {/* Footer with explicit spacing */}
          <Box
            as="footer"
            bg="gray.900"
            py={4}
            px={0}
            textAlign="center"
            color="gray.400"
          >
            © {new Date().getFullYear()} ProjecTree. All rights reserved.
          </Box>
        </Flex>
      </Box>
    </Provider>
  );
}