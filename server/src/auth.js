import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'

const KEYLEN = 64

export function hashPassword(pass) {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16)
    scrypt(pass, salt, KEYLEN, (err, key) => {
      if (err) return reject(err)
      resolve(`${salt.toString('hex')}:${key.toString('hex')}`)
    })
  })
}

export function verifyPassword(pass, stored) {
  return new Promise((resolve, reject) => {
    const [saltHex, keyHex] = stored.split(':')
    scrypt(pass, Buffer.from(saltHex, 'hex'), KEYLEN, (err, key) => {
      if (err) return reject(err)
      resolve(timingSafeEqual(key, Buffer.from(keyHex, 'hex')))
    })
  })
}
