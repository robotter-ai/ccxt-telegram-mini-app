import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'
// import fs from 'fs'
// import https from 'https'
import { env } from 'process'
// import * as os from 'os'

// noinspection JSUnusedLocalSymbols
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const frontendRestProtocol: string = env['FRONTEND_PROTOCOL'] || 'https'
const frontendWebSocketProtocol: string = env['FRONTEND_WEBSOCKET_PROTOCOL'] || 'wss';
const frontendHost: string = env['FRONTEND_HOST'] || 'localhost'
const frontendPort: number = env['FRONTEND_PORT'] ? Number(env['FRONTEND_PORT']) : 10000
const frontendPrefix = ''
const frontendBaseUrlSuffix = `${frontendHost}:${frontendPort}${frontendPrefix}`

const apiRestProtocol: string = env['API_PROTOCOL'] || 'https'
const apiWebSocketProtocol: string = env['API_WEBSOCKET_PROTOCOL'] || 'wss';
const apiHost: string = env['API_HOST'] || 'localhost'
const apiPort: number = env['API_PORT'] ? Number(env['API_PORT']) : 10001
const apiPrefix: string = env['API_PREFIX'] || ''
const apiBaseUrlSuffix = `${apiHost}:${apiPort}${apiPrefix}`

env['VITE_FRONTEND_WEBSOCKET_PROTOCOL'] = frontendWebSocketProtocol
env['VITE_FRONTEND_BASE_URL_SUFFIX'] = frontendBaseUrlSuffix

// const clientCertificatePath: string = env['API_CERTIFICATE_PATH'] || path.join(os.homedir(), 'shared', 'common', 'certificates', 'client_cert.pem')
// const clientKeyPath: string = env['API_KEY_CERTIFICATE_PATH'] || path.join(os.homedir(), 'shared', 'common', 'certificates', 'client_key.pem')
// const certificationAuthorityCertificatePath: string = env['CERTIFICATION_AUTHORITY_CERTIFICATE_PATH'] || path.join(os.homedir(), 'shared', 'common', 'certificates', 'ca_cert.pem')
//
// const clientCert = fs.readFileSync(clientCertificatePath)
// const clientKey = fs.readFileSync(clientKeyPath)
// const certificationAuthorityCertificate = fs.readFileSync(certificationAuthorityCertificatePath)

// @ts-ignore
export default defineConfig({
	server: {
		port: frontendPort,
		proxy: {
			'/api': {
				target: `${apiRestProtocol}://${apiBaseUrlSuffix}`,
				changeOrigin: true,
				secure: true,
				rewrite: (path) => {
					return path.replace(/^\/api/, '')
				},
				configure: (_proxy, options) => {
					// options.agent = new https.Agent({
					// 	key: clientKey,
					// 	cert: clientCert,
					// 	ca: certificationAuthorityCertificate,
					// 	rejectUnauthorized: false,
					// })
				},
			},
			'/ws': {
				target: `${apiWebSocketProtocol}://${apiBaseUrlSuffix}`,
				changeOrigin: true,
				secure: true,
				rewrite: (path) => {
					const newPath = path.replace(/^\/ws/, '/ws');

					return newPath
				},
				configure: (_proxy, options) => {
					// options.agent = new https.Agent({
					// 	key: clientKey,
					// 	cert: clientCert,
					// 	ca: certificationAuthorityCertificate,
					// 	rejectUnauthorized: false,
					// })
				},
			},
		},
	},
	plugins: [
		react({
			// @ts-ignore
			babel: {
				plugins: ['babel-plugin-macros']
			}
		}),
		dynamicImport(),
		tsconfigPaths(),
	],
	assetsInclude: ['**/*.md'],
	resolve: {
		alias: {
			'@': path.join(__dirname, 'src'),
		},
	},
	build: {
		outDir: 'build'
	}
})
