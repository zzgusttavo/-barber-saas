import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Inicializando o PrismaClient (evitando múltiplas instâncias em dev)
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios.");
        }

        const barber = await prisma.barber.findUnique({
          where: { email: credentials.email },
          include: { barbershop: true }
        });

        if (!barber) {
          throw new Error("Usuário não encontrado.");
        }

        const isValid = await bcrypt.compare(credentials.password, barber.password);

        if (!isValid) {
          throw new Error("Senha incorreta.");
        }

        if (!barber.active) {
          throw new Error("Conta desativada.");
        }

        // Retornar objeto do usuário que ficará na sessão
        return {
          id: barber.id,
          name: barber.name,
          email: barber.email,
          barbershopId: barber.barbershopId,
          slug: barber.barbershop.slug,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // O 'user' só existe no momento do login (primeira vez)
      if (user) {
        token.id = user.id;
        token.barbershopId = (user as any).barbershopId;
        token.slug = (user as any).slug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).barbershopId = token.barbershopId;
        (session.user as any).slug = token.slug;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-barber-key",
});

export { handler as GET, handler as POST };
