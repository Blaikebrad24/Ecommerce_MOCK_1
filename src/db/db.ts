import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaDb: undefined | ReturnType<typeof prismaClientSingleton>
}

const prismaDBConnection = globalThis.prismaDb ?? prismaClientSingleton()

export default prismaDBConnection

if (process.env.NODE_ENV !== 'production') globalThis.prismaDb = prismaDBConnection