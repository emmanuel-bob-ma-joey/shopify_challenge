var Group = require('../models/group');
var async = require('async');
var Item = require('../models/item');
const {body, validationResult} = require('express-validator');


//display gorup create form on GET
exports.group_create_get = function(req, res) {
    res.render('create_group',{title: 'Create group'});
};

// Handle group create on POST.
exports.group_create_post = [
    //validate/sanitize inputs
    body('name').trim().isLength({min: 1}).escape().withMessage('name must be specified'),
    //process request after validation and sanitization
    (req,res,next)=>{
        //extract validation errors
        const errors = validationResult(req);

        if (!errors.isEmpty()){
            res.render('create_group', { title: 'Create Group', group: req.body, errors: errors.array() });
            return;
        }
        //then group data is valid
        var group = new Group({
            name: req.body.name
        });
        group.save(function(err){
            if (err){return next(err);}
            res.redirect(group.url);
        });

    }

];


//display group detail page
module.exports.group_detail = function(req,res){
    async.parallel({
        group: function(callback){
            Group.findById(req.params.id)
            .exec(callback);
        },
        group_items: function(callback){
            Item.find({'group':req.params.id},'name details')
            .exec(callback);
        }
    }, function(err,results){
        if (err) {return next(err);}
        if (results.group == null){
            var err = new Error('Group not found');
            err.status = 404;
            return next(err);
        }
        res.render('group_detail',{title: 'Group Detail', group: results.group, group_items: results.group_items});

    });
};

//display list of all authors
module.exports.group_list = function(req,res,next){
    Group.find()
    .sort([['name','ascending']])
    .exec(function(err,group_list){
        if (err){return next(err)};
        res.render('group_list',{title:'Group List', group_list: group_list});
    });
};


// Display Author delete form on GET.
exports.group_delete_get = function(req, res, next) {

    async.parallel({
        group: function(callback) {
            Group.findById(req.params.id).exec(callback)
        },
        group_items: function(callback) {
          Item.find({ 'group': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.group==null) { // No results.
            res.redirect('/catalogue/groups');
        }
        // Successful, so render.
        res.render('group_delete', { title: 'Delete Group', group: results.group, group_items: results.group_items } );
    });

};

// Handle Author delete on POST.
exports.group_delete_post = function(req, res, next) {

    async.parallel({
        group: function(callback) {
          Group.findById(req.body.groupid).exec(callback)
        },
        group_items: function(callback) {
            Item.find({ 'group': req.body.groupid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.group_items.length > 0) {
            // group has items. Render in same way as for GET route.
            res.render('group_delete', { title: 'Delete Group', group: results.group, group_items: results.group_items } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Group.findByIdAndRemove(req.body.groupid, function deleteGroup(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalogue/groups')
            })
        }
    });
};


// Display Group update form on GET.
exports.group_update_get = function (req, res, next) {

    Group.findById(req.params.id, function (err, group) {
        if (err) { return next(err); }
        if (group == null) { // No results.
            var err = new Error('Group not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('create_group', { title: 'Rename Group', group: group });

    });
};

// Handle Author update on POST.
exports.group_update_post = [

    // Validate and santize fields.
    body('name').trim().isLength({ min: 1 }).escape().withMessage('name must be specified.')
        .isAlphanumeric().withMessage('name has non-alphanumeric characters.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data (and the old id!)
        var group = new Group(
            {
                name: req.body.name,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            res.render('create_group', { title: 'Rename Group', group: group, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Group.findByIdAndUpdate(req.params.id, group, {}, function (err, thegroup) {
                if (err) { return next(err); }
                // Successful - redirect to genre detail page.
                res.redirect(thegroup.url);
            });
        }
    }
];

