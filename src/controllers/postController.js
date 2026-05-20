const index = (req, res) => {
    res.status(200).json({
        module: "posts",
        status: "ok"
    });
};

module.exports = {
    index
};
