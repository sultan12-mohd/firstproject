const mongoose=require('mongoose');
const itemSchema=new mongoose.Schema({
    name:String,
    roll:String,
    classname:String,
    email:String,
    contact:String,
    image:String
});
module.exports=mongoose.model('Item',itemSchema);