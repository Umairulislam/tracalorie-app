function showToast(message, type = "success") {
  const toastEl = document.querySelector("#appToast")
  const toastBody = document.querySelector("#appToastMessage")

  toastBody.textContent = message
  toastEl.classList.remove("text-bg-success", "text-bg-danger", "text-bg-warning", "text-bg-info")
  toastEl.classList.add(`text-bg-${type}`)

  const toast = new bootstrap.Toast(toastEl, { delay: 3000 })
  toast.show()
}

class CalorieTracker {
  // Private fields
  #caloriesLimit = Storage.getCalorieLimit()
  #caloriesBalance = Storage.getCalorieBalance()
  #meals = Storage.getItems("meal")
  #workouts = Storage.getItems("workout")

  // Render stats on initialization
  constructor() {
    this.#renderStats()
  }

  // Add meal and update calories
  addMeal(meal) {
    this.#meals.push(meal)
    this.#caloriesBalance += meal.calories
    Storage.addItem(meal, "meal")
    this.#displayNewItem(meal, "meal")
    this.#renderStats()
  }

  // Add workout and update calories
  addWorkout(workout) {
    this.#workouts.push(workout)
    this.#caloriesBalance -= workout.calories
    Storage.addItem(workout, "workout")
    this.#displayNewItem(workout, "workout")
    this.#renderStats()
  }

  // Remove meal by id and update calories
  removeMeal(id) {
    const meal = this.#meals.find((m) => m.id === id)
    if (!meal) return

    this.#caloriesBalance -= meal.calories
    this.#meals = this.#meals.filter((m) => m.id !== id)
    Storage.removeItem(id, "meal")
    this.#renderStats()
  }

  // Remove workout by id and update calories
  removeWorkout(id) {
    const workout = this.#workouts.find((w) => w.id === id)
    if (!workout) return

    this.#caloriesBalance += workout.calories
    this.#workouts = this.#workouts.filter((w) => w.id !== id)
    Storage.removeItem(id, "workout")
    this.#renderStats()
  }

  // Reset tracker to initial state
  resetDay() {
    this.#caloriesBalance = 0
    this.#meals = []
    this.#workouts = []
    Storage.clearAll()
    this.#renderStats()
  }

  // Set a new calorie limit and update stats
  setLimit(calorieLimit) {
    this.#caloriesLimit = calorieLimit
    Storage.setCalorieLimit(calorieLimit)
    this.#renderStats()
  }

  // Load and display saved meals and workouts from localStorage
  loadItems() {
    this.#meals.forEach((meal) => this.#displayNewItem(meal, "meal"))
    this.#workouts.forEach((workout) => this.#displayNewItem(workout, "workout"))
  }

  // Display calories limit
  #displayCaloriesLimit() {
    const caloriesLimitEl = document.querySelector("#calories-limit")
    caloriesLimitEl.textContent = this.#caloriesLimit
  }

  // Display calories balance
  #displayCaloriesBalance() {
    const caloriesBalanceEl = document.querySelector("#calories-balance")
    caloriesBalanceEl.textContent = this.#caloriesBalance
    Storage.setCalorieBalance(this.#caloriesBalance)
  }

  // Display total calories consumed from meals
  #displayCaloriesConsumed() {
    const caloriesConsumedEl = document.querySelector("#calories-consumed")
    const consumed = this.#meals.reduce((total, meal) => total + meal.calories, 0)
    caloriesConsumedEl.textContent = consumed
  }

  // Display total calories burned from workouts
  #displayCaloriesBurned() {
    const caloriesBurnedEl = document.querySelector("#calories-burned")
    const burned = this.#workouts.reduce((total, workout) => total + workout.calories, 0)
    caloriesBurnedEl.textContent = burned
  }

  // Display remaining calories (limit - balance)
  #displayCaloriesRemaining() {
    const caloriesRemainingEl = document.querySelector("#calories-remaining")
    const remaining = this.#caloriesLimit - this.#caloriesBalance
    caloriesRemainingEl.textContent = remaining

    const cardBody = caloriesRemainingEl.parentElement
    cardBody.classList.toggle("bg-danger", remaining < 0)
    cardBody.classList.toggle("text-white", remaining < 0)
  }

  // Display calorie progress as a percentage of the limit
  #displayCaloriesProgress() {
    const calorieProgressEl = document.querySelector("#calorie-progress")
    const percentage = ((this.#caloriesBalance / this.#caloriesLimit) * 100).toFixed(2)
    const width = Math.min(percentage, 100)
    calorieProgressEl.textContent = `${width}%`
    calorieProgressEl.style.width = `${width}%`

    if (percentage < 70) {
      calorieProgressEl.style.backgroundColor = "#2d6a4f"
    } else if (percentage <= 100) {
      calorieProgressEl.style.backgroundColor = "#ff6b35"
    } else {
      calorieProgressEl.style.backgroundColor = "#dc3545"
    }
  }

  // Display newly added item (meal or workout)
  #displayNewItem(item, type) {
    const itemsContainer = document.querySelector(`#${type}-items`)

    // Card wrapper
    const itemCard = document.createElement("div")
    itemCard.classList.add("card", "my-2")
    itemCard.setAttribute("data-id", item.id)

    // Card body
    const itemCardBody = document.createElement("div")
    itemCardBody.classList.add("card-body")

    // Row wrapper
    const row = document.createElement("div")
    row.classList.add("d-flex", "justify-content-between", "align-items-center")

    // Left side (item name + calories)
    const leftGroup = document.createElement("div")
    leftGroup.classList.add("d-flex", "align-items-center", "gap-2", "flex-wrap")

    const itemName = document.createElement("p")
    itemName.classList.add("fs-5", "m-0")
    itemName.textContent = item.name

    const itemCalories = document.createElement("h2")
    itemCalories.classList.add("fs-2", "text-center", "px-4", "rounded-2", "text-white", "m-0")
    itemCalories.textContent = item.calories

    // Right side (delete button)
    const deleteButton = document.createElement("button")
    deleteButton.classList.add("delete", "btn", "btn-danger", "btn-sm")

    const deleteIcon = document.createElement("i")
    deleteIcon.classList.add("fa-solid", "fa-xmark")
    deleteButton.appendChild(deleteIcon)

    // Build the structure
    leftGroup.appendChild(itemName)
    leftGroup.appendChild(itemCalories)
    row.appendChild(leftGroup)
    row.appendChild(deleteButton)
    itemCardBody.appendChild(row)
    itemCard.appendChild(itemCardBody)

    // Add card to container
    itemsContainer.appendChild(itemCard)
  }

  // Render all calorie stats to the UI
  #renderStats() {
    this.#displayCaloriesLimit()
    this.#displayCaloriesBalance()
    this.#displayCaloriesConsumed()
    this.#displayCaloriesBurned()
    this.#displayCaloriesRemaining()
    this.#displayCaloriesProgress()
  }
}

// Represents a meal with unique id, name, and calories gain
class Meal {
  constructor(name, calories) {
    this.id = Date.now()
    this.name = name
    this.calories = calories
  }
}

// Represents a workout with unique id, name, and calories burned
class Workout {
  constructor(name, calories) {
    this.id = Date.now()
    this.name = name
    this.calories = calories
  }
}

// Handles saving and retrieving calorie data from localStorage
class Storage {
  static getCalorieLimit() {
    const savedCalorieLimit = localStorage.getItem("calorieLimit")
    return savedCalorieLimit ? +savedCalorieLimit : 2000
  }

  static setCalorieLimit(calorieLimit) {
    localStorage.setItem("calorieLimit", calorieLimit)
  }

  static getCalorieBalance() {
    const savedCalorieBalance = localStorage.getItem("calorieBalance")
    return savedCalorieBalance ? +savedCalorieBalance : 0
  }

  static setCalorieBalance(calorieBalance) {
    localStorage.setItem("calorieBalance", calorieBalance)
  }

  static getItems(type) {
    const savedItems = localStorage.getItem(type)
    return savedItems ? JSON.parse(savedItems) : []
  }

  static addItem(item, type) {
    const items = Storage.getItems(type)
    items.push(item)
    localStorage.setItem(type, JSON.stringify(items))
  }

  static removeItem(id, type) {
    const items = Storage.getItems(type)
    const filteredItems = items.filter((item) => item.id !== id)
    localStorage.setItem(type, JSON.stringify(filteredItems))
  }

  static clearAll() {
    localStorage.clear()
  }
}

// Main application class to handle UI and interactions
class App {
  #tracker = new CalorieTracker()

  constructor() {
    // Load all event listeners
    this.#loadEventListeners()
    // Load and display saved items from localStorage
    this.#tracker.loadItems()
  }

  #loadEventListeners() {
    // Listen for meal and workout form submission
    const mealFromEl = document.querySelector("#meal-form")
    const workoutFormEl = document.querySelector("#workout-form")
    mealFromEl.addEventListener("submit", this.#newItem.bind(this, "meal"))
    workoutFormEl.addEventListener("submit", this.#newItem.bind(this, "workout"))

    // Listen for meal and workout item delete
    const mealItemsEl = document.querySelector("#meal-items")
    const workoutItemsEl = document.querySelector("#workout-items")
    mealItemsEl.addEventListener("click", this.#removeItem.bind(this, "meal"))
    workoutItemsEl.addEventListener("click", this.#removeItem.bind(this, "workout"))

    // Listen for meal and workout filter input
    const filterMealEl = document.querySelector("#filter-meals")
    const filterWorkoutEl = document.querySelector("#filter-workouts")
    filterMealEl.addEventListener("input", this.#filterItems.bind(this, "meal"))
    filterWorkoutEl.addEventListener("input", this.#filterItems.bind(this, "workout"))

    // Listen for reset button click
    const resetDayEl = document.querySelector("#reset-day")
    resetDayEl.addEventListener("click", this.#reset.bind(this))

    // Listen for set limit form submission
    const limitFormEl = document.querySelector("#limit-form")
    limitFormEl.addEventListener("submit", this.#setLimit.bind(this))
  }

  // Handle new item (meal or workout) form submission
  #newItem(type, e) {
    e.preventDefault()

    const nameInput = document.querySelector(`#${type}-name`)
    const calorieInput = document.querySelector(`#${type}-calories`)

    if (!nameInput.value || !calorieInput.value) return

    if (type === "meal") {
      const meal = new Meal(nameInput.value, +calorieInput.value)
      this.#tracker.addMeal(meal)
    } else if (type === "workout") {
      const workout = new Workout(nameInput.value, +calorieInput.value)
      this.#tracker.addWorkout(workout)
    }

    nameInput.value = ""
    calorieInput.value = ""

    const collapseEl = document.querySelector(`#collapse-${type}`)
    const bsCollapse = new bootstrap.Collapse(collapseEl)
    bsCollapse.hide()

    showToast(`${type[0].toUpperCase() + type.slice(1)} added!`)
  }

  // Handle deleting an item (meal or workout)
  #removeItem(type, e) {
    if (e.target.closest(".delete")) {
      if (!confirm("Are you sure you want to delete this item?")) return

      const card = e.target.closest(".card")
      const id = +card.getAttribute("data-id")

      if (type === "meal") this.#tracker.removeMeal(id)
      if (type === "workout") this.#tracker.removeWorkout(id)

      showToast(`${type[0].toUpperCase() + type.slice(1)} removed!`, "danger")
      card.remove()
    }
  }

  // Handle filtering items (meal or workout)
  #filterItems(type, e) {
    const text = e.target.value.toLowerCase()
    const items = document.querySelectorAll(`#${type}-items .card`)

    items.forEach((item) => {
      const name = item.querySelector(".card-body p").textContent.toLowerCase()
      if (name.includes(text)) {
        item.style.display = "block"
      } else {
        item.style.display = "none"
      }
    })
  }

  // Handle resetting the calorie tracker
  #reset() {
    this.#tracker.resetDay()
    document.querySelector("#meal-items").innerHTML = ""
    document.querySelector("#workout-items").innerHTML = ""
    document.querySelector("#filter-meals").value = ""
    document.querySelector("#filter-workouts").value = ""
    showToast("Day has been reset!", "info")
  }

  // Handle setting a new calorie limit
  #setLimit(e) {
    e.preventDefault()

    const limit = document.querySelector("#limit")
    if (!limit || limit.value <= 0) return

    this.#tracker.setLimit(+limit.value)
    limit.value = ""

    const limitModalEl = document.querySelector("#limit-modal")
    const modal = bootstrap.Modal.getInstance(limitModalEl)
    modal.hide()

    showToast("Calorie limit updated!", "info")
    document.activeElement.blur()
  }
}

// Initialize app
const app = new App()
