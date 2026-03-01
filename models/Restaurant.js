const mongoose=require('mongoose');

const RestaurantSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,'Please add a name'],
    unique:true,
    trim:true,
    maxlength:[50,'Name can not be more than 50 characters']
  },
  address:{
    type:String,
    required:[true,'Please add an address']
  },
  district:{
    type:String,
    required:[true,'Please add a district']
  },
  province:{
    type:String,
    required:[true,'Please add a province']
  },
  postalcode:{
    type:String,
    required:[true,'Please add a postalcode'],
    maxlength:[5,'Postal Code can not be more than 5 digits']
  },
  tel: {
    type:String,
    required:[true,'Please add a telephone number']
  },
  region:{
    type:String,
    required:[true,'Please add a region']
  },
  openTime:{
    type:String,
    required:[true,'Please add open time']
  },
  closeTime:{
    type:String,
    required:[true,'Please add close time']
  }
},{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});

RestaurantSchema.virtual('reservations',{
  ref:'Reservation',
  localField:'_id',
  foreignField:'restaurant',
  justOne:false
});

module.exports=mongoose.model('Restaurant',RestaurantSchema);