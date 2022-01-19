const express = require('express');
const router = express.Router();
//import required controllers
const item_controller = require('../controllers/itemController')

//require controller modules
router.get('/',item_controller.index);
//GET request for creating item
router.get('/item/create',item_controller.item_create_get);
// POST request for creating item
router.post('/item/create', item_controller.item_create_post);

// GET request item page
router.get('/item/:id', item_controller.item_detail);

module.exports = router;