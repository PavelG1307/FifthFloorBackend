const test_js = require('./test.json')
class authController {
    async login(req,res){
        try {
            res.json("JWT tokken")
        } catch(e) {

        }
    }

    async status(req,res){
        try {
            res.setHeader("Access-Control-Allow-Methods", "GET, POST")
            res.json(test_js)
        } catch(e) {

        }
    }
}

module.exports = new authController()