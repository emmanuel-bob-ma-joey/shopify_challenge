const Item = require('../models/item');
const Group = require('../models/group');
var async = require('async');
const {body, validationResult} = require('express-validator');

exports.index = function(req,res){
    async.parallel({
        item_count: function(callback){
            Item.countDocuments({},callback);
        },

    },
    function(err,results){
        res.render('index',{title: 'Inventory Home', error: err, data: results });
    })
};


// item create form on GET.
exports.item_create_get = function(req, res, next) {

    // Get all groups we can put the item in
    async.parallel({
        groups: function(callback) {
            Group.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('create_item', { title: 'Create Inventory Item', groups: results.groups});
    });

};

// Handle item create on POST.
exports.item_create_post = [

    // Validate and sanitise fields.
    body('name', 'Name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('details', 'Details must not be empty.').trim().isLength({ min: 1 }).escape(),
   
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create new item object with trimmed data
        var item = new Item(
            { name: req.body.name,
                group: req.body.group,
                details: req.body.details,
             }
        );
        
        if (!errors.isEmpty()) {
            //errors so render form again with sanitized values/error messages.

            // Get all groups for form.
            async.parallel({//maybe can use async.apply
                groups: function(callback) {
                    Group.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('create_item', { title: 'Create Item',groups:results.groups, item: item, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save item.
            item.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to item url.
                   res.redirect(item.url);
                });
        }
    }
];

exports.item_detail = function(req, res,next) {
    async.parallel({
        item: function(callback){
            Item.findById(req.params.id)
            .populate('group')
            .exec(callback);
        },
    },function(err,results){
        if (err){return next(err)}
        if (results.item == null){
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        res.render('item_detail',{title: results.item.name, item:results.item });
    });
};

// Display list of all items.
exports.item_list = function(req, res, next) {
    Item.find({}, 'name details')
    .populate('group')
    .exec(function(err,item_list){
        if (err){
            return next(err);
        }
        res.render('item_list',{title:'Inventory List', item_list: item_list});

    });
};

// Handle book delete on POST.
exports.item_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).
    async.parallel({
        item: function(callback) {
            Item.findById(req.body.id).populate('group').exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            //redirect back to item list page
            Item.findByIdAndRemove(req.body.id, function deleteItem(err) {
                if (err) { return next(err); }
                // Success - go to items list.
                res.redirect('/catalogue/items');
            });

        }
    });

};

// Display book update form on GET.
exports.item_update_get = function(req, res, next) {

    // Get item and group for form
    async.parallel({
        item: function(callback) {
            Item.findById(req.params.id).populate('group').exec(callback);
        },
        groups: function(callback) {
            Group.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.item==null) { 
                var err = new Error('Item not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('create_item', { title: 'Update Item', groups: results.groups, item: results.item });
        });

};

// Handle book update on POST.
exports.item_update_post = [

    // Validate and sanitise fields.
    body('name', 'name must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('details', 'details must not be empty.').trim().isLength({ min: 1 }).escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var item = new Item(
          { name: req.body.name,
            group: req.body.group,
            details: req.body.details,
            _id:req.params.id //to keep id the same
           });

        if (!errors.isEmpty()) {
            // render form again with sanitized values/error messages.
            // get all groups again for form.
            async.parallel({
                groups: function(callback) {
                    Group.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }
                res.render('create_item', { title: 'Update Item',groups: results.groups, item: item, errors: errors.array() });
            });
            return;
        }
        else {
            // data from form is valid so update
            Item.findByIdAndUpdate(req.params.id, item, {}, function (err,theItem) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(theItem.url);
                });
        }
    }
];