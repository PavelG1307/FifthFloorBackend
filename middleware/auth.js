const { checkToken } = require('../authControl.js');

const auth = {
	sign: async (req, res, next) => {
		try {
		const token = req.headers.authorization.split('Bearer ')
		const check = await checkToken(token[1] ? token[1] : '')
		if (check) {
			req.user = check.id || check 
			next()
		} else {
			res.json({ success: false, message: 'Авторизируйтесь!' })
		}
	} catch(e) {res.json({ success: false, message: 'Авторизируйтесь!' })}
	}
}

module.exports = auth