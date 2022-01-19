const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GroupSchema = new Schema({
    name: {type: String, required: true}
});

GroupSchema.virtual('url').get(function(){
    return ('/catalogue/group/'+this._id);
});

module.exports = mongoose.model('Group', GroupSchema);