export function createOverdriveTimer() {
	const timer = document.querySelector('.overdrive-timer-container')

	const myMutationObserver = new MutationObserver(mutations => {
		mutations.forEach(mutation => {
			// Проверяем добавленные элементы
			mutation.addedNodes.forEach(node => {
				if (
					node instanceof Element &&
					node.matches('.BattleComponentStyle-canvasContainer')
				) {
					timer.style.display = 'block'
					startOverdriveTimer(95)
				}
			})

			// Проверяем удалённые элементы
			mutation.removedNodes.forEach(node => {
				if (
					node instanceof Element &&
					node.matches('.BattleComponentStyle-canvasContainer')
				) {
					timer.style.display = 'none'
				}
			})
		})
	})

	myMutationObserver.observe(document.documentElement, {
		childList: true,
		subtree: true,
	})
}

export function startOverdriveTimer(durationInSeconds) {
	const fill = document.querySelector('.overdrive-timer')

	fill.style.transition = 'none'
	fill.style.width = '0%'

	// Форсируем перерисовку
	fill.offsetWidth

	setTimeout(() => {
		fill.style.transition = `width ${durationInSeconds}s linear`
		fill.style.width = '100%'
	}, 20)
}
