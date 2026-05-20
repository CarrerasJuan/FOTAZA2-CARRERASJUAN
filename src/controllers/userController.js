const index = (req, res) => {
    res.status(200).json({
        module: "users",
        status: "ok"
    });
};

module.exports = {
    index
};
