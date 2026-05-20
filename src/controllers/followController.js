const index = (req, res) => {
    res.status(200).json({
        module: "follows",
        status: "ok"
    });
};

module.exports = {
    index
};
