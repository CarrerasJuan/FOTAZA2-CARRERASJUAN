const index = (req, res) => {
    res.status(200).json({
        module: "comments",
        status: "ok"
    });
};

module.exports = {
    index
};
