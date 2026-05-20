const index = (req, res) => {
    res.status(200).json({
        module: "collections",
        status: "ok"
    });
};

module.exports = {
    index
};
