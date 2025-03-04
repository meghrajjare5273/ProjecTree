import { headers } from "next/headers";
import { Box, Flex } from "@chakra-ui/react";
import { auth } from "@/lib/auth"; // Adjust based on your auth setup
import NavLoggedIn from "@/components/nav-logged-in"; // Adjust to your logged-in nav component
import Nav from "@/components/nav"; // Regular nav for non-logged-in users
import { Provider } from "@/components/ui/provider";

export default async function UsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session server-side to determine login状态
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Provider>
      <Box
        minH="100vh"
        bgImage="url(/pexels-thephotosaccount-30324061.jpg)" // Replace with your background image path
        bgSize="cover"
        backgroundPosition="center"
        bgRepeat="no-repeat"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "blackAlpha.700", // Dark overlay for readability
          zIndex: 1,
        }}
      >
        <Flex direction="column" minH="100vh" position="relative" zIndex={2}>
          {/* Navigation */}
          <Box as="header" bg="gray.900" py={4} px={6}>
            {session ? <NavLoggedIn /> : <Nav />}
          </Box>

          {/* Main Content */}
          <Box as="main" flex={1} py={10}>
            {children}
          </Box>

          {/* Footer (Optional) */}
          <Box
            as="footer"
            bg="gray.900"
            py={4}
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
