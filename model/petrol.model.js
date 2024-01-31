const mongoose=require('mongoose');

const petrolSchema=mongoose.Schema({
   city:String,
   price:String

},{
    versionKey:false
})


const PetrolModel=mongoose.model("petrol",petrolSchema);

module.exports={
   PetrolModel,
}