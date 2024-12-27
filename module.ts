import { defineNuxtModule, createResolver, addPlugin, addImportsDir, addRouteMiddleware } from '@nuxt/kit'

export default defineNuxtModule({
	meta: {
		name: 'qtim-auth',
		configKey: 'auth',
	},
	setup(_, nuxt) {
		const { resolve } = createResolver(import.meta.url);

		addRouteMiddleware({
			name: "auth",
			path: resolve("./runtime/middleware/auth"),
			global: true
		});

		addPlugin(resolve("./runtime/plugins/fetch-interceptor"));

		// Подключаем composables
		addImportsDir(resolve('./runtime/composables'))

		// Подключаем stores
		nuxt.hook('imports:dirs', (dirs) => {
			dirs.push(resolve('./runtime/store'))
		})
	},
})
