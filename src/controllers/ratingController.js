const index = (req, res) => {
    res.status(200).json({
        module: "ratings",
        status: "ok"
    });
};

module.exports = {
    index
};
