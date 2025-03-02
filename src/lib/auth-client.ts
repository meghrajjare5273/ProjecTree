import { createAuthClient } from "better-auth/react"
import { usernameClient } from "better-auth/client/plugins"
export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL as string, // the base url of your auth server
    plugins:[
        usernameClient()
    ]
})