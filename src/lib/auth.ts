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
      id: "barber-login",
      name: "Barber",
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

          if (!barber) throw new Error("Usuário ou senha incorretos.");
          const isValid = await bcrypt.compare(credentials.password, barber.password);
          if (!isValid) throw new Error("Usuário ou senha incorretos.");
          if (!barber.active) throw new Error("Sua conta foi desativada.");

          return {
            id: barber.id,
            name: barber.name,
            email: barber.email,
            role: "BARBER",
            barbershopId: barber.barbershopId,
            slug: barber.barbershop.slug,
          } as any;
        } catch (error: any) {
          if (error.message === "Usuário ou senha incorretos." || error.message === "Sua conta foi desativada.") throw error;
          throw new Error("Ocorreu um erro no servidor. Tente novamente mais tarde.");
        }
      }
    }),
    CredentialsProvider({
      id: "client-login",
      name: "Client",
      credentials: {
        whatsapp: { label: "WhatsApp", type: "text" },
        password: { label: "Password", type: "password" },
        slug: { label: "Slug", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.whatsapp || !credentials?.password || !credentials?.slug) {
          throw new Error("WhatsApp, senha e slug são obrigatórios.");
        }

        try {
          const barbershop = await prisma.barbershop.findUnique({ where: { slug: credentials.slug } });
          if (!barbershop) throw new Error("Barbearia não encontrada.");

          const client = await prisma.client.findFirst({
            where: { whatsapp: credentials.whatsapp, barbershopId: barbershop.id }
          });

          if (!client) throw new Error("Cliente não encontrado.");

          // Se a senha estiver salva sem hash (cadastro antigo), precisamos comparar direto ou forçar atualização, 
          // mas como implementamos bcrypt agora, assumiremos que é bcrypt ou senha simples (fallback).
          let isValid = false;
          try {
             isValid = await bcrypt.compare(credentials.password, client.password);
          } catch(e) {
             isValid = client.password === credentials.password;
          }
          
          if (!isValid && client.password !== credentials.password) {
            throw new Error("WhatsApp ou senha incorretos.");
          }

          return {
            id: client.id,
            name: client.name,
            whatsapp: client.whatsapp,
            role: "CLIENT",
            barbershopId: client.barbershopId,
            slug: barbershop.slug,
          } as any;
        } catch (error: any) {
          if (error.message === "Cliente não encontrado." || error.message === "WhatsApp ou senha incorretos." || error.message === "Barbearia não encontrada.") throw error;
          throw new Error("Ocorreu um erro no servidor. Tente novamente mais tarde.");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.barbershopId = (user as any).barbershopId;
        token.slug = (user as any).slug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
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
