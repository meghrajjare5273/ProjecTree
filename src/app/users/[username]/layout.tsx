import { headers } from "next/headers";
import { Box } from "@mui/material";
import { auth } from "@/lib/auth";
import NavLoggedIn from "@/components/nav-logged-in";
import Nav from "@/components/nav";
// import { Provider } from "@/components/ui/provider";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;

  return {
    title: `@${username}`,
    description: `View @${username}'s profile, projects, and events on ProjecTree.`,
    openGraph: {
      title: `@${username}`,
      description: `Check out ${username}'s contributions, projects, and upcoming events.`,
      type: "profile",
      images: [
        {
          url: "/og-profile-image.jpg",
          width: 1200,
          height: 630,
          alt: `${username}'s profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${username}'s Profile | Community Platform`,
      description: `View ${username}'s profile, projects, and events on our community platform.`,
      images: ["/og-profile-image.jpg"],
    },
  };
}

export default async function UsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: "url(/pexels-thephotosaccount-30324061.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Navigation with explicit spacing */}
        <Box>{session ? <NavLoggedIn /> : <Nav />}</Box>

        {/* Main Content with controlled spacing */}
        <Box
          component="main"
          sx={{
            flex: 1,
            py: 10,
            px: 0,
          }}
        >
          {children}
        </Box>

        {/* Footer with explicit spacing */}
        {/* <Box
          component="footer"
          sx={{
            backgroundColor: "rgb(17, 24, 39)", // equivalent to gray.900
            py: 4,
            px: 0,
            textAlign: "center",
            color: "rgb(156, 163, 175)", // equivalent to gray.400
          }}
        >
          <Typography variant="body2" color="inherit">
            © {new Date().getFullYear()} ProjecTree. All rights reserved.
          </Typography>
        </Box> */}
      </Box>
    </Box>
  );
}
