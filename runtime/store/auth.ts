import { defineStore } from 'pinia'
import type { ProfileDTO } from '~/types/profile'
import { useCookie, useRouter, useRoute, useToast } from '#imports'
import type { LoginRequestDTO, LoginResponseDTO } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
	const user = ref<ProfileDTO | null>(null)
	const accessToken = useCookie('auth.token')
	const refreshToken = useCookie('auth.refresh_token')
	const pages = ref({
		home: '/',
		login: '/auth'
	})

	const router = useRouter()
	const route = useRoute()
	const toast = useToast()
	const loggedIn = computed(() => !!user.value)

	const fetchUser = async () => {
		try {
			const opts = accessToken.value ? { headers: { Authorization: `Bearer ${accessToken.value}` } } : {}
			user.value = await $fetch<ProfileDTO>('/api/user/profile', opts)
			if (route.path === pages.value.login) {
				await router.push(pages.value.home)
			}
		} catch (err) {
			console.error(err)
			toast.add({
				title: 'Ошибка получения пользователя',
				color: 'error'
			})
		}
	}

	const reset = async () => {
		user.value = null
		accessToken.value = null
		refreshToken.value = null
	}

	// init
	(async () => {
		if (accessToken.value) {
			await fetchUser()
		} else {
			await reset()
		}
	})()

	const login = async (body: LoginRequestDTO) => {
		try {
			const response = await $fetch<LoginResponseDTO>('/api/admin/auth/login', {
				body,
				method: 'POST'
			})
			accessToken.value = response.accessToken
			refreshToken.value = response.refreshToken
			await fetchUser()
			await router.push(pages.value.home)
		} catch (err) {
			console.error(err)
			toast.add({
				title: 'Ошибка авторизации',
				color: 'error'
			})
		}

	}

	const refresh = async () => {
		try {
			const body = {
				refreshToken: refreshToken.value,
			}
			const response = await $fetch<LoginResponseDTO>('/api/auth/refresh', {
				method: 'POST',
				body,
				headers: {
					Authorization: `Bearer ${accessToken.value}`
				}
			})
			accessToken.value = response.accessToken
			refreshToken.value = response.refreshToken
		} catch (err) {
			console.error(err)
		}
	}

	const logout = async () => {
		try {
			await $fetch('/api/auth', {
				method: 'DELETE'
			})
		} catch (err) {
			console.error(err)
		}
		await reset()
		await router.push(pages.value.login)
	}

	return {
		user,
		fetchUser,
		accessToken,
		refreshToken,
		loggedIn,
		login,
		logout,
		refresh,
		reset,
		pages
	}
})
