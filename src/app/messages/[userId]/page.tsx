/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import ChatComponent from "../_components/Chat";
import { useEffect, useState } from "react";
import { getUserData } from "../_utils";

export default function MessagesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [currUser, setCurrUser] = useState<any | null>(null);

  useEffect(() => {
    // Fetch the user data when the component mounts
    const currentUser = async () => {
      const { userId } = await params;
      const user = await getUserData(userId);
      if (!user) {
        throw new Error("User not found");
      }
      setCurrUser(user);
    };
    currentUser();
  }, [params]);
  // const { userId } =  params;
  // const user = await getUserData(userId);

  return <ChatComponent currentUser={currUser} />;
}
