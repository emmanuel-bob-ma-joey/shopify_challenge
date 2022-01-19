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
    body('name').trim().isLength({min: 1}).escape().withMessage('name must be specified')
    .isAlphanumeric().withMessage('name has non-alphanumeric characters.'),
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
