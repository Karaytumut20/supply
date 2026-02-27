import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export default defineEventHandler((event) => {
  // Uyarı: Gerçek bir projede NuxtAuth yapılandırması Nuxt handler'ı ile sarılır.
  // Bu temel bir NextAuth config simülasyonudur.
})
