const jwt=require('jsonwebtoken')
const UserDetails=require('../Models/RegisterationModel')
const { JWT_KEY } = require('../config/Variableconfig')

function getCookieValue(cookieHeader, cookieName) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const cookie = cookies.find((item) => item.startsWith(`${cookieName}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

const JwtAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || getCookieValue(req.headers.cookie, 'token');

  if(!token){
    throw new Error('invalid token')
  }
    if (!JWT_KEY) {
      throw new Error('JWT_KEY is missing in .env');
    }

    const decodeCookie = await jwt.verify(token, JWT_KEY);
    const { _id } = decodeCookie;
    const user = await UserDetails.findById({ _id })
    if (user) {
      req.user=user
      next();
    } else {
      throw new Error('invalid token')
    }
  } catch (error) {
    res.status(400).json({status:400,code:"VALIDATION_ERROR","message":error.message});
  }
};

module.exports = JwtAuth;
