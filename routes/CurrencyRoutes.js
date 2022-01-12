var express = require("express");
let responseObject = require("../controllers/ViewController");
const verifyToken = require("../helpers/CheckTokenExistense");
const validator = require("../helpers/validator");
let CurrencyController = require("../controllers/ChoseCurrencyController");

// Instantiate Functions
CurrencyController = new CurrencyController();
// Call Express
var router = express.Router();

router.use(
    express.urlencoded({
        extended: true,
    })
);

//currency route
router.get("/create_currency_object", async (req, res) => {
    CurrencyController.addCurrencies(req, res);
});

//currency route
router.get("/update_currency_rates", async (req, res) => {
    CurrencyController.updateCurrencyRates(req, res);
});

//default_currency
router.get("/default_currency", async (req, res) => {
    CurrencyController.defaultCurrency(req, res);
});


module.exports = router;
