// Mobile menu toggle
document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuButton = document.querySelector(".mobile-menu-button")
  const navLinks = document.querySelector(".nav-links")

  if (mobileMenuButton && navLinks) {
    mobileMenuButton.addEventListener("click", () => {
      navLinks.classList.toggle("active")
    })
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      if (targetId === "#") return

      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for header
          behavior: "smooth",
        })

        // Close mobile menu if open
        if (navLinks.classList.contains("active")) {
          navLinks.classList.remove("active")
        }
      }
    })
  })

  // Form submission handling
  const contactForm = document.getElementById("contact-form")
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = new FormData(this)
      const formValues = Object.fromEntries(formData.entries())

      // Here you would typically send the data to a server
      // For now, we'll just log it and show a success message
      console.log("Form submitted with values:", formValues)

      // Show success message
      const successMessage = document.createElement("div")
      successMessage.textContent = "Thank you for your message! We will get back to you soon."
      successMessage.style.color = "var(--success-color)"
      successMessage.style.marginTop = "1rem"

      contactForm.reset()
      contactForm.appendChild(successMessage)

      // Remove success message after 5 seconds
      setTimeout(() => {
        successMessage.remove()
      }, 5000)
    })
  }
})
