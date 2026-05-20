const index = (req, res) => {
    res.status(200).json({
        module: "images",
        status: "ok"
    });
};

module.exports = {
    index
};
