const express = require('express');
const router = express.Router();
//import required controllers
const item_controller = require('../controllers/itemController')
const group_controller = require('../controllers/groupController')

//require controller modules
router.get('/',item_controller.index);
//Get request for list of items
router.get('/items',item_controller.item_list);

//GET request for creating item
router.get('/item/create',item_controller.item_create_get);
// POST request for creating item
router.post('/item/create', item_controller.item_create_post);

// GET request item page
router.get('/item/:id', item_controller.item_detail);

//POST request item page - delete item
router.post('/item/:id',item_controller.item_delete_post)
// GET request to update Book.

router.get('/item/:id/update', item_controller.item_update_get);

// POST request to update Book.
router.post('/item/:id/update', item_controller.item_update_post);

//GET request for list of groups
router.get('/groups',group_controller.group_list);

// GET request for creating group.
router.get('/group/create', group_controller.group_create_get);

// POST request for creating group.
router.post('/group/create', group_controller.group_create_post);

// GET request for one group.
router.get('/group/:id', group_controller.group_detail);


module.exports = router;