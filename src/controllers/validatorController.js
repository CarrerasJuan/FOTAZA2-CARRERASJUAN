const index = (req, res) => {
    res.status(200).json({
        module: "validator",
        status: "ok"
    });
};

module.exports = {
    index
};
