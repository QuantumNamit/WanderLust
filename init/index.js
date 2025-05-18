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
    await mongoose.connect("mongodb+srv://Namit_Aneja:7Bv52MlPmXSYW8Vd@cluster0.cmlqkbe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"6829e30f4791a1e6f62eb813"}))
    await Listing.insertMany(initData.data);
    console.log("data was initalised")
}

initDB()