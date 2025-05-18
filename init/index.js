const mongoose=require("mongoose")
const initData=require("./data.js")
const Listing=require("../Models/listing.js")

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"

main().then(()=>{
    console.log("connected to database")
}).catch(err=>{
    console.log(err)
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"6825ddf8852e44a7eeff0db7"}))
    await Listing.insertMany(initData.data);
    console.log("data was initalised")
}

initDB()