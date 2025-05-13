import JSEncrypt from 'jsencrypt'
import { authAPI } from '@/api'

// 创建RSA加密实例
const encrypt = new JSEncrypt()

// 设置公钥
export const setPublicKey = (publicKey) => {
  encrypt.setPublicKey(publicKey)
}

// RSA加密
export const rsaEncrypt = (text) => {
  return encrypt.encrypt(text)
}

// 获取RSA公钥
export const getPublicKey = async () => {
  try {
    const res = await authAPI.getPublicKey()
    if (res.code === 200) {
      setPublicKey(res.data)
      return true
    }
    return false
  } catch (error) {
    console.error('获取RSA公钥失败:', error)
    return false
  }
} 