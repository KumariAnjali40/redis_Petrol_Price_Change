const express = require('express');
const {connection}=require('./db');
const {PetrolModel}=require('./model/petrol.model');
const Redis = require('ioredis');

const redis = new Redis({
    port : "13881",
    host : "redis-13881.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    password : "iuIcoRFsH3WwAlScP2KkuBM9CpNGhKTu"
});


const app = express();
app.use(express.json());



app.get('/price', async (req, res) => {
    try {
        const { city } = req.query;

        console.log(city);
        
        // Attempt to get data from Redis cache
        const cachedPetrolPrice = await redis.get(city);

        if (cachedPetrolPrice) {
            console.log("Data retrieved from cache:", cachedPetrolPrice);
            return res.status(200).json({ msg: 'Petrol price retrieved from cache', petrol: JSON.parse(cachedPetrolPrice) });
        }

        // If data is not in cache, query the database
        const petrol = await PetrolModel.findOne({ city });

        if (!petrol) {
            return res.status(404).json({ msg: 'Petrol price not found for the given city' });
        }

        // Store data in Redis cache
        await redis.set(city, JSON.stringify(petrol.price), 'EX', 120);
        
        console.log("Data retrieved from database:", petrol);
        res.status(200).json({ msg: petrol.price });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});


app.post('/petrolPrice',async(req,res)=>{
    const {city,price}=req.body;
   const petrol=new PetrolModel({city,price});
   await petrol.save();
   res.status(200).json({msg:"petrol price updated",petrol});
})

app.patch('/updatePetrolPrice', async (req, res) => {
    try {
        const { city, price } = req.body;

        // Assuming your PetrolModel has a schema with a 'city' field
        const updatedPetrol = await PetrolModel.findOneAndUpdate(
            { city: city }, 
            { price },
            { new: true } 
        );

        if (!updatedPetrol) {
            return res.status(404).json({ msg: 'Petrol price not found for the given city' });
        }

        res.status(200).json({ msg: 'Petrol price updated', updatedPetrol });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});


app.listen(4500, async() => {
    await connection;
    console.log("connected to db");
    console.log(`Server is running on 4500`);
});
