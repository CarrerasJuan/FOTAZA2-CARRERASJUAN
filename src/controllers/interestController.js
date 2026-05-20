const index = (req, res) => {
    res.status(200).json({
        module: "interests",
        status: "ok"
    });
};

module.exports = {
    index
};
