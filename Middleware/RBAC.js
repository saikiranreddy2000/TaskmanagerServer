const permit=(...roles)=>{
 return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {

      return res.status(403).json({
        status: 403,
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
}

module.exports=permit
