var express = require('express');
var router = express.Router();

/* GET activites. */
router.get('/all', (req, res, next) => {
  res.status(501);
  res.send('not yet implemented');
});

module.exports = router;
