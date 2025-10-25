import { Request, Response, NextFunction } from "express";

const detailsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get client IP (check multiple sources)
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress || 
             'unknown';
  
  const userAgent = req.headers['user-agent'] || 'unknown';
  const referer = req.headers['referer'] || req.headers['referrer'] || 'direct';
  const accept = req.headers['accept'] || 'unknown';
  const acceptLanguage = req.headers['accept-language'] || 'unknown';
  const acceptEncoding = req.headers['accept-encoding'] || 'unknown';
  const connection = req.headers['connection'] || 'unknown';
  const host = req.headers['host'] || 'unknown';
  
  console.log("\n")
  console.log(`${req.method} ${req.url} - IP: ${ip} - User-Agent: ${userAgent} - Referer: ${referer} - Accept: ${accept} - Accept-Language: ${acceptLanguage} - Accept-Encoding: ${acceptEncoding} - Connection: ${connection} - Host: ${host}`);
  console.log("\n")
  next();
};

export default detailsMiddleware;