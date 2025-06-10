import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect(`/messages/${session.user.id}`);
  } else if (!session) {
    return redirect("/");
  } else {
    return <div>Loading...</div>;
  }
}
