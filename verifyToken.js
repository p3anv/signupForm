function verifyToken(req, res, next) {
    const token = req.cookies.token || ''; // Assumes you're using cookies for token storage
  
    console.log('Token:', token); // Add this line
  
    jwt.verify(token, jwtSecretKey, (err, decoded) => {
      if (err) {
        console.error('Token verification failed:', err); // Add this line
        return res.redirect('/login');
      }
      req.userId = decoded.userId;
      next();
    });
  }

  