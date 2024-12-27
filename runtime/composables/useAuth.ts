import { useAuthStore } from '../store/auth'
import { storeToRefs } from 'pinia'

export const useAuth = () => {
	const authStore = useAuthStore()
	const {
		user,
		loggedIn,
		accessToken,
		refreshToken,
		pages
	} = storeToRefs(authStore)

	const {
		login,
		logout,
		fetchUser,
		refresh
	} = authStore

	return {
		user,
		loggedIn,
		accessToken,
		refreshToken,
		pages,
		login,
		logout,
		fetchUser,
		refresh
	}
}
