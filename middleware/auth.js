const { checkToken } = require('../authControl.js');

const auth = {
	sign: async (req, res, next) => {
		const token = req.headers.authorization.split('Bearer ')
		const check = await checkToken(token[1] ? token[1] : '')
		if (check) {
			req.user = check
			next()
		} else {
			res.json({ success: false, message: 'Авторизируйтесь!' })
		}
	}
}

module.exports = auth