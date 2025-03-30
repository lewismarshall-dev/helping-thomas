'use strict';

let last = { x: 0, y: 0 }; // initial cursor position
let imageList = []; // list to store loaded images
let index = 0; // index to track which image to animate in/out next

// Preload iamges to browser cache to avoid initial lagging
async function preloadImages(images) {
  // Creates <image> elements for each fetched image, each promise resolves once image loaded.
  const promises = images.map((image) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = image.download_url;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  });
  return Promise.all(promises);
}

document.addEventListener('DOMContentLoaded', async () => {
  let fadeOutDelay = 1000; // delay before fading out image: 1 second
  let transitionDuration = 750; // duration of image animation: 0.75 seconds
  document.documentElement.style.setProperty('--transition-duration', `${transitionDuration}ms`);

  try {
    // Fetch images from API
    const response = await fetch('https://picsum.photos/v2/list?limit=100');
    const images = await response.json();
    // Preloads images to browser cache
    const loadedImages = await preloadImages(images);

    // Once all images are loaded, store them for use in mouse movement animation
    loadedImages.forEach((img) => {
      img.className = 'img';
      imageList.push(img);
    });
  } catch (error) {
    console.error('Error:', error);
  }

  // Hide loading screen
  document.getElementById('loading').style.display = 'none';

  // Observe mouse movement
  document.addEventListener('mousemove', (event) => {
    const current = { x: event.clientX, y: event.clientY };

    // if mouse has moved more than 100px and images are loaded
    if (calcPositionDistance(last, current) > 100 && imageList.length) {
      const img = imageList[index].cloneNode();
      document.body.appendChild(img);

      // Position center of image at mouse cursor
      img.style.left = current.x - img.width / 2 + 'px';
      img.style.top = current.y - img.height / 2 + 'px';

      // Animate out: make images visible, scale up image
      requestAnimationFrame(() => {
        img.style.visibility = 'visible';
        img.style.transform = 'scale(1)';
      });

      // Animate out: after delay, scale down image and fade out
      setTimeout(() => {
        img.style.transform = 'scale(0.5)';
        img.style.opacity = 0;
      }, fadeOutDelay);

      // Remove image from DOM after fade out
      setTimeout(() => img.remove(), fadeOutDelay + transitionDuration);

      // Update cursor's last position and set index for next image to animate in/out
      last = current;
      index = (index + 1) % imageList.length;
    }
  });
});

function calcPositionDistance(last, current) {
  return Math.sqrt(Math.pow(current.x - last.x, 2) + Math.pow(current.y - last.y, 2));
}
