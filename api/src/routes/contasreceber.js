const express = require('express');
const router = express.Router();
const contasreceberController = require('../controllers/contasreceberController');

router.get('/',contasreceberController.get);
router.get('/:id',contasreceberController.getOne);


module.exports = router;
