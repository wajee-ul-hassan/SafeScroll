const mongoose=require("mongoose")

mongoose.connect("mongodb://localhost:27017/safescroll")
.then(()=>{
})
.catch(()=>{
    console.log("Unable to connect to Database")
})

