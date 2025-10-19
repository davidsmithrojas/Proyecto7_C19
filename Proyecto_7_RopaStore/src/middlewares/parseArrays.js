/**
 * Middleware para convertir strings JSON a arrays en FormData
 */
const parseArrays = (req, res, next) => {
  if (req.body) {
    // Convertir strings JSON a arrays
    if (req.body.sizes && typeof req.body.sizes === 'string') {
      try {
        req.body.sizes = JSON.parse(req.body.sizes);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Formato inválido para sizes',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    if (req.body.colors && typeof req.body.colors === 'string') {
      try {
        req.body.colors = JSON.parse(req.body.colors);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Formato inválido para colors',
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  next();
};

module.exports = parseArrays;
