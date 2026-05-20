const index = (req, res) => {
    res.status(200).json({
        module: "search",
        status: "ok"
    });
};

module.exports = {
    index
};
