const mongoose = require('mongoose')
const Schema = mongoose.Schema;

var ItemSchema = new Schema({
    name: {type: String, required: true},
    details: {type: String, required: true},
    group: [{type: Schema.Types.ObjectId, required: false, ref: 'Group'}],

});

ItemSchema.virtual('url').get(function(){
    return '/catalogue/item/'+this._id;
});
module.exports = mongoose.model('Item', ItemSchema);