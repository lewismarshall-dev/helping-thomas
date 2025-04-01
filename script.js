'use strict';

const FADEOUT_DELAY = 1000; // delay before fading out image - milliseconds
const TRANSITION_DURATION = 750; // duration of stamp animation - milliseconds
const MIN_CURSOR_TRAVEL = 100; // minimum distance cursor must travel to trigger stamp - pixels
const MOBILE_FREQ = 125; // frequency of stamp insertion on mobile devices - milliseconds

const STAMP_DIR = 'assets/stamps/'; // directory where stamp images are stored
const STAMP_FILENAMES = [
  'Stamp_1_Blue.svg',
  'Stamp_1_Green.svg',
  'Stamp_1_Purple.svg',
  'Stamp_1_Red.svg',
  'Stamp_2_Blue.svg',
  'Stamp_2_Green.svg',
  'Stamp_2_Purple.svg',
  'Stamp_2_Red.svg',
  'Stamp_3_Blue.svg',
  'Stamp_3_Green.svg',
  'Stamp_3_Purple.svg',
  'Stamp_3_Red.svg',
  'Stamp_4_Blue.svg',
  'Stamp_4_Green.svg',
  'Stamp_4_Purple.svg',
  'Stamp_4_Red.svg',
];

let last = { x: 0, y: 0 }; // initial cursor position
let imageList = []; // list to store loaded images
let index = 0; // index to track which stamp to animate in/out next

const isTouchscreen =
  'ontouchstart' in window || // Check for touch event
  navigator.maxTouchPoints > 0 || // Check touch points for modern devices
  window.matchMedia('(pointer: coarse)').matches; // Check for coarse pointer (touchscreen)

document.addEventListener('DOMContentLoaded', async () => {
  document.documentElement.style.setProperty('--transition-duration', `${TRANSITION_DURATION}ms`);

  const loading = document.getElementById('loading');
  const hero = document.getElementById('hero');

  try {
    // Preload local images
    const loadedImages = await preloadLocalImages();
    loadedImages.forEach((img) => {
      img.className = 'stamp';
      imageList.push(img);
    });
  } catch (error) {
    console.error('Error preloading images:', error);
  }

  // Hide loading screen
  loading.style.display = 'none';

  if (isTouchscreen) {
    // Randomly insert stamp in hero section periodically
    let heroWidth = hero.clientWidth;
    let heroHeight = hero.clientHeight;
    let lastCalled = 0;
    const animateRandomStampInsert = (timestamp) => {
      if (timestamp - lastCalled >= MOBILE_FREQ) {
        // call insertStamp at a random position on the screen
        const randomPosition = {
          x: Math.random() * heroWidth,
          y: Math.random() * heroHeight,
        };
        console.log(randomPosition);
        insertStamp(hero, randomPosition, FADEOUT_DELAY, TRANSITION_DURATION);
        lastCalled = timestamp;
      }
      requestAnimationFrame(animateRandomStampInsert);
    };
    requestAnimationFrame(animateRandomStampInsert);

    // Observe touch event
    hero.addEventListener('touchstart', (event) => {
      // Insert stamp at touch position
      const touch = event.touches[0];
      const current = { x: touch.clientX, y: touch.clientY };
      insertStamp(hero, current, FADEOUT_DELAY, TRANSITION_DURATION);
    });
  } else {
    // Observe mouse movement
    hero.addEventListener('mousemove', (event) => {
      const current = { x: event.clientX, y: event.clientY };

      // if mouse has moved more than 100px and images are loaded
      if (calcPositionDistance(last, current) > MIN_CURSOR_TRAVEL) {
        insertStamp(hero, current, FADEOUT_DELAY, TRANSITION_DURATION);
      }
    });
  }
});

// Preload images from the local assets folder
async function preloadLocalImages() {
  const promises = STAMP_FILENAMES.map((filename) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = `${STAMP_DIR}${filename}`;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  });
  return Promise.all(promises);
}

function calcPositionDistance(last, current) {
  return Math.sqrt(Math.pow(current.x - last.x, 2) + Math.pow(current.y - last.y, 2));
}

function insertStamp(parentElement, position, FADEOUT_DELAY, TRANSITION_DURATION) {
  const img = imageList[index].cloneNode();
  parentElement.appendChild(img);

  // Position center of stamp at mouse cursor
  img.style.left = position.x - img.width / 2 + 'px';
  img.style.top = position.y - img.height / 2 + 'px';

  // Animate out: make images visible, scale up image
  requestAnimationFrame(() => {
    img.style.visibility = 'visible';
    img.style.transform = 'scale(1)';
  });

  // Animate out: after delay, scale down stamp and fade out
  setTimeout(
    () =>
      requestAnimationFrame(() => {
        img.style.transform = 'scale(0.5)';
        img.style.opacity = 0;
      }),
    FADEOUT_DELAY
  );

  // Remove stamp from DOM after fade out
  setTimeout(() => img.remove(), FADEOUT_DELAY + TRANSITION_DURATION);
  // Update cursor's last position and set index for next stamp to animate in/out
  last = { x: position.x, y: position.y };

  // Randomly select a new index for the next image
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * imageList.length);
  } while (newIndex === index);
  index = newIndex;
}
