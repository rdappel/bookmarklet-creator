const express = require('express')
const fs = require('fs')
const path = require('path')
const terser = require('terser')
const { blue } = require('chalk')

const port = 3011
const scriptsPath = path.join(__dirname, 'scripts')

const app = express()

const loadAndMinifyScripts = async () => {
	const files = fs.readdirSync(scriptsPath).filter(f => f.endsWith('.js'))

	const contents = files.map(file => {
		const fullPath = path.join(scriptsPath, file)
		const raw = fs.readFileSync(fullPath, 'utf8')
		const newlineIndex = raw.indexOf('\n');
		const firstLine = newlineIndex === -1 ? raw : raw.slice(0, newlineIndex)
		const name = firstLine.replaceAll('//', '').trim()
		const withIife = `(() => {\n${raw}\n})()`
		return { name, withIife }
	})

	const promises = contents.map(async ({ name, withIife }) => {
		return new Promise(resolve => {
			terser.minify(withIife).then(minified => {
				if (minified.error) {
					console.error(`❌ Error minifying script:`, minified.error)
					resolve(null)
				} else {
					const code = minified.code.replaceAll('\"', '\'')
					const url = 'javascript:' + code
					resolve({ name, url })
				}
			}).catch(err => {
				console.error(`❌ Error during minification:`, err)
				resolve(null)
			})
		})
	})

	return (await Promise.all(promises)).filter(Boolean)
}

app.get('/', async (_, response) => {
	const bookmarklets = await loadAndMinifyScripts()

	response.send(`
<html>

<head>
	<title>Bookmarklets</title>
</head>
<style>
	body {
		font-family: Arial, sans-serif;
		background-color: #f8f8f8;
		color: #333;
		margin: 0;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		flex-direction: column;
	}

	h1 {
		color: #000;
		font-size: 2.5em;
		margin-bottom: 20px;
	}

	ul {
		list-style-type: none;
		padding: 0;
		margin: 0;
		width: 100%;
		max-width: 300px;
	}

	li {
		background-color: #fff;
		border-radius: 5px;
		padding: 10px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		margin-bottom: 10px;
		transition: background-color 0.3s, transform 0.3s;
		text-align: center;
		cursor: pointer;
	}

	li:hover {
		background-color: #e0e0e0;
		transform: translateY(-3px);
	}

	a {
		text-decoration: none;
		color: #333;
		font-size: 1.2em;
		font-weight: bold;
		transition: color 0.2s;
		text-align: center;
	}

	a:hover {
		color: #000;
	}
</style>

<body>
	<h1>Bookmarklets</h1>
	<ul>
		${bookmarklets.map(({ url, name }) => `<li><a href="${url}" title="${name}">${name}</a></li>`).join('')}
	</ul>
</body>

</html>	
	`)
})


app.listen(port, () => console.log(`✅ Server running at: ${blue(`http://localhost:${port}`)}`))
