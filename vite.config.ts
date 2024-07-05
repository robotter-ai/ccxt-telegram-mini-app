import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import dynamicImport from 'vite-plugin-dynamic-import'
// import fs from 'fs'
// import https from 'https'
import { env } from 'process'
// import * as os from 'os'

const frontendRestProtocol: string = env['FUN_FRONTEND_PROTOCOL'] || 'http'
const frontendWebSocketProtocol: string = env['FUN_FRONTEND_WEBSOCKET_PROTOCOL'] || 'ws';
const frontendHost: string = env['FUN_FRONTEND_HOST'] || 'localhost'
const frontendPort: number = env['FUN_FRONTEND_PORT'] ? Number(env['FUN_FRONTEND_PORT']) : 30000
const frontendPrefix = ''
const frontendBaseUrlSuffix = `${frontendHost}:${frontendPort}${frontendPrefix}`

const apiRestProtocol: string = env['FUN_CLIENT_PROTOCOL'] || 'http'
const apiWebSocketProtocol: string = env['FUN_CLIENT_WEBSOCKET_PROTOCOL'] || 'ws';
const apiHost: string = env['FUN_CLIENT_HOST'] || 'localhost'
const apiPort: number = env['FUN_CLIENT_PORT'] ? Number(env['FUN_CLIENT_PORT']) : 30001
const apiPrefix: string = env['FUN_CLIENT_PREFIX'] || ''
const apiBaseUrlSuffix = `${apiHost}:${apiPort}${apiPrefix}`

env['VITE_FUN_FRONTEND_WEBSOCKET_PROTOCOL'] = frontendWebSocketProtocol
env['VITE_FUN_FRONTEND_BASE_URL_SUFFIX'] = frontendBaseUrlSuffix

// const clientCertificatePath: string = env['CLIENT_CERTIFICATE_PATH'] || path.join(os.homedir(), 'shared', 'common', 'certificates', 'client_cert.pem')
// const clientKeyPath: string = env['CLIENT_KEY_CERTIFICATE_PATH'] || path.join(os.homedir(), 'shared', 'common', 'certificates', 'client_key.pem')
// const certificationAuthorityCertificatePath: string = env['CERTIFICATION_AUTHORITY_CERTIFICATE_PATH'] || path.join(os.homedir(), 'shared', 'common', 'certificates', 'ca_cert.pem')
//
// const clientCert = fs.readFileSync(clientCertificatePath)
// const clientKey = fs.readFileSync(clientKeyPath)
// const certificationAuthorityCertificate = fs.readFileSync(certificationAuthorityCertificatePath)

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
