//import products from './src/data/data.js';
import healthRouter from './server/routes/healthRoutes.js';
import express from 'express';

const app = express();
const port = 3000;

//Test
app.get('/', (req, res) => {
    res.send("Helloooo~");
});

app.use('/api/v1', healthRouter);


//Get - /api/v1/products - get all products
app.get('/api/v1/products', (req, res) => {
    try {
        res.send()
        
    } catch (error) {
        
    }
})


app.listen(port, () => {
  console.log(`ScreenSage listening on port ${port}`);
});