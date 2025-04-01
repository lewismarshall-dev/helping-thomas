'use strict';

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
let index = 0; // index to track which image to animate in/out next

const isTouchscreen =
  'ontouchstart' in window || // Check for touch event
  navigator.maxTouchPoints > 0 || // Check touch points for modern devices
  window.matchMedia('(pointer: coarse)').matches; // Check for coarse pointer (touchscreen)

document.addEventListener('DOMContentLoaded', async () => {
  let fadeOutDelay = 1000; // delay before fading out image: 1 second
  let transitionDuration = 750; // duration of image animation: 0.75 seconds
  document.documentElement.style.setProperty('--transition-duration', `${transitionDuration}ms`);

  const loading = document.getElementById('loading');
  const hero = document.getElementById('hero');

  try {
    // Preload local images
    const loadedImages = await preloadLocalImages();
    loadedImages.forEach((img) => {
      img.className = 'stamp';
      console.log(img.src);
      imageList.push(img);
    });
  } catch (error) {
    console.error('Error preloading images:', error);
  }

  // Hide loading screen
  loading.style.display = 'none';

  if (!isTouchscreen) {
    // Observe mouse movement
    hero.addEventListener('mousemove', (event) => {
      const current = { x: event.clientX, y: event.clientY };

      // if mouse has moved more than 100px and images are loaded
      if (calcPositionDistance(last, current) > 100 && imageList.length) {
        insertImage(hero, current, fadeOutDelay, transitionDuration);
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

function insertImage(parentElement, current, fadeOutDelay, transitionDuration) {
  const img = imageList[index].cloneNode();
  parentElement.appendChild(img);

  // Position center of image at mouse cursor
  img.style.left = current.x - img.width / 2 + 'px';
  img.style.top = current.y - img.height / 2 + 'px';

  // Animate out: make images visible, scale up image
  requestAnimationFrame(() => {
    img.style.visibility = 'visible';
    img.style.transform = 'scale(1)';
    console.log('image animated in at ', current);
  });

  // Animate out: after delay, scale down image and fade out
  setTimeout(() => {
    img.style.transform = 'scale(0.5)';
    img.style.opacity = 0;
  }, fadeOutDelay);

  // Remove image from DOM after fade out
  setTimeout(() => img.remove(), fadeOutDelay + transitionDuration);
  // Update cursor's last position and set index for next image to animate in/out
  last = { x: current.x, y: current.y };
  // Randomly select a new index for the next image
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * imageList.length);
  } while (newIndex === index);
  index = newIndex;
}
