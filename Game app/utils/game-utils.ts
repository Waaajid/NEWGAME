export function createConfetti(count = 100, rect: DOMRect | null = null) {
  const confettiCount = count
  const colors = ["#F49091", "#881416", "#A33536", "#EE6F70", "#E82327"]

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div")
    confetti.className = "confetti"

    if (rect) {
      // Position confetti around the specified element
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      confetti.style.left = `${centerX - 50 + Math.random() * 100}px`
      confetti.style.top = `${centerY - 20}px`
    } else {
      // Position confetti randomly across the screen
      confetti.style.left = `${Math.random() * 100}%`
      confetti.style.top = "-10px"
    }

    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.width = `${Math.random() * 10 + 5}px`
    confetti.style.height = `${Math.random() * 10 + 5}px`
    confetti.style.animationDuration = `${Math.random() * 2 + 2}s`
    document.body.appendChild(confetti)

    // Remove after animation
    setTimeout(() => {
      confetti.remove()
    }, 4000)
  }
}

export function showNotification(message: string, type: "success" | "error" | "warning" | "info" = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-xs z-50 transform transition-all duration-500 translate-y-20 opacity-0`

  // Set color based on type
  if (type === "success") {
    notification.style.backgroundColor = "#A33536"
    notification.style.color = "white"
  } else if (type === "error") {
    notification.style.backgroundColor = "#E82327"
    notification.style.color = "white"
  } else if (type === "warning") {
    notification.style.backgroundColor = "#EE6F70"
    notification.style.color = "white"
  } else {
    notification.style.backgroundColor = "#F49091"
    notification.style.color = "#881416"
  }

  // Add content
  notification.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        ${getNotificationIcon(type)}
      </div>
      <div class="ml-3">
        <p class="text-sm font-medium">${message}</p>
      </div>
    </div>
  `

  // Add to DOM
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.classList.remove("translate-y-20", "opacity-0")
  }, 10)

  // Remove after delay
  setTimeout(() => {
    notification.classList.add("translate-y-20", "opacity-0")
    setTimeout(() => {
      notification.remove()
    }, 500)
  }, 3000)
}

function getNotificationIcon(type: "success" | "error" | "warning" | "info") {
  if (type === "success") {
    return `<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>`
  } else if (type === "error") {
    return `<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
    </svg>`
  } else if (type === "warning") {
    return `<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>`
  } else {
    return `<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
    </svg>`
  }
}
