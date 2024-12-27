// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useAuthStore } from '../store/auth'
import { useToast, storeToRefs, defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
	const authStore = useAuthStore()
	const { accessToken } = storeToRefs(authStore)
	const { refresh, logout } = authStore
	const toast = useToast()
	const refreshToken = async () => {
		try {
			await refresh()
		} catch (error) {
			toast.add({
				title: 'Сессия устарела',
				description: 'Авторизуйтесь заново',
				color: 'error'
			})
			await logout() // Если refresh не удался, вызываем logout
			throw error
		}
	}

	const addAuthorizationHeader = (options) => {
		if (accessToken.value) {
			options.headers = {
				...options.headers,
				Authorization: `Bearer ${accessToken.value}`,
			}
		}
	}

	// Флаг для предотвращения зацикливания
	let isRefreshing = false

	// Patch $fetch
	const originalFetch = globalThis.$fetch
	globalThis.$fetch = async (url, options = {}) => {
		addAuthorizationHeader(options)

		try {
			return await originalFetch(url, options)
		} catch (error) {
			if (error?.response?.status === 401 && !isRefreshing) {
				isRefreshing = true // Устанавливаем флаг
				try {
					await refreshToken()
					addAuthorizationHeader(options) // Добавляем новый токен
					return await originalFetch(url, options) // Повторяем запрос
				} catch (refreshError) {
					toast.add({
						title: 'Сессия устарела',
						description: 'Авторизуйтесь заново',
						color: 'error'
					})
					await logout() // Вызываем logout из стора
					throw refreshError
				} finally {
					isRefreshing = false // Сбрасываем флаг
				}
			}
			throw error // Если не 401, пробрасываем ошибку дальше
		}
	}
})
