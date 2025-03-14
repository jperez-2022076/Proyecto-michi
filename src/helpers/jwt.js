'use strict'
import jwt from 'jsonwebtoken';


const secretKey = '@LlaveSuperSecreta@';
export const generateJwt = async (payload) => {
    try {
      return jwt.sign(payload, secretKey, {
   
        algorithm: 'HS256',
      });
    } catch (err) {
      console.error(err);
      return err;
    }
  };