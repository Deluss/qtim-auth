import { defineNuxtRouteMiddleware, navigateTo, useAuth } from '#imports'

export default defineNuxtRouteMiddleware((to) => {
	const { accessToken, pages } = useAuth()

	if (accessToken.value && to.path === pages.value.login) {
		return navigateTo(pages.value.home)
	}

	if (!accessToken.value && to.path !== pages.value.login) {
		return navigateTo(pages.value.login)
	}
})
