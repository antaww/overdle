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


export const animateOnHover = (
	triggerClass: string,
	animatedClass: string,
	animationIn: string,
	animationOut: string,
	deleteAfter: number = 0
) => {
	const elements = document.querySelectorAll(triggerClass);
	console.log(elements);

	elements.forEach((element) => {
		const animatedElement = element.querySelector(animatedClass);

		// Handle the animation on mouse over
		element.addEventListener('mouseover', () => {
			animatedElement?.classList.add('visible', animationIn);
			animatedElement?.classList.remove(animationOut);
		});

		// Handle the animation on mouse out
		element.addEventListener('mouseout', () => {
			setTimeout(() => {
				animatedElement?.classList.remove(animationIn);
				animatedElement?.classList.add('visible', animationOut);

				// Wait for the animation to end before removing the element
				animatedElement?.addEventListener('animationend', function handleAnimationEnd() {
					animatedElement.classList.remove(animationOut, 'visible');
					animatedElement.removeEventListener('animationend', handleAnimationEnd);
				});
			}, deleteAfter * 1000);
		});
	});
};
