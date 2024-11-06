// @ts-ignore
export const isClient = typeof window !== 'undefined'; // Function to set a cookie with an expiration date

// Function to read a specific cookie by name
export const getCookie = (name: string) => {
	if (isClient) {
		try {
			const cookieValue = document.cookie
				.split('; ')
				.find(row => row.startsWith(name))
				?.split('=')[1];
			return cookieValue ? JSON.parse(cookieValue) : [];
		} catch (error) {
			console.error(error);
			return [];
		}
	}
	return [];
};

export const setCookie = (name: string, value: any, days: number) => {
	if (isClient) {
		const date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		document.cookie = `${name}=${JSON.stringify(value)}; expires=${date.toUTCString()}; path=/`;
	}
};