const index = (req, res) => {
    res.status(200).json({
        module: "reports",
        status: "ok"
    });
};

module.exports = {
    index
};
