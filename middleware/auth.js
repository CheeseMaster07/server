import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {

    const token = req.headers.authorization?.split(" ")[1]
    const isCustomAuth = token?.length < 500

    let decodedData

    if (token && isCustomAuth) {
      decodedData = jwt.verify(token, process.env.AUTH_SECRET)

      req.userId = decodedData?.id
    } else {
      decodedData = jwt.decode(token)
      req.userId = decodedData?.sub
    }

    next()

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('Expired token:', error.expiredAt);
      req.hasExpired = true
      next(); // Proceed to the next middleware or controller function
    } else {
      console.log(error);
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}

export default auth