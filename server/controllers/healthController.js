export const getHealth = (req, res) => {
    try {
        res.send("Up and running~ Feeling Good~")
    } catch (error) {
        console.log(error);
        res.status(503).send("Service Unavailable")
    }
};