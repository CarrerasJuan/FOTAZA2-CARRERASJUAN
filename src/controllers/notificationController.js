const index = (req, res) => {
    res.status(200).json({
        module: "notifications",
        status: "ok"
    });
};

module.exports = {
    index
};
