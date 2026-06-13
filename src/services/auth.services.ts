import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma'
import { env } from '../config/env'
const register = async (email: string, password: string) => {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email already registered')
    const user = await prisma.user.create({
        data: { 
            email, 
            passwordHash: await bcrypt.hash(password, 10)
        }
    })
    return {
        user:         { id: user.id, email: user.email },
        accessToken:  jwt.sign({ userId: user.id }, env.JWT_SECRET as string, { expiresIn: env.JWT_EXPIRES_IN }),
        refreshToken: jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET as string, { expiresIn: env.JWT_REFRESH_EXPIRES_IN })
    }
}
const login = async(email: string, password: string)=>{
    const existing = await prisma.user.findUnique({ where: { email } })
    if (!existing) throw new Error('Invalid email or password')
    const check =await bcrypt.compare(password, existing.passwordHash);
if(!check){
    throw new Error('Invalid email or password')
}
return {
        user:         { id: existing.id, email: existing.email },
        accessToken:  jwt.sign({ userId: existing.id }, env.JWT_SECRET as string, { expiresIn: env.JWT_EXPIRES_IN }),
        refreshToken: jwt.sign({ userId: existing.id }, env.JWT_REFRESH_SECRET as string, { expiresIn: env.JWT_REFRESH_EXPIRES_IN })
    }

}
const refresh = (token: string) => {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string }
    return {
      accessToken: jwt.sign({userId:payload.userId}, env.JWT_SECRET as string, { expiresIn: env.JWT_EXPIRES_IN})
    }
  } catch {
    throw new Error('refresh failed')
  }
}
export { register,login,refresh }