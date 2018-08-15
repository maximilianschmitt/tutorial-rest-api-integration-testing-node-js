/* eslint-env mocha */

const axios = require('axios')
const spawn = require('child_process').spawn
const getPort = require('get-port')

// TEST_ENV contains the environment variables for our test server
const TEST_ENV = {
  PORT: undefined, // Assigned at runtime
  MONGODB_URI: 'mongodb://localhost:27017',
  MONGODB_DB: 'todoman-test'
}

// spawnServer is a utility function that starts a test server with a given set
// of environment variables and returns a promise that resolves to the
// ChildProcess of the server once it is reachable at its base URL
function spawnServer(env) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['src/main'], { env })

    // Pipe the test server's stdout and stderr to our main process so that we
    // can see console.logs and errors of our server when running our tests
    server.stdout.pipe(process.stdout)
    server.stderr.pipe(process.stderr)

    server.on('error', reject)

    // Wait for the server to be reachable
    return waitForURLReachable(`http://localhost:${env.PORT}`)
      .then(() => resolve(server))
      .catch(reject)
  })
}

// waitForURLReachable is a utility function that tries to GET a URL until it
// succeeds. It will throw an error if it cannot reach the URL within the
// provided `opts.timeout` (default: 1000ms)
async function waitForURLReachable(url, { timeout = 1000 } = {}) {
  const timeoutThreshold = Date.now() + timeout

  while (true) {
    try {
      await axios.get(url)

      return true
    } catch (err) {
      if (Date.now() > timeoutThreshold) {
        throw new Error(`URL ${url} not reachable after ${timeout}ms`)
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

exports.useInTest = function() {
  before(async function startTestServer() {
    // The test server's environment variables should be set to TEST_ENV as
    // declared at the top of the file, but:
    // 1. Assign PATH to the user's PATH so that the `node` binary can be found
    // 2. Assign PORT to a random free port
    const env = Object.assign({}, TEST_ENV, {
      PATH: process.env.PATH,
      PORT: await getPort()
    })

    // Use our utility function that we created above to spawn the test server
    const testServer = await spawnServer(env)

    // Create an axios instance that is configured to use the test server as its
    // base URL and expose it as `this.api`. This allows us to easily make
    // requests like `this.api.get('/todos')` from within our test files
    const api = axios.create({ baseURL: `http://localhost:${env.PORT}` })

    this.testServer = testServer
    this.api = api
  })

  after(function stopTestServer() {
    // After all tests, stop the test server...
    this.testServer.kill()

    // ...and wait for it to shut down
    return new Promise(resolve => this.testServer.on('close', () => resolve()))
  })
}
