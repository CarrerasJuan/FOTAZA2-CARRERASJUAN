const index = (req, res) => {
    res.status(200).json({
        module: "auth",
        status: "ok"
    });
};

module.exports = {
    index
};
