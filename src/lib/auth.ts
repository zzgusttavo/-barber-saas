import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const authOptions: NextAuthOptions = {
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

        try {
          const barber = await prisma.barber.findUnique({
            where: { email: credentials.email },
            include: { barbershop: true }
          });

          if (!barber) {
            throw new Error("Usuário ou senha incorretos.");
          }

          const isValid = await bcrypt.compare(credentials.password, barber.password);

          if (!isValid) {
            throw new Error("Usuário ou senha incorretos.");
          }

          if (!barber.active) {
            throw new Error("Sua conta foi desativada.");
          }

          return {
            id: barber.id,
            name: barber.name,
            email: barber.email,
            barbershopId: barber.barbershopId,
            slug: barber.barbershop.slug,
          } as any;
        } catch (error: any) {
          if (error.message === "Usuário ou senha incorretos." || error.message === "Sua conta foi desativada.") {
            throw error;
          }
          console.error("Erro interno no login:", error);
          throw new Error("Ocorreu um erro no servidor. Tente novamente mais tarde.");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
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
};
