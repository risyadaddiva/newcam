import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

// Pre-hashed password for "eskopidua"
const DUMMY_PASSWORD_HASH =
  "$2b$10$VFMWFEi5JQ1.tSypitiKheDs97o0ES/6msblzHZP.fwjsosIsZV6e";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        if (credentials.username !== "cnc_admin") return null;

        const isValid = await compare(
          credentials.password,
          DUMMY_PASSWORD_HASH
        );
        if (!isValid) return null;

        return {
          id: "1",
          name: "CNC Admin",
          email: "admin@coffeenewcammary.com",
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
