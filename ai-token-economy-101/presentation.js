import "../src/style.css";

// Presentation Slide Engine

const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const slideNumHud = document.getElementById("slide-num-hud");
const slideProgress = document.getElementById("slide-progress");

let currentSlideIndex = 0;

// Initialize slide from hash (e.g. #slide-3 -> index 2)
function getIndexFromHash() {
  const hash = window.location.hash;
  if (hash) {
    const match = hash.match(/^#slide-(\d+)$/);
    if (match) {
      const pageNum = parseInt(match[1], 10);
      if (pageNum >= 1 && pageNum <= slides.length) {
        return pageNum - 1;
      }
    }
  }
  return 0;
}

// Function to update the view state (active class, hud, progress)
function updateSlideDOM(index) {
  slides.forEach((slide, idx) => {
    if (idx === index) {
      slide.classList.add("active");
    } else {
      slide.classList.remove("active");
    }
  });

  // Update HUD counter
  if (slideNumHud) {
    slideNumHud.textContent = `${index + 1} / ${slides.length}`;
  }

  // Update Progress Bar
  if (slideProgress) {
    const percent = slides.length > 1 ? (index / (slides.length - 1)) * 100 : 100;
    slideProgress.style.width = `${percent}%`;
  }

  // Sync URL hash without triggering scroll jumps
  const newHash = `#slide-${index + 1}`;
  if (window.location.hash !== newHash) {
    window.history.pushState(null, "", newHash);
  }
}

// Transition helper utilizing View Transitions API if available
function goToSlide(targetIndex, direction = "forward") {
  if (targetIndex < 0 || targetIndex >= slides.length) return;
  if (targetIndex === currentSlideIndex) return;

  const updateDOM = () => {
    currentSlideIndex = targetIndex;
    updateSlideDOM(currentSlideIndex);
  };

  // Check if browser supports View Transitions
  if (document.startViewTransition) {
    document.startViewTransition({
      update: updateDOM,
      types: [direction], // Adds transition type 'forward' or 'backward' for CSS targetting
    });
  } else {
    updateDOM();
  }
}

function nextSlide() {
  goToSlide(currentSlideIndex + 1, "forward");
}

function prevSlide() {
  goToSlide(currentSlideIndex - 1, "backward");
}

// Keyboard navigation listeners
window.addEventListener("keydown", (e) => {
  // Ignore keys if user is typing in inputs or textareas
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    nextSlide();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    prevSlide();
  }
});

// Click handlers for UI HUD buttons
if (nextBtn) {
  nextBtn.addEventListener("click", nextSlide);
}
if (prevBtn) {
  prevBtn.addEventListener("click", prevSlide);
}

// Support browser back/forward history navigation
window.addEventListener("hashchange", () => {
  const hashIndex = getIndexFromHash();
  if (hashIndex !== currentSlideIndex) {
    const direction = hashIndex > currentSlideIndex ? "forward" : "backward";
    goToSlide(hashIndex, direction);
  }
});

// Initialize on page load
currentSlideIndex = getIndexFromHash();
updateSlideDOM(currentSlideIndex);
